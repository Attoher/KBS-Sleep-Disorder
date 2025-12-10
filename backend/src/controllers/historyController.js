const neo4jScreeningService = require('../services/neo4jScreeningService');
const { driver } = require('../config/neo4j');

class HistoryController {
  // Get detailed history with filters
  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const {
        page = 1,
        limit = 20,
        diagnosis,
        startDate,
        endDate
      } = req.query;
      
      // Build filters
      const filters = {};
      if (diagnosis) filters.diagnosis = diagnosis;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      // Get screenings from Neo4j
      const result = await neo4jScreeningService.getUserScreenings(
        userId, 
        parseInt(page), 
        parseInt(limit),
        filters
      );
      
      // Get statistics
      const statistics = await this.getHistoryStatistics(userId);
      
      res.json({
        success: true,
        data: {
          screenings: result.screenings,
          pagination: result.pagination,
          statistics
        }
      });
      
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch history'
      });
    }
  }
  
  // Get history statistics
  async getHistoryStatistics(userId) {
    const session = driver.session();
    
    try {
      const personId = `USER_${userId}`;
      
      const result = await session.executeRead(async tx => {
        const response = await tx.run(`
          MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
          OPTIONAL MATCH (s)-[:HAS_DIAGNOSIS]->(d:Diagnosis)
          WITH 
            COUNT(DISTINCT s) as totalScreenings,
            COLLECT(DISTINCT d.name) as diagnoses
          
          MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
          WITH totalScreenings, diagnoses,
               s.diagnosis as diagnosis,
               COUNT(s) as diagnosisCount
          ORDER BY diagnosisCount DESC
          RETURN 
            totalScreenings,
            COLLECT({diagnosis: diagnosis, count: diagnosisCount}) as diagnosisDistribution,
            diagnoses
        `, { personId });
        
        if (response.records.length === 0) {
          return {
            totalScreenings: 0,
            diagnosisDistribution: [],
            topRecommendations: []
          };
        }
        
        const record = response.records[0];
        return {
          totalScreenings: record.get('totalScreenings').low || 0,
          diagnosisDistribution: record.get('diagnosisDistribution').map(d => ({
            diagnosis: d.diagnosis,
            count: d.count.low
          })),
          topRecommendations: [],
          mostCommonDiagnosis: record.get('diagnoses')[0] || 'N/A'
        };
      });
      
      return result;
    } catch (error) {
      console.error('Get statistics error:', error);
      return {
        totalScreenings: 0,
        diagnosisDistribution: [],
        topRecommendations: []
      };
    } finally {
      await session.close();
    }
  }
  
  // Get screening analytics
  async getAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const statistics = await this.getHistoryStatistics(userId);
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics'
      });
    }
  }
  
  // Add notes to screening (stored in Neo4j)
  async addNotes(req, res) {
    const session = driver.session();
    
    try {
      const { id } = req.params;
      const { notes } = req.body;
      
      await session.executeWrite(async tx => {
        await tx.run(`
          MATCH (s:Screening {screeningId: $screeningId})
          SET s.notes = $notes,
              s.notesUpdated = datetime()
          RETURN s
        `, { screeningId: id, notes });
      });
      
      res.json({
        success: true,
        message: 'Notes added successfully'
      });
      
    } catch (error) {
      console.error('Add notes error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add notes'
      });
    } finally {
      await session.close();
    }
  }
  
  // Archive screening
  async archiveScreening(req, res) {
    const session = driver.session();
    
    try {
      const { id } = req.params;
      
      await session.executeWrite(async tx => {
        await tx.run(`
          MATCH (s:Screening {screeningId: $screeningId})
          SET s.isArchived = true,
              s.archivedAt = datetime()
          RETURN s
        `, { screeningId: id });
      });
      
      res.json({
        success: true,
        message: 'Screening archived successfully'
      });
      
    } catch (error) {
      console.error('Archive screening error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to archive screening'
      });
    } finally {
      await session.close();
    }
  }
  
  // Unarchive screening
  async unarchiveScreening(req, res) {
    const session = driver.session();
    
    try {
      const { id } = req.params;
      
      await session.executeWrite(async tx => {
        await tx.run(`
          MATCH (s:Screening {screeningId: $screeningId})
          SET s.isArchived = false
          RETURN s
        `, { screeningId: id });
      });
      
      res.json({
        success: true,
        message: 'Screening unarchived successfully'
      });
      
    } catch (error) {
      console.error('Unarchive screening error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unarchive screening'
      });
    } finally {
      await session.close();
    }
  }
  
  // Get archived screenings
  async getArchived(req, res) {
    const session = driver.session();
    
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const personId = `USER_${userId}`;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const [screenings, totalResult] = await Promise.all([
        session.executeRead(async tx => {
          const response = await tx.run(`
            MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
            WHERE s.isArchived = true
            RETURN 
              s.screeningId as screeningId,
              s.timestamp as timestamp,
              s.diagnosis as diagnosis,
              s.insomniaRisk as insomniaRisk,
              s.apneaRisk as apneaRisk
            ORDER BY s.timestamp DESC
            SKIP $offset
            LIMIT $limit
          `, { personId, offset, limit });
          
          return response.records.map(record => ({
            screeningId: record.get('screeningId'),
            timestamp: record.get('timestamp'),
            diagnosis: record.get('diagnosis'),
            insomniaRisk: record.get('insomniaRisk'),
            apneaRisk: record.get('apneaRisk')
          }));
        }),
        session.executeRead(async tx => {
          const response = await tx.run(`
            MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
            WHERE s.isArchived = true
            RETURN COUNT(s) as total
          `, { personId });
          
          return response.records[0]?.get('total').low || 0;
        })
      ]);
      
      res.json({
        success: true,
        data: {
          screenings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalResult,
            totalPages: Math.ceil(totalResult / parseInt(limit))
          }
        }
      });
      
    } catch (error) {
      console.error('Get archived error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch archived screenings'
      });
    } finally {
      await session.close();
    }
  }
}

module.exports = new HistoryController();
