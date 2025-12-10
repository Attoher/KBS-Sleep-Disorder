const neo4jScreeningService = require('../services/neo4jScreeningService');
const { driver } = require('../config/neo4j');

// Helper function for getting history statistics
async function getHistoryStatistics(userId) {
  const session = driver.session();
  
  try {
    const personId = `USER_${userId}`;
    
    const result = await session.executeRead(async tx => {
      const response = await tx.run(`
        MATCH (p:Person {personId: $personId})-[:HAS_SCREENING]->(s:Screening)
        WITH COUNT(DISTINCT s) as totalScreenings,
             COLLECT(DISTINCT s.diagnosis) as diagnoses
        RETURN 
          totalScreenings,
          diagnoses[0] as mostCommonDiagnosis
      `, { personId });
      
      if (response.records.length === 0) {
        return {
          totalScreenings: 0,
          diagnosisDistribution: [],
          topRecommendations: [],
          mostCommonDiagnosis: 'N/A'
        };
      }
      
      const record = response.records[0];
      return {
        totalScreenings: record.get('totalScreenings').low || 0,
        diagnosisDistribution: [],
        topRecommendations: [],
        mostCommonDiagnosis: record.get('mostCommonDiagnosis') || 'N/A'
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

class HistoryController {
  // Get detailed history with filters
  async getHistory(req, res) {
    try {
      // If not authenticated, return empty history
      if (!req.user) {
        return res.json({
          success: true,
          data: {
            screenings: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              pages: 0
            },
            statistics: {
              totalScreenings: 0,
              diagnosisDistribution: [],
              topRecommendations: [],
              mostCommonDiagnosis: 'N/A'
            }
          }
        });
      }

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
      const statistics = await getHistoryStatistics(userId);
      
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
  
  // Get screening analytics
  async getAnalytics(req, res) {
    try {
      // If not authenticated, return empty analytics
      if (!req.user) {
        return res.json({
          success: true,
          data: {
            totalScreenings: 0,
            diagnosisDistribution: [],
            topRecommendations: [],
            mostCommonDiagnosis: 'N/A'
          }
        });
      }

      const userId = req.user.id;
      const statistics = await getHistoryStatistics(userId);
      
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
      // If not authenticated, return empty archived list
      if (!req.user) {
        return res.json({
          success: true,
          data: {
            screenings: [],
            pagination: {
              page: 1,
              limit: 20,
              total: 0,
              pages: 0
            }
          }
        });
      }

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
