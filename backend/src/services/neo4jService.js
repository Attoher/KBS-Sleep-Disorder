const { driver } = require('../config/neo4j');

class Neo4jService {
  constructor() {
    this.driver = driver;
  }

  // Log a case to Neo4j
  async logCase(personId, inputData, facts, firedRules) {
    console.log('📊 Logging case to Neo4j...');
    
    const session = this.driver.session();
    const caseId = `CASE_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const timestamp = new Date().toISOString();
    
    try {
      console.log(`   Case ID: ${caseId}`);
      console.log(`   Person ID: ${personId}`);
      console.log(`   Rules fired: ${firedRules.length}`);
      
      // Start transaction
      const tx = session.beginTransaction();
      
      // Create or update Person node
      await tx.run(`
        MERGE (p:Person {personId: $personId})
        ON CREATE SET 
          p.createdAt = datetime($timestamp),
          p.firstCase = $caseId,
          p.totalCases = 1
        ON MATCH SET 
          p.lastCase = $caseId,
          p.updatedAt = datetime($timestamp),
          p.totalCases = COALESCE(p.totalCases, 0) + 1
        RETURN p.personId as personId
      `, { personId, timestamp, caseId });
      
      // Create Case node
      await tx.run(`
        CREATE (c:Case {
          caseId: $caseId,
          timestamp: datetime($timestamp),
          insomniaRisk: $insomniaRisk,
          apneaRisk: $apneaRisk,
          diagnosis: $diagnosis,
          inputData: $inputData,
          facts: $facts,
          firedRulesCount: $firedRulesCount
        })
        RETURN c.caseId as caseId
      `, {
        caseId,
        timestamp,
        insomniaRisk: facts.insomnia_risk || 'unknown',
        apneaRisk: facts.apnea_risk || 'unknown',
        diagnosis: facts.diagnosis || 'unknown',
        inputData: JSON.stringify(inputData),
        facts: JSON.stringify(facts),
        firedRulesCount: firedRules.length
      });
      
      // Link Person to Case
      await tx.run(`
        MATCH (p:Person {personId: $personId})
        MATCH (c:Case {caseId: $caseId})
        MERGE (p)-[r:HAS_CASE]->(c)
        SET r.createdAt = datetime($timestamp)
        RETURN type(r) as relationship
      `, { personId, caseId, timestamp });
      
      // Create Diagnosis node and link to Case
      const diagnosis = facts.diagnosis || 'unknown';
      await tx.run(`
        MERGE (d:Diagnosis {name: $diagnosis})
        ON CREATE SET d.createdAt = datetime($timestamp)
        ON MATCH SET d.updatedAt = datetime($timestamp)
      `, { diagnosis, timestamp });
      
      await tx.run(`
        MATCH (c:Case {caseId: $caseId})
        MATCH (d:Diagnosis {name: $diagnosis})
        MERGE (c)-[r:HAS_DIAGNOSIS]->(d)
        SET r.createdAt = datetime($timestamp)
      `, { caseId, diagnosis, timestamp });
      
      // Create Rule nodes and relationships
      for (const ruleId of firedRules) {
        await tx.run(`
          MERGE (r:Rule {ruleId: $ruleId})
          ON CREATE SET r.createdAt = datetime($timestamp)
          ON MATCH SET r.updatedAt = datetime($timestamp)
        `, { ruleId, timestamp });
        
        await tx.run(`
          MATCH (c:Case {caseId: $caseId})
          MATCH (r:Rule {ruleId: $ruleId})
          MERGE (c)-[fired:FIRED_RULE]->(r)
          SET fired.order = $order,
              fired.timestamp = datetime($timestamp)
        `, { caseId, ruleId, order: firedRules.indexOf(ruleId) + 1, timestamp });
      }
      
      // Create relationships between fired rules
      for (let i = 0; i < firedRules.length - 1; i++) {
        await tx.run(`
          MATCH (r1:Rule {ruleId: $rule1})
          MATCH (r2:Rule {ruleId: $rule2})
          MERGE (r1)-[n:NEXT]->(r2)
          SET n.weight = COALESCE(n.weight, 0) + 1,
              n.updatedAt = datetime($timestamp)
        `, { rule1: firedRules[i], rule2: firedRules[i + 1], timestamp });
      }
      
      // Commit transaction
      await tx.commit();
      
      console.log(`✅ Case ${caseId} logged to Neo4j successfully`);
      return caseId;
      
    } catch (error) {
      console.error('❌ Neo4j logging error:', error);
      await tx?.rollback();
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get rule firing statistics
  async getRuleFiringPatterns() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (r:Rule)<-[fired:FIRED_RULE]-(c:Case)
        RETURN 
          r.ruleId as ruleId,
          COUNT(fired) as frequency,
          COLLECT(DISTINCT c.diagnosis) as diagnoses,
          AVG(fired.order) as avgOrder
        ORDER BY frequency DESC
      `);
      
