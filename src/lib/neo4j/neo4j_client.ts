/**
 * Neo4j Client for Sleep Disorder KBS
 * Ported from kbs/neo4j_integration/neo4j_client.py
 * 
 * CONFIGURATION:
 * - Set environment variables or update the constants below
 * - NEO4J_URI: Connection URI (e.g., "bolt://localhost:7687" or "neo4j+s://xxx.databases.neo4j.io")
 * - NEO4J_USER: Database username
 * - NEO4J_PASSWORD: Database password
 * - NEO4J_DATABASE: Database name (default: "fp-sleepdisorder")
 */

import neo4j, { Driver, Session, ManagedTransaction } from "neo4j-driver";
import { ProcessedFacts, RawInput } from "../kbs/fact_preprocess";

// =========================
// CONFIGURABLE CONSTANTS
// =========================
// Use environment variables if available, otherwise fall back to defaults
const NEO4J_URI = import.meta.env.VITE_NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USER = import.meta.env.VITE_NEO4J_USER || "kbs_user";
const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD || "kbsPassword123";
const NEO4J_DATABASE = import.meta.env.VITE_NEO4J_DATABASE || "fp-sleepdisorder";

/**
 * Neo4j Client for logging sleep disorder diagnosis cases
 * 
 * This client creates a knowledge graph with the following structure:
 * - (:Person) nodes with patient data and diagnosis results
 * - (:Sleep_Disorder) nodes with codes: INS, OSA, MIX, NONE
 * - (:Rule) nodes representing fired inference rules
 * - (:Recommendation) nodes with lifestyle improvement suggestions
 * 
 * Relationships:
 * - (Person)-[HAS_SLEEP_DISORDER]->(Sleep_Disorder)
 * - (Person)-[TRIGGERED_RULE]->(Rule)
 * - (Person)-[LIFESTYLE_ISSUE]->(Recommendation)
 */
export class Neo4jClient {
    private driver: Driver;

    /**
     * Initialize Neo4j driver connection
     * @param uri Optional custom URI (overrides environment variable)
     * @param user Optional custom username (overrides environment variable)
     * @param password Optional custom password (overrides environment variable)
     */
    constructor(uri?: string, user?: string, password?: string) {
        const connectionUri = uri || NEO4J_URI;
        const connectionUser = user || NEO4J_USER;
        const connectionPassword = password || NEO4J_PASSWORD;

        this.driver = neo4j.driver(
            connectionUri,
            neo4j.auth.basic(connectionUser, connectionPassword)
        );
    }

    /**
     * Close the Neo4j driver connection
     */
    async close(): Promise<void> {
        await this.driver.close();
    }

    /**
     * Verify connection to Neo4j database
     * @returns true if connection successful, false otherwise
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.driver.verifyConnectivity();
            return true;
        } catch (error) {
            console.error("Neo4j connection failed:", error);
            return false;
        }
    }

    // ---------- HELPER: Determine disorder code ----------
    /**
     * Map diagnosis facts to Sleep_Disorder code
     * Priority: MIX > OSA > INS > NONE
     */
    private getDisorderCode(facts: ProcessedFacts): string {
        if (facts.diagnosis_mixed) return "MIX";
        if (facts.diagnosis_apnea && !facts.diagnosis_insomnia) return "OSA";
        if (facts.diagnosis_insomnia && !facts.diagnosis_apnea) return "INS";
        if (facts.diagnosis_none) return "NONE";
        // Fallback: if no clear diagnosis, treat as NONE
        return "NONE";
    }

    // ---------- HELPER: Create risk summary label ----------
    /**
     * Create risk summary string for HAS_SLEEP_DISORDER relationship
     * Example: "INS:high;OSA:moderate"
     */
    private getRiskLabel(facts: ProcessedFacts): string {
        const parts: string[] = [];
        if (facts.insomnia_risk) parts.push(`INS:${facts.insomnia_risk}`);
        if (facts.apnea_risk) parts.push(`OSA:${facts.apnea_risk}`);
        return parts.length > 0 ? parts.join(";") : "unknown";
    }

    // ---------- HELPER: Map recommendation to reason ----------
    /**
     * Map recommendation ID to reason label for LIFESTYLE_ISSUE relationship
     */
    private getReasonForRecommendation(recId: string): string {
        const reasonMap: { [key: string]: string } = {
            REC_SLEEP_HYGIENE: "sleep_issue",
            REC_PHYSICAL_ACTIVITY: "low_activity",
            REC_STRESS_MANAGEMENT: "high_stress",
            REC_WEIGHT_MANAGEMENT: "weight_issue",
            REC_APNEA_EVAL: "apnea_risk",
        };
        return reasonMap[recId] || "unspecified";
    }

    // ---------- PUBLIC: Push case to Neo4j ----------
    /**
     * Log a complete diagnosis case to Neo4j
     * 
     * @param personId Unique identifier for this person/case (e.g., "UI_a3b5c7d9")
     * @param rawInput Original user input data
     * @param facts Processed facts including diagnosis and recommendations
     * @param firedRules List of rule IDs that were triggered during inference
     * @throws Error if Neo4j operation fails
     */
    async pushCase(
        personId: string,
        rawInput: RawInput,
        facts: ProcessedFacts,
        firedRules: string[]
    ): Promise<void> {
        const disorderCode = this.getDisorderCode(facts);
        const riskLabel = this.getRiskLabel(facts);
        const recommendations = Array.from(facts.recommendations);

        const session: Session = this.driver.session({
            database: NEO4J_DATABASE
        });

        try {
            await session.executeWrite((tx: ManagedTransaction) =>
                this.txPushCase(
                    tx,
                    personId,
                    rawInput,
                    facts,
                    disorderCode,
                    riskLabel,
                    recommendations,
                    firedRules
                )
            );
            console.log(`✓ Case logged to Neo4j with person_id = ${personId}`);
        } catch (error) {
            console.error("✗ Failed to push to Neo4j:", error);
            throw error;
        } finally {
            await session.close();
        }
    }

