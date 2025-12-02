const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Sleep Health KBS',
    timestamp: new Date().toISOString() 
  });
});

// Get all rules
router.get('/rules', diagnosisController.getRules.bind(diagnosisController));

// Get specific rule
router.get('/rules/:ruleId', diagnosisController.testRule.bind(diagnosisController));

// Perform diagnosis
router.post('/analyze', diagnosisController.diagnose.bind(diagnosisController));

// Batch diagnosis
router.post('/batch', async (req, res) => {
  try {
    const cases = req.body.cases;
    if (!Array.isArray(cases)) {
      return res.status(400).json({ error: 'Expected array of cases' });
    }

    const results = [];
    for (const caseData of cases) {
      try {
        const result = await diagnosisController.diagnose({ body: caseData }, {
          json: (data) => data
        });
        results.push(result);
      } catch (error) {
        results.push({ error: error.message, input: caseData });
      }
    }

    res.json({
      success: true,
      total: cases.length,
      processed: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      rules: {
        total: 20,
        categories: {
          insomnia: 4,
          apnea: 4,
          lifestyle: 4,
          diagnosis: 4,
          recommendation: 4
        }
      },
      features: [
        'Sleep Duration Analysis',
        'Sleep Quality Assessment',
        'Stress Level Evaluation',
        'Physical Activity Monitoring',
        'BMI Classification',
        'Blood Pressure Analysis',
        'Risk Level Calculation',
        'Automated Recommendations'
      ],
      supportedConditions: [
        'Insomnia',
        'Obstructive Sleep Apnea',
        'Mixed Sleep Disorder',
        'Lifestyle-related Sleep Issues'
      ]
    };

    res.json({
      success: true,
      system: 'Sleep Health Knowledge-Based System',
      version: '1.0.0',
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;