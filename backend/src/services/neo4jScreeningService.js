const { driver } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');

class Neo4jScreeningService {
  constructor() {
    this.driver = driver;
  }

  /**
   * Create or update screening record in Neo4j
   * Linked to user via Person node
   */
  async createScreening(userId, inputData, results) {
    const session = this.driver.session();
    const screeningId = `SCREENING_${uuidv4()}`;
    const timestamp = new Date().toISOString();
    
    try {
      console.log('📊 Creating screening in Neo4j...');
      
      // Create Person node for user if not exists
      const personId = `USER_${userId}`;
      
      const result = await session.executeWrite(async tx => {
        // Merge Person node
        await tx.run(`
          MERGE (p:Person {personId: $personId})
          ON CREATE SET 
            p.createdAt = datetime($timestamp),
            p.totalScreenings = 0
          RETURN p
        `, { personId, timestamp });
        
        // Create Screening node
        await tx.run(`
          CREATE (s:Screening {
            screeningId: $screeningId,
            timestamp: datetime($timestamp),
            insomniaRisk: $insomniaRisk,
            apneaRisk: $apneaRisk,
            diagnosis: $diagnosis,
            inputData: $inputData,
            facts: $facts,
            recommendations: $recommendations,
            firedRulesCount: $firedRulesCount
          })
          RETURN s
        `, {
          screeningId,
          timestamp,
          insomniaRisk: results.insomnia_risk || 'unknown',
          apneaRisk: results.apnea_risk || 'unknown',
          diagnosis: results.diagnosis || 'unknown',
          inputData: JSON.stringify(inputData),
          facts: JSON.stringify(results),
          recommendations: JSON.stringify(results.recommendations || []),
          firedRulesCount: results.firedRules?.length || 0
        });
        
        // Link Person to Screening
        await tx.run(`
          MATCH (p:Person {personId: $personId})
          MATCH (s:Screening {screeningId: $screeningId})
          MERGE (p)-[r:HAS_SCREENING]->(s)
          SET r.createdAt = datetime($timestamp)
          RETURN r
        `, { personId, screeningId, timestamp });
        
        // Create Diagnosis node and link
        const diagnosis = results.diagnosis || 'unknown';
        await tx.run(`
          MERGE (d:Diagnosis {name: $diagnosis})
          ON CREATE SET d.createdAt = datetime($timestamp)
          RETURN d
        `, { diagnosis, timestamp });
        
        await tx.run(`
          MATCH (s:Screening {screeningId: $screeningId})
          MATCH (d:Diagnosis {name: $diagnosis})
          MERGE (s)-[r:HAS_DIAGNOSIS]->(d)
          SET r.createdAt = datetime($timestamp)
          RETURN r
        `, { screeningId, diagnosis, timestamp });
        
        // Create Rule nodes and relationships
        if (results.firedRules && results.firedRules.length > 0) {
          for (const ruleId of results.firedRules) {
            await tx.run(`
              MERGE (r:Rule {ruleId: $ruleId})
              ON CREATE SET r.createdAt = datetime($timestamp)
              RETURN r
            `, { ruleId, timestamp });
            
            await tx.run(`
              MATCH (s:Screening {screeningId: $screeningId})
              MATCH (r:Rule {ruleId: $ruleId})
              MERGE (s)-[fired:FIRED_RULE]->(r)
              SET fired.order = $order,
                  fired.timestamp = datetime($timestamp)
              RETURN fired
            `, { 
              screeningId, 
              ruleId, 
              order: results.firedRules.indexOf(ruleId) + 1, 
              timestamp 
            });
          }
        }
        
        // Update Person statistics
          await tx.run(`
            MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
            WITH p, COUNT(s) AS total
            SET p.totalScreenings = total,
                p.lastScreening = datetime($timestamp)
            RETURN total
          `, { personId, timestamp });
        
        return { screeningId, personId };
      });
      
      console.log(`✅ Screening ${screeningId} created successfully`);
      return screeningId;
      
    } catch (error) {
      console.error('❌ Error creating screening:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Get screening by ID
   */
  async getScreeningById(screeningId) {
    const session = this.driver.session();
    
    try {
      const result = await session.executeRead(async tx => {
        const response = await tx.run(`
          MATCH (s:Screening {screeningId: $screeningId})
          OPTIONAL MATCH (s)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
          OPTIONAL MATCH (s)-[:FIRED_RULE]->(r:Rule)
          RETURN 
            s as screening,
            COLLECT(DISTINCT d.name) as diagnoses,
            COLLECT(DISTINCT r.ruleId) as firedRules
        `, { screeningId });
        
        if (response.records.length === 0) return null;
        
        const record = response.records[0];
        const screening = record.get('screening').properties;
        
        return {
          ...screening,
          diagnoses: record.get('diagnoses'),
          firedRules: record.get('firedRules'),
          inputData: JSON.parse(screening.inputData),
          facts: JSON.parse(screening.facts),
          recommendations: JSON.parse(screening.recommendations)
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error getting screening:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Get user screenings with pagination
   */
  async getUserScreenings(userId, page = 1, limit = 10, filters = {}) {
    const session = this.driver.session();
    
    try {
      const personId = `USER_${userId}`;
      const offset = (page - 1) * limit;
      
      // Build filter conditions
      let filterCondition = '';
      const params = { personId, limit, offset };
      
      if (filters.diagnosis) {
        filterCondition += ` AND s.diagnosis = $diagnosis`;
        params.diagnosis = filters.diagnosis;
      }
      
      if (filters.startDate || filters.endDate) {
        if (filters.startDate) {
          filterCondition += ` AND s.timestamp >= datetime($startDate)`;
          params.startDate = filters.startDate;
        }
        if (filters.endDate) {
          filterCondition += ` AND s.timestamp <= datetime($endDate)`;
          params.endDate = filters.endDate;
        }
      }
      
      const [screenings, totalResult] = await Promise.all([
        session.executeRead(async tx => {
          const response = await tx.run(`
            MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
            ${filterCondition}
            OPTIONAL MATCH (s)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
            RETURN 
              s.screeningId as screeningId,
              s.timestamp as timestamp,
              s.diagnosis as diagnosis,
              s.insomniaRisk as insomniaRisk,
              s.apneaRisk as apneaRisk,
              s.recommendations as recommendations,
              s.firedRulesCount as firedRulesCount,
              d.name as diagnosisName
            ORDER BY s.timestamp DESC
            SKIP $offset
            LIMIT $limit
          `, params);
          
          return response.records.map(record => ({
            screeningId: record.get('screeningId'),
            timestamp: record.get('timestamp'),
            diagnosis: record.get('diagnosis'),
            insomniaRisk: record.get('insomniaRisk'),
            apneaRisk: record.get('apneaRisk'),
            recommendations: JSON.parse(record.get('recommendations') || '[]'),
            firedRulesCount: record.get('firedRulesCount').low,
            diagnosisName: record.get('diagnosisName')
          }));
        }),
        session.executeRead(async tx => {
          const response = await tx.run(`
            MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
            ${filterCondition}
            RETURN COUNT(s) as total
          `, params);
          
          return response.records[0].get('total').low;
        })
      ]);
      
      return {
        screenings,
        pagination: {
          page,
          limit,
          total: totalResult,
          totalPages: Math.ceil(totalResult / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user screenings:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Get screening statistics for user
   */
  async getUserScreeningStats(userId) {
    const session = this.driver.session();
    
    try {
      const personId = `USER_${userId}`;
      
      const result = await session.executeRead(async tx => {
        const response = await tx.run(`
          MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
          OPTIONAL MATCH (s)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
          WITH 
            COUNT(DISTINCT s) as totalScreenings,
            COLLECT(DISTINCT d.name) as diagnoses,
            AVG(s.firedRulesCount) as avgRulesFired
          
          MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
          WITH totalScreenings, diagnoses, avgRulesFired,
               s.diagnosis as diagnosis,
               COUNT(s) as diagnosisCount
          ORDER BY diagnosisCount DESC
          
          RETURN 
            totalScreenings,
            COLLECT({diagnosis: diagnosis, count: diagnosisCount}) as diagnosisDistribution,
            diagnoses,
            avgRulesFired
        `, { personId });
        
        if (response.records.length === 0) {
          return {
            totalScreenings: 0,
            diagnosisDistribution: [],
            avgRulesFired: 0
          };
        }
        
        const record = response.records[0];
        return {
          totalScreenings: record.get('totalScreenings').low,
          diagnosisDistribution: record.get('diagnosisDistribution').map(d => ({
            diagnosis: d.diagnosis,
            count: d.count.low
          })),
          avgRulesFired: parseFloat(record.get('avgRulesFired') || 0),
          uniqueDiagnoses: record.get('diagnoses').length
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Delete screening record
   */
  async deleteScreening(screeningId) {
    const session = this.driver.session();
    
    try {
      await session.executeWrite(async tx => {
        // Delete all relationships and the screening node
        await tx.run(`
          MATCH (s:Screening {screeningId: $screeningId})
          DETACH DELETE s
        `, { screeningId });
      });
      
      console.log(`✅ Screening ${screeningId} deleted`);
      return true;
    } catch (error) {
      console.error('Error deleting screening:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Get all screenings (for analytics/admin)
   */
  async getAllScreenings(page = 1, limit = 50, filters = {}) {
    const session = this.driver.session();
    
    try {
      const offset = (page - 1) * limit;
      
      let filterCondition = '';
      const params = { limit, offset };
      
      if (filters.diagnosis) {
        filterCondition += ` AND s.diagnosis = $diagnosis`;
        params.diagnosis = filters.diagnosis;
      }
      
      if (filters.startDate || filters.endDate) {
        if (filters.startDate) {
          filterCondition += ` AND s.timestamp >= datetime($startDate)`;
          params.startDate = filters.startDate;
        }
        if (filters.endDate) {
          filterCondition += ` AND s.timestamp <= datetime($endDate)`;
          params.endDate = filters.endDate;
        }
      }
      
      const screenings = await session.executeRead(async tx => {
        const response = await tx.run(`
          MATCH (s:Screening)
          ${filterCondition}
          OPTIONAL MATCH (s)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
          RETURN 
            s.screeningId as screeningId,
            s.timestamp as timestamp,
            s.diagnosis as diagnosis,
            s.insomniaRisk as insomniaRisk,
            s.apneaRisk as apneaRisk,
            s.recommendations as recommendations,
            s.firedRulesCount as firedRulesCount,
            d.name as diagnosisName
          ORDER BY s.timestamp DESC
          SKIP $offset
          LIMIT $limit
        `, params);
        
        return response.records.map(record => ({
          screeningId: record.get('screeningId'),
          timestamp: record.get('timestamp'),
          diagnosis: record.get('diagnosis'),
          insomniaRisk: record.get('insomniaRisk'),
          apneaRisk: record.get('apneaRisk'),
          recommendations: JSON.parse(record.get('recommendations') || '[]'),
          firedRulesCount: record.get('firedRulesCount') || 0,
          diagnosisName: record.get('diagnosisName')
        }));
      });

      const totalResult = await session.executeRead(async tx => {
        const response = await tx.run(`
          MATCH (s:Screening)
          ${filterCondition}
          RETURN COUNT(s) as total
        `, params);
        return response.records[0]?.get('total').low || 0;
      });

      return {
        screenings,
        pagination: {
          page,
          limit,
          total: totalResult,
          totalPages: Math.ceil(totalResult / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all screenings:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = new Neo4jScreeningService();
