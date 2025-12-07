const ruleEngine = require('../services/ruleEngine');
const neo4jService = require('../services/neo4jService');
const { Screening, User } = require('../models');
const { v4: uuidv4 } = require('uuid');

const DEMO_MODE = process.env.DEMO_MODE === 'true';

class ScreeningController {
  // Process screening request
  async processScreening(req, res) {
    try {
      const inputData = req.body;
      const userId = req.user?.id;
      const logToNeo4j = inputData.log_to_neo4j !== false; // Default to true
      
      console.log('🎯 Processing screening request...');
      console.log('   User ID:', userId || 'Guest');
      console.log('   Log to Neo4j:', logToNeo4j);
      
      // Validate input
      const validationErrors = ruleEngine.validateInput(inputData);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          errors: validationErrors
        });
      }
      
      // Run rule engine inference
      const results = ruleEngine.runForwardChaining(inputData);
      
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
        inputSummary: {
          age: inputData.Age || inputData.age,
          sleepDuration: inputData['Sleep Duration'] || inputData.sleepDuration,
          sleepQuality: inputData['Quality of Sleep'] || inputData.sleepQuality,
          stressLevel: inputData['Stress Level'] || inputData.stressLevel,
          bmiCategory: inputData['BMI Category'] || inputData.bmiCategory,
          bloodPressure: inputData['Blood Pressure'] || inputData.bloodPressure
        }
      };
      
      let neo4jCaseId = null;
      
      // Log to Neo4j if requested
      if (logToNeo4j && !DEMO_MODE) {
        try {
          const personId = userId ? `USER_${userId}` : `GUEST_${uuidv4().slice(0, 8)}`;
          neo4jCaseId = await neo4jService.logCase(
            personId,
            inputData,
            results,
            results.firedRules
          );
          console.log('   Neo4j Case ID:', neo4jCaseId);
        } catch (neo4jError) {
          console.error('⚠️  Neo4j logging failed, continuing without:', neo4jError.message);
          // Continue even if Neo4j logging fails
        }
      }
      
      // Save to PostgreSQL if user is logged in
      let savedScreening = null;
      if (userId && !DEMO_MODE) {
        try {
          savedScreening = await Screening.create({
            userId,
            inputData,
            insomniaRisk: results.insomnia_risk,
            apneaRisk: results.apnea_risk,
            diagnosis: results.diagnosis,
            recommendations: results.recommendations,
            firedRules: results.firedRules,
            lifestyleIssues: results.lifestyleIssues,
            neo4jCaseId,
            results: response
          });
          console.log('   Screening saved to PostgreSQL with ID:', savedScreening.id);
        } catch (dbError) {
          console.error('⚠️  PostgreSQL save failed:', dbError.message);
          // Continue even if DB save fails
        }
      }
      
      // Send success response
      res.json({
        success: true,
        message: 'Screening completed successfully',
        data: response,
        metadata: {
          timestamp: new Date().toISOString(),
          processingTime: `${Date.now() - req.startTime || 0}ms`,
          rulesFired: results.firedRules.length,
          neo4jCaseId,
          screeningId: savedScreening?.id,
          userId
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
  
  // Get screening history for logged-in user
  async getUserHistory(req, res) {
    try {
      if (DEMO_MODE || !req.user) {
        return res.json({
          success: true,
          data: {
            screenings: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            statistics: {
              totalScreenings: 0,
              diagnosisDistribution: [],
              riskDistribution: [],
              mostCommonDiagnosis: 'N/A'
            }
          }
        });
      }

      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'DESC',
        diagnosis,
        startDate,
        endDate
      } = req.query;
      
      // Build where clause
      const where = { userId };
      
      if (diagnosis) {
        where.diagnosis = diagnosis;
      }
      
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = new Date(startDate);
        if (endDate) where.createdAt[Op.lte] = new Date(endDate);
      }
      
      // Calculate pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // Get screenings with pagination
      const { count, rows: screenings } = await Screening.findAndCountAll({
        where,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: [
          'id',
          'diagnosis',
          'insomniaRisk',
          'apneaRisk',
          'recommendations',
          'firedRules',
          'neo4jCaseId',
          'createdAt'
        ]
      });
      
      // Get summary statistics
      const diagnosisStats = await Screening.findAll({
        where: { userId },
        attributes: [
          'diagnosis',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['diagnosis'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
      });
      
      const riskStats = await Screening.findAll({
        where: { userId },
        attributes: [
          'insomniaRisk',
          'apneaRisk',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['insomniaRisk', 'apneaRisk']
      });
      
      res.json({
        success: true,
        data: {
          screenings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages: Math.ceil(count / parseInt(limit))
          },
          statistics: {
            totalScreenings: count,
            diagnosisDistribution: diagnosisStats,
            riskDistribution: riskStats,
            mostCommonDiagnosis: diagnosisStats[0]?.diagnosis || 'N/A'
          }
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
  
  // Get single screening by ID
  async getScreeningById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const screening = await Screening.findOne({
        where: { id, userId },
        include: [{
          model: User,
          attributes: ['id', 'name', 'email']
        }]
      });
      
      if (!screening) {
        return res.status(404).json({
          success: false,
          error: 'Screening not found'
        });
      }
      
      // Try to get Neo4j details if case ID exists
      let neo4jDetails = null;
      if (screening.neo4jCaseId) {
        try {
          neo4jDetails = await neo4jService.getCaseDetails(screening.neo4jCaseId);
        } catch (neo4jError) {
          console.warn('Could not fetch Neo4j details:', neo4jError.message);
        }
      }
      
      res.json({
        success: true,
        data: {
          screening,
          neo4jDetails
        }
      });
      
    } catch (error) {
      console.error('Get screening error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch screening details'
      });
    }
  }
  
  // Export history in different formats
  async exportHistory(req, res) {
    try {
      const userId = req.user.id;
      const { format = 'json' } = req.query;
      
      // Get all screenings for the user
      const screenings = await Screening.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        attributes: [
          'id',
          'diagnosis',
          'insomniaRisk',
          'apneaRisk',
          'recommendations',
          'firedRules',
          'lifestyleIssues',
          'inputData',
          'createdAt'
        ]
      });
      
      if (format === 'csv') {
        // Generate CSV
        const csvData = screenings.map(s => ({
          Date: s.createdAt.toISOString().split('T')[0],
          Time: s.createdAt.toTimeString().split(' ')[0],
          Diagnosis: s.diagnosis,
          'Insomnia Risk': s.insomniaRisk,
          'Apnea Risk': s.apneaRisk,
          'Sleep Duration': s.inputData?.sleepDuration || s.inputData?.['Sleep Duration'] || 'N/A',
          'Sleep Quality': s.inputData?.sleepQuality || s.inputData?.['Quality of Sleep'] || 'N/A',
          'Stress Level': s.inputData?.stressLevel || s.inputData?.['Stress Level'] || 'N/A',
          'BMI Category': s.inputData?.bmiCategory || s.inputData?.['BMI Category'] || 'N/A',
          Recommendations: s.recommendations?.join('; ') || '',
          'Rules Fired': s.firedRules?.join(', ') || ''
        }));
        
        const { createArrayCsvWriter } = require('csv-writer');
        const csvWriter = createArrayCsvWriter({
          path: 'temp/history.csv',
          header: Object.keys(csvData[0] || {})
        });
        
        await csvWriter.writeRecords(csvData);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=sleep-health-history.csv');
        res.download('temp/history.csv');
        
      } else if (format === 'pdf') {
        // Generate PDF
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sleep-health-history.pdf');
        
        doc.pipe(res);
        
        // Add content to PDF
        doc.fontSize(20).text('Sleep Health Screening History', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.text(`Total Screenings: ${screenings.length}`);
        doc.moveDown();
        
        screenings.forEach((screening, index) => {
          doc.fontSize(14).text(`Screening ${index + 1}: ${screening.diagnosis}`);
          doc.fontSize(10).text(`Date: ${screening.createdAt.toLocaleDateString()}`);
          doc.text(`Insomnia Risk: ${screening.insomniaRisk}`);
          doc.text(`Apnea Risk: ${screening.apneaRisk}`);
          doc.moveDown();
        });
        
        doc.end();
        
      } else {
        // Default JSON response
        res.json({
          success: true,
          data: screenings
        });
      }
      
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({
        success: false,
        error: 'Export failed'
      });
    }
  }
  
  // Delete screening
  async deleteScreening(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const screening = await Screening.findOne({ where: { id, userId } });
      
      if (!screening) {
        return res.status(404).json({
          success: false,
          error: 'Screening not found'
        });
      }
      
      await screening.destroy();
      
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
  
  // Get rule engine information
  async getRuleEngineInfo(req, res) {
    try {
      const allRules = ruleEngine.getAllRules();
      const ruleDescriptions = ruleEngine.getRuleDescriptions();
      
      res.json({
        success: true,
        data: {
          totalRules: allRules.length,
          rules: allRules,
          descriptions: ruleDescriptions,
          categories: ['Insomnia', 'Apnea', 'Lifestyle', 'Diagnosis', 'Recommendation']
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
}

// Add middleware to track processing time
ScreeningController.prototype.processScreening = (function(original) {
  return function(req, res) {
    req.startTime = Date.now();
    return original.call(this, req, res);
  };
})(ScreeningController.prototype.processScreening);

module.exports = new ScreeningController();