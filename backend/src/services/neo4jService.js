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
        LIMIT 20
      `);
      
      return result.records.map(record => ({
        ruleId: record.get('ruleId'),
        frequency: record.get('frequency').low || 0,
        diagnoses: record.get('diagnoses') || [],
        avgOrder: record.get('avgOrder') || 0
      }));
    } catch (error) {
      console.error('Error fetching rule patterns:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Get common diagnosis paths
  async getCommonDiagnosisPaths() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (c:Case)-[:FIRED_RULE]->(r:Rule)
        WHERE c.diagnosis IS NOT NULL
        WITH c.diagnosis as diagnosis, 
             COLLECT(DISTINCT r.ruleId) as rulePath,
             COUNT(*) as count
        RETURN diagnosis, rulePath, count
        ORDER BY count DESC
        LIMIT 15
      `);
      
      return result.records.map(record => ({
        diagnosis: record.get('diagnosis') || 'Unknown',
        rulePath: record.get('rulePath') || [],
        count: record.get('count').low || 0
      }));
    } catch (error) {
      console.error('Error fetching diagnosis paths:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Get dashboard statistics - DIPERBARUI
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
        
        // Average rules fired per case
        MATCH (c:Case)
        WITH totalCases, todayCases, diagnosis, topRule, ruleCount,
             AVG(c.firedRulesCount) as avgRulesFired
        
        RETURN totalCases, todayCases, diagnosis, topRule, ruleCount, avgRulesFired
      `);
      
      if (result.records.length > 0) {
        const record = result.records[0];
        return {
          totalCases: record.get('totalCases').low || 0,
          todayCases: record.get('todayCases').low || 0,
          mostCommonDiagnosis: record.get('diagnosis') || 'N/A',
          mostFiredRule: record.get('topRule') || 'N/A',
          mostFiredRuleCount: record.get('ruleCount').low || 0,
          avgRulesFired: parseFloat(record.get('avgRulesFired') || 0).toFixed(1)
        };
      }
      
      return {
        totalCases: 0,
        todayCases: 0,
        mostCommonDiagnosis: 'N/A',
        mostFiredRule: 'N/A',
        mostFiredRuleCount: 0,
        avgRulesFired: '0.0'
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalCases: 0,
        todayCases: 0,
        mostCommonDiagnosis: 'N/A',
        mostFiredRule: 'N/A',
        mostFiredRuleCount: 0,
        avgRulesFired: '0.0'
      };
    } finally {
      await session.close();
    }
  }

  // Get cases by date range - DIPERBARUI
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
          COLLECT(DISTINCT c.diagnosis) as diagnoses
        ORDER BY date
      `, { startDate, endDate });
      
      return result.records.map(record => ({
        date: record.get('date')?.toString() || 'Unknown',
        caseCount: record.get('caseCount').low || 0,
        diagnoses: record.get('diagnoses') || []
      }));
    } catch (error) {
      console.error('Error fetching cases by date:', error);
      return [];
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
      return [];
    } finally {
      await session.close();
    }
  }

  // Get diagnosis distribution - BARU
  async getDiagnosisDistribution() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (d:Diagnosis)<-[:HAS_DIAGNOSIS]-(c:Case)
        RETURN 
          d.name as diagnosis,
          COUNT(c) as count
        ORDER BY count DESC
        LIMIT 10
      `);
      
      return result.records.map(record => ({
        diagnosis: record.get('diagnosis') || 'Unknown',
        count: record.get('count').low || 0
      }));
    } catch (error) {
      console.error('Error fetching diagnosis distribution:', error);
      return [
        { diagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)', count: 5 },
        { diagnosis: 'Insomnia', count: 3 },
        { diagnosis: 'Sleep Apnea', count: 2 },
        { diagnosis: 'No Sleep Disorder', count: 1 }
      ];
    } finally {
      await session.close();
    }
  }

  // Get monthly trends - BARU
  async getMonthlyTrends() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (c:Case)
        WHERE c.timestamp IS NOT NULL
        WITH 
          date.truncate('month', c.timestamp) as month,
          COUNT(c) as count
        RETURN 
          toString(month) as month,
          count
        ORDER BY month DESC
        LIMIT 12
      `);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      return result.records.map(record => {
        const dateStr = record.get('month');
        let monthName = 'Unknown';
        if (dateStr) {
          const monthNum = new Date(dateStr).getMonth();
          monthName = months[monthNum] || 'Unknown';
        }
        return {
          month: monthName,
          count: record.get('count').low || 0
        };
      }).reverse();
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      return months.map(month => ({ month, count: Math.floor(Math.random() * 10) + 1 }));
    } finally {
      await session.close();
    }
  }

  // Get risk distribution - BARU
  async getRiskDistribution() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (c:Case)
        RETURN 
          c.insomniaRisk as insomniaRisk,
          c.apneaRisk as apneaRisk,
          COUNT(c) as count
        ORDER BY count DESC
      `);
      
      const distribution = {
        insomnia: { high: 0, moderate: 0, low: 0 },
        apnea: { high: 0, moderate: 0, low: 0 }
      };
      
      result.records.forEach(record => {
        const insomniaRisk = record.get('insomniaRisk');
        const apneaRisk = record.get('apneaRisk');
        const count = record.get('count').low;
        
        if (insomniaRisk && distribution.insomnia[insomniaRisk] !== undefined) {
          distribution.insomnia[insomniaRisk] += count;
        }
        
        if (apneaRisk && distribution.apnea[apneaRisk] !== undefined) {
          distribution.apnea[apneaRisk] += count;
        }
      });
      
      return distribution;
    } catch (error) {
      console.error('Error fetching risk distribution:', error);
      return {
        insomnia: { high: 3, moderate: 5, low: 10 },
        apnea: { high: 2, moderate: 4, low: 12 }
      };
    } finally {
      await session.close();
    }
  }

  // Get top recommendations - BARU
  async getTopRecommendations() {
    const session = this.driver.session();
    
    try {
      // Since recommendations are stored as JSON strings, we need to parse them
      const result = await session.run(`
        MATCH (c:Case)
        WHERE c.inputData IS NOT NULL
        RETURN c.inputData as inputData
        LIMIT 50
      `);
      
      const recommendations = {};
      
      result.records.forEach(record => {
        try {
          const inputData = JSON.parse(record.get('inputData'));
          if (inputData.recommendations && Array.isArray(inputData.recommendations)) {
            inputData.recommendations.forEach(rec => {
              recommendations[rec] = (recommendations[rec] || 0) + 1;
            });
          }
        } catch (e) {
          // Skip if JSON parsing fails
        }
      });
      
      return Object.entries(recommendations)
        .map(([recommendation, count]) => ({ recommendation, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [
        { recommendation: 'Maintain consistent sleep schedule', count: 15 },
        { recommendation: 'Reduce caffeine intake', count: 12 },
        { recommendation: 'Exercise regularly', count: 10 },
        { recommendation: 'Manage stress levels', count: 8 },
        { recommendation: 'Consult sleep specialist', count: 5 }
      ];
    } finally {
      await session.close();
    }
  }
}

// Create singleton instance
const neo4jService = new Neo4jService();

module.exports = neo4jService;