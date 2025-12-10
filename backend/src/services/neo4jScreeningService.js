const { driver } = require('../config/neo4j');
const { v4: uuidv4 } = require('uuid');
const neo4j = require('neo4j-driver');

class Neo4jScreeningService {
  constructor() {
    this.driver = driver;
  }

  // Create screening record - DIPERBARUI untuk tanggal
  async createScreening(userId, inputData, results) {
    const session = this.driver.session();
    const screeningId = `SCREENING_${uuidv4()}`;
    const timestamp = new Date().toISOString();
    const readableTimestamp = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    try {
      console.log('📊 Creating screening in Neo4j...');
      
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
        
        // Create Screening node with formatted timestamp
        await tx.run(`
          CREATE (s:Screening {
            screeningId: $screeningId,
            timestamp: datetime($timestamp),
            readableTimestamp: $readableTimestamp,
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
          readableTimestamp,
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

  // Get user screenings - DIPERBARUI untuk filter bekerja
  async getUserScreenings(userId, page = 1, limit = 10, filters = {}) {
    const session = this.driver.session();
    
    try {
      const personId = `USER_${userId}`;
      const offset = Math.max(0, (parseInt(page) - 1) * parseInt(limit));
      
      // Build filter conditions
      let filterCondition = '';
      const params = { 
        personId, 
        limit: neo4j.int(Math.abs(parseInt(limit))), 
        offset: neo4j.int(Math.abs(parseInt(offset)))
      };
      
      if (filters.diagnosis && filters.diagnosis !== '') {
        filterCondition += ' AND s.diagnosis CONTAINS $diagnosis';
        params.diagnosis = filters.diagnosis;
      }
      
      if (filters.search && filters.search !== '') {
        filterCondition += ' AND (s.diagnosis CONTAINS $search OR s.screeningId CONTAINS $search)';
        params.search = filters.search;
      }
      
      if (filters.startDate && filters.startDate !== '') {
        filterCondition += ' AND date(s.timestamp) >= date($startDate)';
        params.startDate = filters.startDate;
      }
      
      if (filters.endDate && filters.endDate !== '') {
        filterCondition += ' AND date(s.timestamp) <= date($endDate)';
        params.endDate = filters.endDate;
      }
      
      // Get total count with filters
      const totalResult = await session.executeRead(async tx => {
        const countQuery = `
          MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
          WHERE 1=1 ${filterCondition}
          RETURN COUNT(s) as total
        `;
        
        const response = await tx.run(countQuery, params);
        return response.records.length > 0 ? response.records[0].get('total').low : 0;
      });
      
      // Get screenings with filters
      const screenings = await session.executeRead(async tx => {
        const query = `
          MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
          WHERE 1=1 ${filterCondition}
          RETURN 
            s.screeningId as screeningId,
            s.timestamp as timestamp,
            s.readableTimestamp as readableTimestamp,
            s.diagnosis as diagnosis,
            s.insomniaRisk as insomniaRisk,
            s.apneaRisk as apneaRisk,
            s.recommendations as recommendations,
            s.firedRulesCount as firedRulesCount
          ORDER BY s.timestamp DESC
          SKIP $offset
          LIMIT $limit
        `;
        
        const response = await tx.run(query, params);
        
        return response.records.map(record => {
          const timestamp = record.get('timestamp');
          const readableTimestamp = record.get('readableTimestamp');
          
          // Return ISO timestamp for proper date parsing in frontend
          let isoTimestamp = timestamp ? timestamp.toString() : null;
          
          return {
            screeningId: record.get('screeningId'),
            timestamp: isoTimestamp,
            readableTimestamp: readableTimestamp,
            diagnosis: record.get('diagnosis'),
            insomniaRisk: record.get('insomniaRisk'),
            apneaRisk: record.get('apneaRisk'),
            recommendations: JSON.parse(record.get('recommendations') || '[]'),
            firedRulesCount: record.get('firedRulesCount').low || 0
          };
        });
      });
      
      return {
        screenings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalResult,
          totalPages: Math.ceil(totalResult / limit) || 1
        }
      };
    } catch (error) {
      console.error('Error getting user screenings:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get single screening by ID
  async getScreeningById(screeningId) {
    const session = this.driver.session();
    
    try {
      const result = await session.executeRead(async tx => {
        const response = await tx.run(`
          MATCH (s:Screening {screeningId: $screeningId})
          OPTIONAL MATCH (s)-[:FIRED_RULE]->(r:Rule)
          RETURN 
            s as screening,
            COLLECT(DISTINCT r.ruleId) as firedRules
        `, { screeningId });
        
        if (response.records.length === 0) return null;
        
        const record = response.records[0];
        const screening = record.get('screening').properties;
        
        const timestamp = screening.timestamp;
        let displayTime = screening.readableTimestamp;
        
        if (!displayTime && timestamp) {
          const date = new Date(timestamp.toString());
          displayTime = date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        
        return {
          ...screening,
          readableTimestamp: displayTime,
          firedRules: record.get('firedRules') || [],
          inputData: JSON.parse(screening.inputData || '{}'),
          facts: JSON.parse(screening.facts || '{}'),
          recommendations: JSON.parse(screening.recommendations || '[]'),
          timestamp: displayTime
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

  // Delete screening
  async deleteScreening(screeningId, userId) {
    const session = this.driver.session();
    
    try {
      console.log(`✅ Screening ${screeningId} deleted`);
      
      const personId = `USER_${userId}`;
      
      await session.executeWrite(async tx => {
        await tx.run(`
          MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening {screeningId: $screeningId})
          DETACH DELETE s
        `, { personId, screeningId });
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting screening:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  // Get user screening statistics
  async getUserScreeningStats(userId) {
    const session = this.driver.session();
    
    try {
      const personId = `USER_${userId}`;
      
      const result = await session.executeRead(async tx => {
        const response = await tx.run(`
          MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
          WITH COUNT(s) as total, 
               COLLECT(s.diagnosis) as diagnoses,
               AVG(s.firedRulesCount) as avgRules
          RETURN 
            total,
            avgRules,
            [d IN diagnoses | {diagnosis: d, count: SIZE([x IN diagnoses WHERE x = d])}] as distribution
        `, { personId });
        
        if (response.records.length === 0) {
          return {
            totalScreenings: 0,
            avgRulesFired: 0,
            diagnosisDistribution: [],
            uniqueDiagnoses: 0
          };
        }
        
        const record = response.records[0];
        const distribution = record.get('distribution');
        
        // Get unique diagnoses
        const uniqueDiagnoses = [...new Set(distribution.map(d => d.diagnosis))];
        
        return {
          totalScreenings: record.get('total').low || 0,
          avgRulesFired: record.get('avgRules') || 0,
          diagnosisDistribution: uniqueDiagnoses.map(diagnosis => {
            const item = distribution.find(d => d.diagnosis === diagnosis);
            return {
              diagnosis,
              count: item?.count || 0
            };
          }),
          uniqueDiagnoses: uniqueDiagnoses.length
        };
      });
      
      return result;
    } catch (error) {
      console.error('Error getting screening stats:', error);
      return {
        totalScreenings: 0,
        avgRulesFired: 0,
        diagnosisDistribution: [],
        uniqueDiagnoses: 0
      };
    } finally {
      await session.close();
    }
  }
}

module.exports = new Neo4jScreeningService();