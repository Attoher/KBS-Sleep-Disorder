const ruleEngine = require('../services/ruleEngine');
const neo4jScreeningService = require('../services/neo4jScreeningService');
const neo4jService = require('../services/neo4jService');
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid');

const DEMO_MODE = process.env.DEMO_MODE === 'true';

class ScreeningController {
  // Process screening request
  async processScreening(req, res) {
    try {
      const inputData = req.body;
      const userId = req.user?.id;
      const isGuest = !userId;
      const logToNeo4j = inputData.log_to_neo4j !== false;
      
      console.log('🎯 Processing screening request...');
      console.log('   User ID:', userId || 'Guest');
      
      // Run rule engine inference
      let results;
      if (isGuest) {
        results = this.generateDummyResults(inputData);
      } else {
        results = ruleEngine.runForwardChaining(inputData);
      }
      
      // Prepare response
      const response = {
        diagnosis: results.diagnosis,
        insomniaRisk: results.insomnia_risk || 'unknown',
        apneaRisk: results.apnea_risk || 'unknown',
        lifestyleIssues: results.lifestyleIssues || {
          sleep: false,
          stress: false,
          activity: false,
          weight: false
        },
        recommendations: results.recommendations || [],
        firedRules: results.firedRules || [],
        inputData: inputData
      };
      
      let screeningId = null;
      
      // Save to Neo4j if user is authenticated
      if (userId && logToNeo4j && !DEMO_MODE) {
        try {
          screeningId = await neo4jScreeningService.createScreening(userId, inputData, results);
          await neo4jService.logCase(`USER_${userId}`, inputData, results, results.firedRules || []);
          console.log('   Neo4j Screening ID:', screeningId);
        } catch (neo4jError) {
          console.error('⚠️  Neo4j save failed:', neo4jError.message);
        }
      }
      
      res.json({
        success: true,
        message: 'Screening completed successfully',
        data: response,
        metadata: {
          timestamp: new Date().toISOString(),
          screeningId,
          userId,
          isGuest
        }
      });
      
    } catch (error) {
      console.error('❌ Screening processing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process screening. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  // Get screening history - DIPERBARUI untuk filter bekerja
  async getUserHistory(req, res) {
    try {
      if (DEMO_MODE || !req.user) {
        return res.json({
          success: true,
          data: {
            screenings: [
              {
                screeningId: 'DEMO_001',
                timestamp: new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                diagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)',
                insomniaRisk: 'high',
                apneaRisk: 'moderate',
                recommendations: ['Maintain consistent sleep schedule', 'Consult specialist'],
                firedRulesCount: 5
              }
            ],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
            statistics: {
              totalScreenings: 1,
              diagnosisDistribution: [{ diagnosis: 'Mixed Sleep Disorder', count: 1 }],
              avgRulesFired: 5.0,
              uniqueDiagnoses: 1
            }
          }
        });
      }

      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 10, 
        diagnosis,
        search,
        startDate,
        endDate
      } = req.query;
      
      // Build filters
      const filters = {};
      if (diagnosis) filters.diagnosis = diagnosis;
      if (search) filters.search = search;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      // Get screenings with filters
      const result = await neo4jScreeningService.getUserScreenings(
        userId, 
        parseInt(page), 
        parseInt(limit),
        filters
      );
      
      // Get statistics
      const stats = await neo4jScreeningService.getUserScreeningStats(userId);
      
      res.json({
        success: true,
        data: {
          screenings: result.screenings,
          pagination: result.pagination,
          statistics: stats
        }
      });
      
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch screening history'
      });
    }
  }
  
  // Get single screening by ID - DIPERBARUI
  async getScreeningById(req, res) {
    try {
      const { id } = req.params;
      
      // If demo mode, return dummy data
      if (DEMO_MODE) {
        return res.json({
          success: true,
          data: {
            screeningId: id,
            timestamp: new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            diagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)',
            insomniaRisk: 'high',
            apneaRisk: 'moderate',
            inputData: {
              age: 45,
              sleepDuration: 4.5,
              sleepQuality: 3,
              stressLevel: 8
            },
            facts: {
              diagnosis: 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)',
              insomnia_risk: 'high',
              apnea_risk: 'moderate'
            },
            recommendations: ['Maintain consistent sleep schedule', 'Consult specialist'],
            firedRules: ['R1', 'R3', 'R5', 'R12', 'R15'],
            firedRulesCount: 5
          }
        });
      }

      const screening = await neo4jScreeningService.getScreeningById(id);
      
      if (!screening) {
        return res.status(404).json({
          success: false,
          error: 'Screening not found'
        });
      }
      
      res.json({
        success: true,
        data: screening
      });
      
    } catch (error) {
      console.error('Get screening error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch screening details'
      });
    }
  }

  // Delete screening
  async deleteScreening(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      await neo4jScreeningService.deleteScreening(id, userId);
      
      res.json({
        success: true,
        message: 'Screening deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete screening error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete screening'
      });
    }
  }

  // Export screening history
  async exportHistory(req, res) {
    try {
      const userId = req.user.id;
      const { format = 'csv' } = req.query;
      
      // Get all user screenings
      const result = await neo4jScreeningService.getUserScreenings(userId, 1, 1000);
      const screenings = result.screenings;
      
      if (format === 'csv') {
        const headers = [
          'Date', 'Diagnosis', 'Insomnia Risk', 'Sleep Apnea Risk',
          'Sleep Duration', 'Sleep Quality', 'Stress Level', 'BMI Category',
          'Recommendations', 'Rules Fired'
        ];

        const rows = screenings.map(s => [
          s.timestamp || s.createdAt || 'N/A',
          s.diagnosis || 'N/A',
          s.insomniaRisk || 'N/A',
          s.apneaRisk || 'N/A',
          s.inputData?.sleepDuration || s.inputData?.['Sleep Duration'] || 'N/A',
          s.inputData?.sleepQuality || s.inputData?.['Quality of Sleep'] || 'N/A',
          s.inputData?.stressLevel || s.inputData?.['Stress Level'] || 'N/A',
          s.inputData?.bmiCategory || s.inputData?.['BMI Category'] || 'N/A',
          (s.recommendations || []).join('; '),
          (s.firedRules || []).join(', ')
        ]);

        const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
        const csvString = [headers.join(',')]
          .concat(rows.map(row => row.map(escape).join(',')))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=sleep-health-history.csv');
        return res.send(csvString);
      }
      
      // Default JSON export
      res.json({
        success: true,
        data: screenings
      });
      
    } catch (error) {
      console.error('Export history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export history'
      });
    }
  }

  // Get rule engine info
  async getRuleEngineInfo(req, res) {
    try {
      const ruleDescriptions = ruleEngine.getRuleDescriptions();
      
      res.json({
        success: true,
        data: {
          totalRules: ruleDescriptions.length,
          rules: ruleDescriptions,
          engineVersion: '1.0.0'
        }
      });
      
    } catch (error) {
      console.error('Get rule engine info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rule engine information'
      });
    }
  }

  // Helper method for generating dummy results
  generateDummyResults(inputData) {
    return {
      diagnosis: 'Sleep Disorder Detected (Demo Mode)',
      insomnia_risk: 'moderate',
      apnea_risk: 'low',
      lifestyleIssues: {
        sleep: true,
        stress: false,
        activity: false,
        weight: false
      },
      recommendations: [
        'Maintain consistent sleep schedule',
        'Create a relaxing bedtime routine',
        'Limit screen time before bed'
      ],
      firedRules: ['R1', 'R3', 'R5'],
      facts: {
        diagnosis: 'Sleep Disorder Detected (Demo Mode)',
        insomnia_risk: 'moderate',
        apnea_risk: 'low'
      }
    };
  }
}

module.exports = new ScreeningController();