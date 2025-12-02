const neo4j = require('neo4j-driver');

class Neo4jClient {
  constructor() {
    this.uri = process.env.NEO4J_URI;
    this.user = process.env.NEO4J_USER;
    this.password = process.env.NEO4J_PASSWORD;
    this.database = process.env.NEO4J_DATABASE || 'neo4j';
    this.driver = null;
  }

  async connect() {
    try {
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.user, this.password)
      );
      
      await this.driver.verifyConnectivity();
      console.log('✅ Neo4j connection established');
      return this.driver;
    } catch (error) {
      console.error('❌ Failed to connect to Neo4j:', error.message);
      throw error;
    }
  }

  async close() {
    if (this.driver) {
      await this.driver.close();
    }
  }

  async testConnection() {
    try {
      const session = this.driver.session({ database: this.database });
      const result = await session.run('RETURN "Connected" AS message');
      await session.close();
      return { success: true, message: result.records[0].get('message') };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createTestNode() {
    const session = this.driver.session({ database: this.database });
    try {
      await session.run(`
        MERGE (t:TestNode {name: 'KBS_Test'})
        SET t.checked_at = datetime()
      `);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      await session.close();
    }
  }

  // Helper methods for sleep disorder codes
  static getDisorderCode(facts) {
    if (facts.diagnosis_mixed) return "MIX";
    if (facts.diagnosis_apnea && !facts.diagnosis_insomnia) return "OSA";
    if (facts.diagnosis_insomnia && !facts.diagnosis_apnea) return "INS";
    if (facts.diagnosis_none) return "NONE";
    return "NONE";
  }

  static getRiskLabel(facts) {
    const parts = [];
    if (facts.insomnia_risk) parts.push(`INS:${facts.insomnia_risk}`);
    if (facts.apnea_risk) parts.push(`OSA:${facts.apnea_risk}`);
    return parts.join(';') || 'unknown';
  }

  async pushCase(personId, rawInput, facts, firedRules) {
    const session = this.driver.session({ database: this.database });
    
    try {
      const disorderCode = Neo4jClient.getDisorderCode(facts);
      const riskLabel = Neo4jClient.getRiskLabel(facts);
      const recommendations = facts.recommendations || [];

      // Transaction
      const tx = session.beginTransaction();

      try {
        // 1. Create/Update Person node
        await tx.run(`
          MERGE (p:Person {person_id: $person_id})
          SET p.age = $age,
              p.gender = $gender,
              p.sleep_duration = $sleep_duration,
              p.sleep_quality = $sleep_quality,
              p.stress_level = $stress_level,
              p.activity_minutes = $activity_minutes,
              p.bmi_category = $bmi_category,
              p.bp_category = $bp_category,
              p.heart_rate = $heart_rate,
              p.daily_steps = $daily_steps,
              p.insomnia_risk = $insomnia_risk,
              p.apnea_risk = $apnea_risk,
              p.diagnosis_insomnia = $diagnosis_insomnia,
              p.diagnosis_apnea = $diagnosis_apnea,
              p.diagnosis_mixed = $diagnosis_mixed,
              p.diagnosis_none = $diagnosis_none,
              p.created_at = datetime()
        `, {
          person_id: personId,
          age: facts.age,
          gender: facts.gender,
          sleep_duration: facts.sleep_duration,
          sleep_quality: facts.sleep_quality,
          stress_level: facts.stress_level,
          activity_minutes: facts.activity_minutes,
          bmi_category: facts.bmi_category,
          bp_category: facts.bp_category,
          heart_rate: facts.heart_rate,
          daily_steps: facts.daily_steps,
          insomnia_risk: facts.insomnia_risk,
          apnea_risk: facts.apnea_risk,
          diagnosis_insomnia: facts.diagnosis_insomnia || false,
          diagnosis_apnea: facts.diagnosis_apnea || false,
          diagnosis_mixed: facts.diagnosis_mixed || false,
          diagnosis_none: facts.diagnosis_none || false
        });

        // 2. Link to Sleep Disorder
        await tx.run(`
          MERGE (sd:Sleep_Disorder {code: $code})
          SET sd.name = CASE $code
            WHEN 'INS' THEN 'Insomnia'
            WHEN 'OSA' THEN 'Obstructive Sleep Apnea'
            WHEN 'MIX' THEN 'Mixed Sleep Disorder'
            ELSE 'No Disorder'
          END
        `, { code: disorderCode });

        await tx.run(`
          MATCH (p:Person {person_id: $person_id})
          MATCH (sd:Sleep_Disorder {code: $code})
          MERGE (p)-[r:HAS_SLEEP_DISORDER]->(sd)
          SET r.risk_summary = $risk_summary,
              r.diagnosed_at = datetime()
        `, {
          person_id: personId,
          code: disorderCode,
          risk_summary: riskLabel
        });

        // 3. Create relationships for fired rules
        if (firedRules && firedRules.length > 0) {
          for (const ruleId of firedRules) {
            await tx.run(`
              MERGE (r:Rule {id: $rule_id})
              ON CREATE SET r.created_at = datetime()
              WITH r
              MATCH (p:Person {person_id: $person_id})
              MERGE (p)-[:TRIGGERED_RULE]->(r)
            `, {
              person_id: personId,
              rule_id: ruleId
            });
          }
        }

        // 4. Create recommendations
        for (const recId of recommendations) {
          const recName = this.getRecommendationName(recId);
          await tx.run(`
            MERGE (rec:Recommendation {id: $rec_id})
            SET rec.name = $rec_name,
                rec.description = $rec_desc,
                rec.category = $category
          `, {
            rec_id: recId,
            rec_name: recName.name,
            rec_desc: recName.description,
            category: recName.category
          });

          await tx.run(`
            MATCH (p:Person {person_id: $person_id})
            MATCH (rec:Recommendation {id: $rec_id})
            MERGE (p)-[r:LIFESTYLE_ISSUE]->(rec)
            SET r.reason = $reason,
                r.created_at = datetime()
          `, {
            person_id: personId,
            rec_id: recId,
            reason: recName.reason
          });
        }

        await tx.commit();
        return { success: true, personId, disorderCode };
      } catch (error) {
        await tx.rollback();
        throw error;
      }
    } finally {
      await session.close();
    }
  }

  getRecommendationName(recId) {
    const recommendations = {
      "REC_SLEEP_HYGIENE": {
        name: "Sleep Hygiene Improvement",
        description: "Improve sleep habits and environment",
        category: "lifestyle",
        reason: "sleep_issue"
      },
      "REC_PHYSICAL_ACTIVITY": {
        name: "Increase Physical Activity",
        description: "≥150 minutes of moderate exercise per week",
        category: "lifestyle",
        reason: "low_activity"
      },
      "REC_STRESS_MANAGEMENT": {
        name: "Stress Management",
        description: "Practice relaxation techniques",
        category: "lifestyle",
        reason: "high_stress"
      },
      "REC_WEIGHT_MANAGEMENT": {
        name: "Weight Management Program",
        description: "Diet and exercise for weight control",
        category: "medical",
        reason: "weight_issue"
      },
      "REC_APNEA_EVAL": {
        name: "Sleep Apnea Evaluation",
        description: "Consult healthcare provider for sleep study",
        category: "medical",
        reason: "apnea_risk"
      }
    };
    return recommendations[recId] || { name: recId, description: "", category: "other", reason: "unspecified" };
  }

  async getCaseHistory(limit = 100) {
    const session = this.driver.session({ database: this.database });
    
    try {
      const result = await session.run(`
        MATCH (p:Person)-[r:HAS_SLEEP_DISORDER]->(sd:Sleep_Disorder)
        OPTIONAL MATCH (p)-[:TRIGGERED_RULE]->(rule:Rule)
        OPTIONAL MATCH (p)-[:LIFESTYLE_ISSUE]->(rec:Recommendation)
        RETURN p, sd, 
               collect(DISTINCT rule.id) as rules,
               collect(DISTINCT rec.id) as recommendations,
               r.risk_summary as risk_summary
        ORDER BY p.created_at DESC
        LIMIT $limit
      `, { limit: neo4j.int(limit) });

      return result.records.map(record => ({
        person: record.get('p').properties,
        disorder: record.get('sd').properties,
        rules: record.get('rules'),
        recommendations: record.get('recommendations'),
        risk_summary: record.get('risk_summary')
      }));
    } finally {
      await session.close();
    }
  }
}

module.exports = new Neo4jClient();