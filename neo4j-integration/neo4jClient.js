import neo4j from 'neo4j-driver';

export class Neo4jClient {
    constructor(uri, user, password) {
        this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    }

    async close() {
        await this.driver.close();
    }

    // ---------- HELPER: determine sleep_disorder code ----------
    static _getDisorderCode(facts) {
        /**
         * Mapping diagnosis boolean → node Sleep_Disorder.code
         * Priority:
         *   - MIX (if insomnia & apnea)
         *   - OSA
         *   - INS
         *   - NONE (if diagnosis_none True or no diagnosis)
         */
        if (facts.diagnosis_mixed) return "MIX";
        if (facts.diagnosis_apnea && !facts.diagnosis_insomnia) return "OSA";
        if (facts.diagnosis_insomnia && !facts.diagnosis_apnea) return "INS";
        if (facts.diagnosis_none) return "NONE";
        // fallback: if unclear, treat as NONE
        return "NONE";
    }

    static _getRiskLabel(facts) {
        /**
         * Summarize risk information into one string to store in HAS_SLEEP_DISORDER relationship.
         * Example: 'INS:high;OSA:moderate' or 'INS:high;OSA:high' etc.
         */
        const insRisk = facts.insomnia_risk;
        const apneaRisk = facts.apnea_risk;

        const parts = [];
        if (insRisk) parts.push(`INS:${insRisk}`);
        if (apneaRisk) parts.push(`OSA:${apneaRisk}`);

        return parts.length > 0 ? parts.join(';') : 'unknown';
    }

    static _reasonForRecommendation(recId, facts) {
        /** Provide reasonable reason label for LIFESTYLE_ISSUE edge. */
        const reasonMap = {
            "REC_SLEEP_HYGIENE": "sleep_issue",
            "REC_PHYSICAL_ACTIVITY": "low_activity",
            "REC_STRESS_MANAGEMENT": "high_stress",
            "REC_WEIGHT_MANAGEMENT": "weight_issue",
            "REC_APNEA_EVAL": "apnea_risk"
        };
        return reasonMap[recId] || "unspecified";
    }

    // ---------- PUBLIC: push one case to Neo4j ----------
    async pushCase(personId, rawInput, facts, firedRules) {
        /**
         * Save one case to Neo4j:
         *   - Node :Person
         *   - Relationship HAS_SLEEP_DISORDER -> :Sleep_Disorder
         *   - Relationship TRIGGERED_RULE -> :Rule
         *   - Relationship LIFESTYLE_ISSUE -> :Recommendation
         */
        const disorderCode = Neo4jClient._getDisorderCode(facts);
        const riskLabel = Neo4jClient._getRiskLabel(facts);
        const recommendations = facts.recommendations || [];

        const session = this.driver.session({ database: "neo4j" });
        try {
            await session.executeWrite(tx =>
                this._txPushCase(tx, personId, rawInput, facts, disorderCode, riskLabel, recommendations, firedRules)
            );
            console.log(`Case pushed to Neo4j with person_id = ${personId}`);
        } finally {
            await session.close();
        }
    }

    // ---------- TRANSACTION FUNCTION ----------
    async _txPushCase(tx, personId, rawInput, facts, disorderCode, riskLabel, recommendations, firedRules) {
        /**
         * All Neo4j operations for one case in single transaction.
         */

        // 1. Merge Person node with raw + derived properties
        await tx.run(`
            MERGE (p:Person {person_id: $person_id})
            SET p.age              = $age,
                p.gender           = $gender,
                p.sleep_duration   = $sleep_duration,
                p.sleep_quality    = $sleep_quality,
                p.stress_level     = $stress_level,
                p.activity_minutes = $activity_minutes,
                p.bmi_category     = $bmi_category,
                p.bp_category      = $bp_category,
                p.heart_rate       = $heart_rate,
                p.daily_steps      = $daily_steps,
                p.insomnia_risk    = $insomnia_risk,
                p.apnea_risk       = $apnea_risk,
                p.lifestyle_issue_sleep     = $lis_sleep,
                p.lifestyle_issue_stress    = $lis_stress,
                p.lifestyle_issue_activity  = $lis_activity,
                p.lifestyle_issue_weight    = $lis_weight,
                p.diagnosis_insomnia = $diag_ins,
                p.diagnosis_apnea    = $diag_apnea,
                p.diagnosis_mixed    = $diag_mix,
                p.diagnosis_none     = $diag_none
        `, {
            person_id: personId,
            age: facts.age || null,
            gender: facts.gender || null,
            sleep_duration: facts.sleep_duration || null,
            sleep_quality: facts.sleep_quality || null,
            stress_level: facts.stress_level || null,
            activity_minutes: facts.activity_minutes || null,
            bmi_category: facts.bmi_category || null,
            bp_category: facts.bp_category || null,
            heart_rate: facts.heart_rate || null,
            daily_steps: facts.daily_steps || null,
            insomnia_risk: facts.insomnia_risk || null,
            apnea_risk: facts.apnea_risk || null,
            lis_sleep: facts.lifestyle_issue_sleep || false,
            lis_stress: facts.lifestyle_issue_stress || false,
            lis_activity: facts.lifestyle_issue_activity || false,
            lis_weight: facts.lifestyle_issue_weight || false,
            diag_ins: facts.diagnosis_insomnia || false,
            diag_apnea: facts.diagnosis_apnea || false,
            diag_mix: facts.diagnosis_mixed || false,
            diag_none: facts.diagnosis_none || false,
        });

        // 2. Relationship HAS_SLEEP_DISORDER -> Sleep_Disorder
        await tx.run(`
            MATCH (p:Person {person_id: $person_id}),
                  (d:Sleep_Disorder {code: $code})
            MERGE (p)-[r:HAS_SLEEP_DISORDER]->(d)
            SET r.risk_summary = $risk_summary
        `, {
            person_id: personId,
            code: disorderCode,
            risk_summary: riskLabel,
        });

        // 3. Relationship TRIGGERED_RULE -> Rule
        if (firedRules && firedRules.length > 0) {
            await tx.run(`
                MATCH (p:Person {person_id: $person_id})
                WITH p
                UNWIND $rule_ids AS rid
                MATCH (r:Rule {id: rid})
                MERGE (p)-[:TRIGGERED_RULE]->(r)
            `, {
                person_id: personId,
                rule_ids: firedRules,
            });
        }

        // 4. Relationship LIFESTYLE_ISSUE -> Recommendation
        if (recommendations && recommendations.length > 0) {
            const relData = recommendations.map(recId => ({
                id: recId,
                reason: Neo4jClient._reasonForRecommendation(recId, facts),
            }));

            await tx.run(`
                MATCH (p:Person {person_id: $person_id})
                WITH p, $recs AS recs
                UNWIND recs AS recMap
                MATCH (r:Recommendation {id: recMap.id})
                MERGE (p)-[rel:LIFESTYLE_ISSUE]->(r)
                SET rel.reason = recMap.reason
            `, {
                person_id: personId,
                recs: relData,
            });
        }
    }
}