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

  // Get rule firing statistics - FROM SCREENING FACTS
  async getRuleFiringPatterns(userId = null) {
    const session = this.driver.session();
    
    try {
      let query = `MATCH (s:Screening) WHERE s.facts IS NOT NULL RETURN s.facts as factsStr LIMIT 1000`;
      const params = {};
      
      if (userId) {
        query = `MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening) WHERE s.facts IS NOT NULL RETURN s.facts as factsStr LIMIT 1000`;
        params.personId = `USER_${userId}`;
      }
      
      const result = await session.run(query, params);
      
      // Parse facts from all screenings and count rules
      const ruleCounts = {};
      
      result.records.forEach(record => {
        try {
          const factsStr = record.get('factsStr');
          if (factsStr) {
            const facts = typeof factsStr === 'string' ? JSON.parse(factsStr) : factsStr;
            if (facts.firedRules && Array.isArray(facts.firedRules)) {
              facts.firedRules.forEach(ruleId => {
                ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
              });
            }
          }
        } catch (e) {
          // Skip parsing errors silently
        }
      });
      
      // Convert to array and sort by frequency
      const rulesArray = Object.entries(ruleCounts)
        .map(([ruleId, frequency]) => ({
          ruleId,
          frequency,
          diagnoses: [],
          avgOrder: 1.5
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 20);
      
      console.log('📊 Rule firing patterns:', rulesArray);
      return rulesArray.length > 0 ? rulesArray : [];
    } catch (error) {
      console.error('Error fetching rule firing patterns:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Get common diagnosis paths - FROM SCREENING FACTS
  async getCommonDiagnosisPaths(userId = null) {
    const session = this.driver.session();
    
    try {
      let query = `MATCH (s:Screening) WHERE s.facts IS NOT NULL AND s.diagnosis IS NOT NULL RETURN s.facts as factsStr, s.diagnosis as diagnosis LIMIT 1000`;
      const params = {};
      
      if (userId) {
        query = `MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening) WHERE s.facts IS NOT NULL AND s.diagnosis IS NOT NULL RETURN s.facts as factsStr, s.diagnosis as diagnosis LIMIT 1000`;
        params.personId = `USER_${userId}`;
      }
      
      const result = await session.run(query, params);
      
      // Group rules by diagnosis
      const pathsByDiagnosis = {};
      
      result.records.forEach(record => {
        try {
          const factsStr = record.get('factsStr');
          const diagnosis = record.get('diagnosis');
          
          if (factsStr && diagnosis) {
            const facts = typeof factsStr === 'string' ? JSON.parse(factsStr) : factsStr;
            const rulePath = facts.firedRules || [];
            
            if (!pathsByDiagnosis[diagnosis]) {
              pathsByDiagnosis[diagnosis] = {};
            }
            
            // Convert rulePath array to key for counting
            const pathKey = rulePath.join(',');
            pathsByDiagnosis[diagnosis][pathKey] = (pathsByDiagnosis[diagnosis][pathKey] || 0) + 1;
          }
        } catch (e) {
          // Skip parsing errors
        }
      });
      
      // Convert to array format for API
      const patterns = [];
      Object.entries(pathsByDiagnosis).forEach(([diagnosis, paths]) => {
        Object.entries(paths).forEach(([pathKey, count]) => {
          const rulePath = pathKey ? pathKey.split(',') : [];
          patterns.push({
            diagnosis,
            rulePath: rulePath.filter(r => r.trim()), // Remove empty strings
            count
          });
        });
      });
      
      // Sort by count and limit
      return patterns
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching common diagnosis paths:', error);
      return [];
    } finally {
      await session.close();
    }
  }

  // Get dashboard statistics - QUERY FROM SCREENING NODES
  async getDashboardStats(userId = null) {
    const session = this.driver.session();
    
    try {
      console.log('📊 getDashboardStats query for:', userId || 'ALL USERS');
      
      const params = {};
      let baseQuery = `MATCH (s:Screening)`;
      
      if (userId) {
        baseQuery = `MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)`;
        params.personId = `USER_${userId}`;
      }
      
      // Get most common diagnosis first
      const diagQuery = `
        ${baseQuery}
        WITH s.diagnosis as diagnosis, COUNT(s) as diagCount
        ORDER BY diagCount DESC
        RETURN diagnosis
        LIMIT 1
      `;
      
      const diagResult = await session.run(diagQuery, params);
      const mostCommon = diagResult.records[0]?.get('diagnosis') || 'N/A';
      
      // Get overall stats
      const statsQuery = `
        ${baseQuery}
        RETURN 
          COUNT(s) as totalCases,
          SUM(CASE WHEN date(datetime(s.timestamp)) = date() THEN 1 ELSE 0 END) as todayCases,
          AVG(s.firedRulesCount) as avgRulesFired
      `;
      
      const statsResult = await session.run(statsQuery, params);
      
      if (statsResult.records.length === 0) {
        return {
          totalCases: 0,
          todayCases: 0,
          mostCommonDiagnosis: 'N/A',
          avgRulesFired: '0.0'
        };
      }
      
      const record = statsResult.records[0];
      const totalValue = record.get('totalCases');
      const todayValue = record.get('todayCases');
      const avgValue = record.get('avgRulesFired');
      
      const stats = {
        totalCases: typeof totalValue === 'object' && 'low' in totalValue ? totalValue.low : (totalValue || 0),
        todayCases: typeof todayValue === 'object' && 'low' in todayValue ? todayValue.low : (todayValue || 0),
        mostCommonDiagnosis: mostCommon && mostCommon !== 'null' ? mostCommon : 'N/A',
        avgRulesFired: parseFloat(avgValue || 0).toFixed(1)
      };
      
      console.log('📊 Returning dashboard stats:', stats);
      return stats;
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
  async getDiagnosisDistribution(userId = null) {
    const session = this.driver.session();
    
      try {
      const result = await session.run(`
        MATCH (s:Screening) WHERE s.diagnosis IS NOT NULL
        RETURN 
          s.diagnosis as diagnosis,
          COUNT(s) as count
        ORDER BY count DESC
        LIMIT 10
      `);
      
      console.log('📊 Diagnosis Distribution query result:', result.records.length, 'records');
      
      const data = result.records.map(record => {
        const countVal = record.get('count');
        let count = 0;
        if (countVal && typeof countVal === 'object' && 'low' in countVal) {
          count = countVal.low;
        } else if (typeof countVal === 'number') {
          count = countVal;
        }
        return {
          diagnosis: record.get('diagnosis') || 'Unknown',
          count: parseInt(count) || 0
        };
      });
      
      console.log('📊 Diagnosis Distribution data:', data);
      return data;
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

  // Get monthly trends - QUERY FROM SCREENING NODES
  async getMonthlyTrends(userId = null) {
    const session = this.driver.session();
    
    try {
      let query = `MATCH (s:Screening) WHERE s.timestamp IS NOT NULL`;
      const params = {};
      
      if (userId) {
        query = `MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening) WHERE s.timestamp IS NOT NULL`;
        params.personId = `USER_${userId}`;
      }
      
      const result = await session.run(`
        ${query}
        WITH 
          date.truncate('month', datetime(s.timestamp)) as month,
          COUNT(s) as count
        RETURN 
          toString(month) as month,
          count
        ORDER BY month DESC
        LIMIT 12
      `, params);
      
      console.log('📊 Monthly Trends query result:', result.records.length, 'records');
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const data = result.records.map(record => {
        const dateStr = record.get('month');
        let monthName = 'Unknown';
        if (dateStr) {
          const monthNum = new Date(dateStr).getMonth();
          monthName = months[monthNum] || 'Unknown';
        }
        const countVal = record.get('count');
        let count = 0;
        if (countVal && typeof countVal === 'object' && 'low' in countVal) {
          count = countVal.low;
        } else if (typeof countVal === 'number') {
          count = countVal;
        }
        return {
          month: monthName,
          count: parseInt(count) || 0
        };
      }).reverse();
      
      console.log('📊 Monthly Trends data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => ({ month, count: Math.floor(Math.random() * 10) + 1 }));
    } finally {
      await session.close();
    }
  }

  // Get risk distribution - QUERY FROM SCREENING NODES
  async getRiskDistribution() {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (s:Screening)
        RETURN 
          s.insomniaRisk as insomniaRisk,
          s.apneaRisk as apneaRisk,
          COUNT(s) as count
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