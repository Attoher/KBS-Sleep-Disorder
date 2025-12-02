const { forwardChain, getAllRules } = require('../engine/inference');
const { preprocessInput } = require('../engine/factPreprocess');
const { v4: uuidv4 } = require('uuid');
const neo4j = require('../config/neo4j');

const diagnosisController = {
  // Perform diagnosis
  async diagnose(req, res) {
    try {
      const rawInput = req.body;
      
      // Validate required fields
      const requiredFields = ['age', 'gender', 'sleepDuration', 'sleepQuality', 'stressLevel'];
      const missingFields = requiredFields.filter(field => !rawInput[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Missing required fields',
          missing: missingFields
        });
      }

      // Preprocess input
      const preprocessed = preprocessInput(rawInput);
      
      // Run inference engine
      const result = forwardChain(preprocessed);
      
      // Generate response
      const response = {
        success: true,
        diagnosis: this.summarizeDiagnosis(result.facts),
        timestamp: new Date().toISOString(),
        caseId: `CASE_${uuidv4().slice(0, 8).toUpperCase()}`,
        input: rawInput,
        processed: preprocessed,
        results: {
          risks: {
            insomnia: result.facts.insomnia_risk,
            apnea: result.facts.apnea_risk
          },
          lifestyleIssues: this.getLifestyleIssues(result.facts),
          diagnosis: this.getDiagnosisFlags(result.facts),
          recommendations: this.mapRecommendations(result.facts.recommendations || []),
          confidence: this.calculateConfidence(result)
        },
        rules: {
          fired: result.firedRules,
          details: result.firedRulesDetails
        },
        explanation: this.generateExplanation(result)
      };

      // Log to Neo4j if enabled
      if (req.body.logToNeo4j !== false) {
        try {
          await neo4j.connect();
          const personId = `UI_${uuidv4().slice(0, 8)}`;
          await neo4j.pushCase(personId, rawInput, result.facts, result.firedRules);
          response.neo4j = {
            logged: true,
            personId
          };
        } catch (neo4jError) {
          console.warn('Failed to log to Neo4j:', neo4jError.message);
          response.neo4j = {
            logged: false,
            error: neo4jError.message
          };
        }
      }

      res.json(response);
    } catch (error) {
      console.error('Diagnosis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process diagnosis',
        message: error.message
      });
    }
  },

  // Get all rules
  async getRules(req, res) {
    try {
      const rules = getAllRules();
      res.json({
        success: true,
        count: rules.length,
        rules: rules,
        categories: this.getRuleCategories(rules)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Test specific rule
  async testRule(req, res) {
    try {
      const { ruleId } = req.params;
      const testData = this.getTestDataForRule(ruleId);
      
      if (!testData) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      const preprocessed = preprocessInput(testData);
      const result = forwardChain(preprocessed);
      const ruleFired = result.firedRules.includes(ruleId);

      res.json({
        ruleId,
        ruleFired,
        testData,
        results: result.facts,
        allFiredRules: result.firedRules,
        success: ruleFired
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Helper methods
  summarizeDiagnosis(facts) {
    if (facts.diagnosis_mixed) return "Mixed Sleep Disorder (Insomnia + Sleep Apnea)";
    if (facts.diagnosis_apnea) return "Sleep Apnea";
    if (facts.diagnosis_insomnia) return "Insomnia";
    if (facts.diagnosis_none) return "No Sleep Disorder";
    return "Unspecified / Inconclusive";
  },

  getLifestyleIssues(facts) {
    return {
      sleep: facts.lifestyle_issue_sleep || false,
      stress: facts.lifestyle_issue_stress || false,
      activity: facts.lifestyle_issue_activity || false,
      weight: facts.lifestyle_issue_weight || false
    };
  },

  getDiagnosisFlags(facts) {
    return {
      insomnia: facts.diagnosis_insomnia || false,
      apnea: facts.diagnosis_apnea || false,
      mixed: facts.diagnosis_mixed || false,
      none: facts.diagnosis_none || false
    };
  },

  mapRecommendations(recIds) {
    const mapping = {
      "REC_SLEEP_HYGIENE": {
        id: "REC_SLEEP_HYGIENE",
        title: "Improve Sleep Hygiene",
        description: "Establish regular sleep schedule, optimize sleep environment",
        priority: "high",
        category: "lifestyle"
      },
      "REC_PHYSICAL_ACTIVITY": {
        id: "REC_PHYSICAL_ACTIVITY",
        title: "Increase Physical Activity",
        description: "Aim for ≥150 minutes of moderate exercise per week",
        priority: "medium",
        category: "lifestyle"
      },
      "REC_STRESS_MANAGEMENT": {
        id: "REC_STRESS_MANAGEMENT",
        title: "Stress Management",
        description: "Practice relaxation techniques like meditation or deep breathing",
        priority: "medium",
        category: "mental health"
      },
      "REC_WEIGHT_MANAGEMENT": {
        id: "REC_WEIGHT_MANAGEMENT",
        title: "Weight Management Program",
        description: "Consult with healthcare provider for weight management plan",
        priority: "high",
        category: "medical"
      },
      "REC_APNEA_EVAL": {
        id: "REC_APNEA_EVAL",
        title: "Sleep Apnea Evaluation",
        description: "Schedule sleep study with sleep specialist",
        priority: "high",
        category: "medical"
      }
    };

    return recIds.map(id => mapping[id] || { id, title: id, description: "", priority: "low" });
  },

  calculateConfidence(result) {
    const totalRules = 20;
    const firedCount = result.firedRules.length;
    
    if (firedCount === 0) return 0;
    
    // Base confidence on number of relevant rules fired
    let confidence = (firedCount / totalRules) * 100;
    
    // Adjust based on risk levels
    if (result.facts.insomnia_risk === "high" || result.facts.apnea_risk === "high") {
      confidence = Math.min(confidence + 20, 95);
    }
    
    // Adjust if we have clear diagnosis
    if (result.facts.diagnosis_insomnia || result.facts.diagnosis_apnea) {
      confidence = Math.min(confidence + 15, 95);
    }
    
    return Math.round(confidence);
  },

  generateExplanation(result) {
    const explanations = [];
    const facts = result.facts;

    if (facts.insomnia_risk) {
      explanations.push(`Insomnia Risk: ${facts.insomnia_risk.toUpperCase()} detected based on sleep patterns and stress levels.`);
    }

    if (facts.apnea_risk) {
      explanations.push(`Sleep Apnea Risk: ${facts.apnea_risk.toUpperCase()} detected based on BMI and blood pressure.`);
    }

    const lifestyleIssues = [];
    if (facts.lifestyle_issue_sleep) lifestyleIssues.push("sleep duration/quality");
    if (facts.lifestyle_issue_stress) lifestyleIssues.push("stress levels");
    if (facts.lifestyle_issue_activity) lifestyleIssues.push("physical activity");
    if (facts.lifestyle_issue_weight) lifestyleIssues.push("weight management");
    
    if (lifestyleIssues.length > 0) {
      explanations.push(`Lifestyle factors detected: ${lifestyleIssues.join(', ')}.`);
    }

    if (facts.diagnosis_mixed) {
      explanations.push("Mixed diagnosis: Both insomnia and sleep apnea detected. Comprehensive treatment recommended.");
    } else if (facts.diagnosis_insomnia) {
      explanations.push("Primary diagnosis: Insomnia. Focus on sleep hygiene and stress management.");
    } else if (facts.diagnosis_apnea) {
      explanations.push("Primary diagnosis: Sleep Apnea. Medical evaluation recommended.");
    } else if (facts.diagnosis_none) {
      explanations.push("No sleep disorder detected. Maintain healthy sleep habits.");
    }

    if (result.firedRules.length > 0) {
      explanations.push(`Inference process: ${result.firedRules.length} rules activated.`);
    }

    return explanations;
  },

  getRuleCategories(rules) {
    const categories = {};
    rules.forEach(rule => {
      if (!categories[rule.category]) {
        categories[rule.category] = [];
      }
      categories[rule.category].push(rule.id);
    });
    return categories;
  },

  getTestDataForRule(ruleId) {
    const testData = {
      "R1": { age: 35, gender: "Female", sleepDuration: 4.0, sleepQuality: 2, stressLevel: 5, activityMinutes: 30, bmiCategory: "Normal", bloodPressure: "120/80", heartRate: 70, dailySteps: 5000 },
      "R2": { age: 40, gender: "Male", sleepDuration: 6.0, sleepQuality: 6, stressLevel: 8, activityMinutes: 45, bmiCategory: "Normal", bloodPressure: "125/85", heartRate: 75, dailySteps: 6000 },
      // ... add all test cases
      "R20": { age: 55, gender: "Male", sleepDuration: 6.0, sleepQuality: 3, stressLevel: 6, activityMinutes: 12, bmiCategory: "Obese", bloodPressure: "160/100", heartRate: 95, dailySteps: 2200 }
    };
    
    return testData[ruleId];
  }
};

module.exports = diagnosisController;