    // ---------- TRANSACTION FUNCTION ----------
    /**
     * Execute all Neo4j operations for a single case within one transaction
     * This ensures atomicity - either all operations succeed or all fail
     */
    private async txPushCase(
        tx: ManagedTransaction,
        personId: string,
        rawInput: RawInput,
        facts: ProcessedFacts,
        disorderCode: string,
        riskLabel: string,
        recommendations: string[],
        firedRules: string[]
    ): Promise<void> {
        // ===== OPERATION 1: MERGE Person Node =====
        // Creates or updates the Person node with all patient data and diagnosis results
        await tx.run(
            `
            MERGE (p:Person {person_id: $personId})
            SET p.age              = $age,
                p.gender           = $gender,
                p.sleep_duration   = $sleepDuration,
                p.sleep_quality    = $sleepQuality,
                p.stress_level     = $stressLevel,
                p.activity_minutes = $activityMinutes,
                p.bmi_category     = $bmiCategory,
                p.bp_category      = $bpCategory,
                p.heart_rate       = $heartRate,
                p.daily_steps      = $dailySteps,
                p.insomnia_risk    = $insomniaRisk,
                p.apnea_risk       = $apneaRisk,
                p.lifestyle_issue_sleep     = $lisSleep,
                p.lifestyle_issue_stress    = $lisStress,
                p.lifestyle_issue_activity  = $lisActivity,
                p.lifestyle_issue_weight    = $lisWeight,
                p.diagnosis_insomnia = $diagIns,
                p.diagnosis_apnea    = $diagApnea,
                p.diagnosis_mixed    = $diagMix,
                p.diagnosis_none     = $diagNone
            `,
            {
                personId,
                age: rawInput.age,
                gender: rawInput.gender,
                sleepDuration: rawInput.sleepDuration,
                sleepQuality: rawInput.qualityOfSleep,
                stressLevel: rawInput.stressLevel,
                activityMinutes: rawInput.physicalActivity,
                bmiCategory: rawInput.bmiCategory,
                bpCategory: facts.bp_category,
                heartRate: rawInput.heartRate,
                dailySteps: rawInput.dailySteps,
                insomniaRisk: facts.insomnia_risk,
                apneaRisk: facts.apnea_risk,
                lisSleep: facts.lifestyle_issue_sleep || false,
                lisStress: facts.lifestyle_issue_stress || false,
                lisActivity: facts.lifestyle_issue_activity || false,
                lisWeight: facts.lifestyle_issue_weight || false,
                diagIns: facts.diagnosis_insomnia || false,
                diagApnea: facts.diagnosis_apnea || false,
                diagMix: facts.diagnosis_mixed || false,
                diagNone: facts.diagnosis_none || false,
            }
        );

        // ===== OPERATION 2: HAS_SLEEP_DISORDER Relationship =====
        // Links Person to Sleep_Disorder node (expects Sleep_Disorder nodes to pre-exist)
        // Python version uses MATCH for Sleep_Disorder, meaning it should already exist
        await tx.run(
            `
            MATCH (p:Person {person_id: $personId}),
                  (d:Sleep_Disorder {code: $code})
            MERGE (p)-[r:HAS_SLEEP_DISORDER]->(d)
            SET r.risk_summary = $riskSummary
            `,
            {
                personId,
                code: disorderCode,
                riskSummary: riskLabel,
            }
        );

        // ===== OPERATION 3: TRIGGERED_RULE Relationships =====
        // Creates relationships to Rule nodes (expects Rule nodes to pre-exist)
        if (firedRules.length > 0) {
            await tx.run(
                `
                MATCH (p:Person {person_id: $personId})
                WITH p
                UNWIND $ruleIds AS rid
                MATCH (r:Rule {id: rid})
                MERGE (p)-[:TRIGGERED_RULE]->(r)
                `,
                {
                    personId,
                    ruleIds: firedRules,
                }
            );
        }

        // ===== OPERATION 4: LIFESTYLE_ISSUE Relationships =====
        // Creates relationships to Recommendation nodes with reason property
        // (expects Recommendation nodes to pre-exist)
        if (recommendations.length > 0) {
            const relData = recommendations.map((recId) => ({
                id: recId,
                reason: this.getReasonForRecommendation(recId),
            }));

            await tx.run(
                `
                MATCH (p:Person {person_id: $personId})
                WITH p, $recs AS recs
                UNWIND recs AS recMap
                MATCH (r:Recommendation {id: recMap.id})
                MERGE (p)-[rel:LIFESTYLE_ISSUE]->(r)
                SET rel.reason = recMap.reason
                `,
                {
                    personId,
                    recs: relData,
                }
            );
        }
    }
}

/**
 * Helper function to create a Neo4j client instance
 * @returns Neo4jClient instance ready to use
 */
export const createNeo4jClient = (): Neo4jClient => {
    return new Neo4jClient();
};

/**
 * Check if Neo4j integration is enabled
 * @returns true if Neo4j credentials are configured
 */
export const isNeo4jEnabled = (): boolean => {
    return !!(NEO4J_URI && NEO4J_USER && NEO4J_PASSWORD);
};
