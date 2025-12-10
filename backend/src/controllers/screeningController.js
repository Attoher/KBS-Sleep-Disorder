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
      const logToNeo4j = inputData.log_to_neo4j !== false; // Default to true
      
      console.log('🎯 Processing screening request...');
      console.log('   User ID:', userId || 'Guest');
      console.log('   Log to Neo4j:', logToNeo4j);
      
      // For guest mode, provide minimal validation
      if (!isGuest) {
        // Validate input only for authenticated users
        const validationErrors = ruleEngine.validateInput(inputData);
        if (validationErrors.length > 0) {
          return res.status(400).json({
            success: false,
            errors: validationErrors
          });
        }
      }
      
      // Run rule engine inference (or use dummy results for guest)
      let results;
      if (isGuest) {
        // Generate dummy results for guest screening
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
        inputSummary: {
          age: inputData.Age || inputData.age,
          sleepDuration: inputData['Sleep Duration'] || inputData.sleepDuration,
          sleepQuality: inputData['Quality of Sleep'] || inputData.sleepQuality,
          stressLevel: inputData['Stress Level'] || inputData.stressLevel,
          bmiCategory: inputData['BMI Category'] || inputData.bmiCategory,
          bloodPressure: inputData['Blood Pressure'] || inputData.bloodPressure
        }
      };
      
      let screeningId = null;
      
      // Save to Neo4j if user is authenticated and logging is enabled
      if (userId && logToNeo4j && !DEMO_MODE) {
        try {
          screeningId = await neo4jScreeningService.createScreening(userId, inputData, results);
          // Also log to Case graph so analytics/dashboard can see the data
          await neo4jService.logCase(`USER_${userId}`, inputData, results, results.firedRules || []);
          console.log('   Neo4j Screening ID:', screeningId);
        } catch (neo4jError) {
          console.error('⚠️  Neo4j save failed, continuing without:', neo4jError.message);
          // Continue even if Neo4j save fails
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
          screeningId,
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
              avgRulesFired: 0,
              uniqueDiagnoses: 0
            }
          }
        });
      }

      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 10, 
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
  
  // Get single screening by ID
  async getScreeningById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const screening = await neo4jScreeningService.getScreeningById(id);
      
      if (!screening) {
        return res.status(404).json({
          success: false,
          error: 'Screening not found'
        });
      }
      
      // If user context exists, verify ownership (optional)
      // For now, we'll allow viewing any screening by ID
      
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
  
  // Export history in different formats
  async exportHistory(req, res) {
    try {
      const userId = req.user.id;
      const { format, id } = req.query;
      const exportFormat = (format || (id ? 'pdf' : 'json')).toLowerCase();

      // If a specific screening is requested, export only that record
      if (id) {
        const screening = await neo4jScreeningService.getScreeningById(id);

        if (!screening) {
          return res.status(404).json({ success: false, error: 'Screening not found' });
        }

        // Single record export
        if (exportFormat === 'pdf') {
          const PDFDocument = require('pdfkit');
          const doc = new PDFDocument();

          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename=screening-${id}.pdf`);

          doc.pipe(res);
          doc.fontSize(18).text('Sleep Health Screening Report', { align: 'center' });
          doc.moveDown();
          doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
          doc.text(`Screening ID: ${screening.screeningId}`);
          doc.text(`Date: ${screening.timestamp}`);
          doc.moveDown();

          doc.fontSize(14).text('Diagnosis');
          doc.fontSize(12).text(`Result: ${screening.diagnosis}`);
          doc.text(`Insomnia Risk: ${screening.insomniaRisk}`);
          doc.text(`Apnea Risk: ${screening.apneaRisk}`);
          doc.moveDown();

          doc.fontSize(14).text('Recommendations');
          (screening.recommendations || []).forEach((rec, idx) => {
            doc.fontSize(12).text(`${idx + 1}. ${rec}`);
          });
          doc.moveDown();

          doc.fontSize(14).text('Input Summary');
          doc.fontSize(12).text(JSON.stringify(screening.inputData || {}, null, 2));

          doc.end();
        } else if (exportFormat === 'csv') {
          const headers = [
            'Date', 'Diagnosis', 'Insomnia Risk', 'Apnea Risk',
            'Sleep Duration', 'Sleep Quality', 'Stress Level', 'BMI Category',
            'Recommendations', 'Rules Fired'
          ];
          const row = [
            screening.timestamp,
            screening.diagnosis,
            screening.insomniaRisk,
            screening.apneaRisk,
            screening.inputData?.sleepDuration || screening.inputData?.['Sleep Duration'] || 'N/A',
            screening.inputData?.sleepQuality || screening.inputData?.['Quality of Sleep'] || 'N/A',
            screening.inputData?.stressLevel || screening.inputData?.['Stress Level'] || 'N/A',
            screening.inputData?.bmiCategory || screening.inputData?.['BMI Category'] || 'N/A',
            (screening.recommendations || []).join('; '),
            (screening.firedRules || []).join(', ')
          ];

          const csvString = `${headers.join(',')}
${row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')}`;

          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename=screening-${id}.csv`);
          return res.send(csvString);
        }

        // Default single-record JSON
        return res.json({ success: true, data: screening });
      }

      // Bulk export flow (all screenings for user)
      const result = await neo4jScreeningService.getUserScreenings(userId, 1, 1000); // Get up to 1000 records
      const screenings = result.screenings;
      
      if (exportFormat === 'csv') {
        const headers = [
          'Date', 'Diagnosis', 'Insomnia Risk', 'Apnea Risk',
          'Sleep Duration', 'Sleep Quality', 'Stress Level', 'BMI Category',
          'Recommendations', 'Rules Fired'
        ];

        const rows = screenings.map(s => [
          s.timestamp,
          s.diagnosis,
          s.insomniaRisk,
          s.apneaRisk,
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
        
      } else if (exportFormat === 'pdf') {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sleep-health-history.pdf');
        
        doc.pipe(res);
        
        doc.fontSize(20).text('Sleep Health Screening History', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.text(`Total Screenings: ${screenings.length}`);
        doc.moveDown();
        
        screenings.forEach((screening, index) => {
          doc.fontSize(14).text(`Screening ${index + 1}: ${screening.diagnosis}`);
          doc.fontSize(10).text(`Date: ${screening.timestamp}`);
          doc.text(`Insomnia Risk: ${screening.insomniaRisk}`);
          doc.text(`Apnea Risk: ${screening.apneaRisk}`);
          doc.text(`Recommendations: ${(screening.recommendations || []).join('; ') || 'N/A'}`);
          doc.text(`Rules Fired: ${(screening.firedRules || []).join(', ') || 'N/A'}`);
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
      
      await neo4jScreeningService.deleteScreening(id);
      
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

  // Generate dummy results for guest screening
  generateDummyResults(inputData) {
    const dummyRules = ['R1', 'R3', 'R5', 'R12', 'R18'];
    
    // Determine risk levels based on input (simplified)
    const age = inputData.age || inputData.Age || 40;
    const sleepDuration = inputData.sleepDuration || inputData['Sleep Duration'] || 6;
    const sleepQuality = inputData.sleepQuality || inputData['Quality of Sleep'] || 5;
    const stressLevel = inputData.stressLevel || inputData['Stress Level'] || 5;
    const bmi = inputData.bmiCategory || inputData['BMI Category'] || 'Normal';
    
    let insomniaRisk = 'low';
    let apneaRisk = 'low';
    let diagnosis = 'Normal Sleep Pattern';
    
    // Simple heuristics for dummy results
    if (sleepDuration < 5 || sleepQuality < 4) {
      insomniaRisk = 'high';
      diagnosis = 'Probable Insomnia';
    } else if (sleepDuration < 6.5 || sleepQuality < 6) {
      insomniaRisk = 'moderate';
      diagnosis = 'Mild Sleep Disturbance';
    }
    
    if (age > 50 && bmi === 'Obese') {
      apneaRisk = 'high';
      diagnosis = 'Probable Sleep Apnea';
    } else if (age > 40 && bmi === 'Overweight') {
      apneaRisk = 'moderate';
    }
    
    if (insomniaRisk === 'high' && apneaRisk === 'high') {
      diagnosis = 'Complex Sleep Disorder - Multiple Issues';
    }
    
    return {
      diagnosis,
      insomnia_risk: insomniaRisk,
      apnea_risk: apneaRisk,
      lifestyleIssues: {
        sleep: sleepDuration < 7,
        stress: stressLevel > 6,
        activity: (inputData.physicalActivity || 0) < 30,
        weight: bmi === 'Obese' || bmi === 'Overweight'
      },
      recommendations: [
        'Maintain consistent sleep schedule (same bedtime and wake time daily)',
        'Avoid caffeine and heavy meals 3-4 hours before bedtime',
        'Ensure bedroom is dark, quiet, and cool (around 18-20°C)',
        'Exercise regularly but not close to bedtime',
        'Consider consulting a sleep specialist for detailed evaluation'
      ],
      firedRules: dummyRules
    };
  }
}

module.exports = new ScreeningController();