      return result.records.map(record => ({
        ruleId: record.get('ruleId'),
        frequency: record.get('frequency').low,
        diagnoses: record.get('diagnoses'),
        avgOrder: record.get('avgOrder')
      }));
    } catch (error) {
      console.error('Error fetching rule patterns:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get common diagnosis paths
  async getCommonDiagnosisPaths() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH path = (c:Case)-[:FIRED_RULE*1..5]->(r:Rule)
        WHERE c.diagnosis IS NOT NULL
        WITH c.diagnosis as diagnosis, 
             [node in nodes(path) WHERE node:Rule | node.ruleId] as rulePath,
             COUNT(*) as count
        WHERE size(rulePath) > 1
        RETURN diagnosis, rulePath, count
        ORDER BY count DESC
        LIMIT 20
      `);
      
      return result.records.map(record => ({
        diagnosis: record.get('diagnosis'),
        rulePath: record.get('rulePath'),
        count: record.get('count').low
      }));
    } catch (error) {
      console.error('Error fetching diagnosis paths:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        // Total cases
        MATCH (c:Case)
        WITH COUNT(c) as totalCases
        
        // Today's cases
        MATCH (c:Case)
        WHERE date(c.timestamp) = date()
        WITH totalCases, COUNT(c) as todayCases
        
        // Most common diagnosis
        MATCH (d:Diagnosis)<-[:HAS_DIAGNOSIS]-(c:Case)
        WITH totalCases, todayCases, d.name as diagnosis, COUNT(c) as count
        ORDER BY count DESC
        LIMIT 1
        
        // Most fired rule
        MATCH (r:Rule)<-[fired:FIRED_RULE]-(:Case)
        WITH totalCases, todayCases, diagnosis, 
             r.ruleId as topRule, COUNT(fired) as ruleCount
        ORDER BY ruleCount DESC
        LIMIT 1
        
        RETURN totalCases, todayCases, diagnosis, topRule, ruleCount
      `);
      
      if (result.records.length > 0) {
        const record = result.records[0];
        return {
          totalCases: record.get('totalCases').low,
          todayCases: record.get('todayCases').low,
          mostCommonDiagnosis: record.get('diagnosis'),
          mostFiredRule: record.get('topRule'),
          mostFiredRuleCount: record.get('ruleCount').low
        };
      }
      
      return {
        totalCases: 0,
        todayCases: 0,
        mostCommonDiagnosis: 'N/A',
        mostFiredRule: 'N/A',
        mostFiredRuleCount: 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get cases by date range
  async getCasesByDateRange(startDate, endDate) {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (c:Case)
        WHERE date(c.timestamp) >= date($startDate) 
          AND date(c.timestamp) <= date($endDate)
        RETURN 
          date(c.timestamp) as date,
          COUNT(c) as caseCount,
          COLLECT(c.diagnosis) as diagnoses
        ORDER BY date
      `, { startDate, endDate });
      
      return result.records.map(record => ({
        date: record.get('date').toString(),
        caseCount: record.get('caseCount').low,
        diagnoses: record.get('diagnoses')
      }));
    } catch (error) {
      console.error('Error fetching cases by date:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get rule network graph
  async getRuleNetwork() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (r1:Rule)-[n:NEXT]->(r2:Rule)
        WHERE n.weight > 0
        RETURN 
          r1.ruleId as source,
          r2.ruleId as target,
          n.weight as weight,
          n.updatedAt as lastUpdated
        ORDER BY n.weight DESC
        LIMIT 50
      `);
      
      return result.records.map(record => ({
        source: record.get('source'),
        target: record.get('target'),
        weight: record.get('weight').low || 0,
        lastUpdated: record.get('lastUpdated')?.toString()
      }));
    } catch (error) {
      console.error('Error fetching rule network:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get case details by ID
  async getCaseDetails(caseId) {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (c:Case {caseId: $caseId})
        OPTIONAL MATCH (c)-[:FIRED_RULE]->(r:Rule)
        OPTIONAL MATCH (c)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
        OPTIONAL MATCH (p:Person)-[:HAS_CASE]->(c)
        RETURN 
          c.caseId as caseId,
          c.timestamp as timestamp,
          c.insomniaRisk as insomniaRisk,
          c.apneaRisk as apneaRisk,
          c.diagnosis as diagnosis,
          c.firedRulesCount as firedRulesCount,
          COLLECT(DISTINCT r.ruleId) as firedRules,
          COLLECT(DISTINCT d.name) as diagnoses,
          p.personId as personId
      `, { caseId });
      
      if (result.records.length > 0) {
        const record = result.records[0];
        return {
          caseId: record.get('caseId'),
          timestamp: record.get('timestamp')?.toString(),
          insomniaRisk: record.get('insomniaRisk'),
          apneaRisk: record.get('apneaRisk'),
          diagnosis: record.get('diagnosis'),
          firedRulesCount: record.get('firedRulesCount').low,
          firedRules: record.get('firedRules'),
          diagnoses: record.get('diagnoses'),
          personId: record.get('personId')
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching case details:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Cleanup old data (optional)
  async cleanupOldData(daysToKeep = 90) {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (c:Case)
        WHERE datetime(c.timestamp) < datetime() - duration({days: $daysToKeep})
        DETACH DELETE c
        RETURN COUNT(c) as deletedCount
      `, { daysToKeep });
      
      const deletedCount = result.records[0]?.get('deletedCount').low || 0;
      console.log(`🗑️  Deleted ${deletedCount} old cases from Neo4j`);
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

// Create singleton instance
const neo4jService = new Neo4jService();

module.exports = neo4jService;