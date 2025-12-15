class RuleEngine {
  constructor() {
    this.rules = this.initializeRules();
    this.ruleDescriptions = this.getRuleDescriptions();
  }

  // Initialize all rules from the Excel table
  initializeRules() {
    return [
      // ===== INSOMNIA RULES =====
      {
        id: 'R1',
        category: 'Insomnia',
        condition: (facts) => {
          const duration = facts.sleepDuration || facts['Sleep Duration'];
          const quality = facts.sleepQuality || facts['Quality of Sleep'] || facts.sleepQualityScore;
          return duration < 5 && quality <= 4;
        },
        action: (facts) => {
          facts.insomnia_risk = 'high';
          facts.firedRules.push('R1');
          console.log('[RULE] R1 fired: insomnia_risk = high');
        }
      },
      {
        id: 'R2',
        category: 'Insomnia',
        condition: (facts) => {
          const duration = facts.sleepDuration || facts['Sleep Duration'];
          const stress = facts.stressLevel || facts['Stress Level'];
          return duration >= 5 && duration <= 6 && stress >= 7;
        },
        action: (facts) => {
          facts.insomnia_risk = 'moderate';
          facts.firedRules.push('R2');
          console.log('[RULE] R2 fired: insomnia_risk = moderate');
        }
      },
      {
        id: 'R3',
        category: 'Insomnia',
        condition: (facts) => {
          const quality = facts.sleepQuality || facts['Quality of Sleep'] || facts.sleepQualityScore;
          const stress = facts.stressLevel || facts['Stress Level'];
          return quality <= 4 && stress >= 7;
        },
        action: (facts) => {
          facts.insomnia_risk = 'moderate';
          facts.firedRules.push('R3');
          console.log('[RULE] R3 fired: insomnia_risk = moderate');
        }
      },
      {
        id: 'R4',
        category: 'Insomnia',
        condition: (facts) => {
          const duration = facts.sleepDuration || facts['Sleep Duration'];
          const quality = facts.sleepQuality || facts['Quality of Sleep'] || facts.sleepQualityScore;
          const stress = facts.stressLevel || facts['Stress Level'];
          return duration >= 7 && duration <= 9 && quality >= 7 && stress < 7;
        },
        action: (facts) => {
          facts.insomnia_risk = 'low';
          facts.firedRules.push('R4');
          console.log('[RULE] R4 fired: insomnia_risk = low');
        }
      },

      // ===== APNEA RULES =====
      {
        id: 'R5',
        category: 'Apnea',
        condition: (facts) => {
          const bmi = facts.bmiCategory || facts['BMI Category'];
          const bpStatus = facts.bloodPressureStatus;
          return bmi === 'Obese' && bpStatus === 'Hypertension';
        },
        action: (facts) => {
          facts.apnea_risk = 'high';
          facts.firedRules.push('R5');
          console.log('[RULE] R5 fired: apnea_risk = high');
        }
      },
      {
        id: 'R6',
        category: 'Apnea',
        condition: (facts) => {
          const bmi = facts.bmiCategory || facts['BMI Category'];
          const bpStatus = facts.bloodPressureStatus;
          return bmi === 'Overweight' && bpStatus === 'Hypertension';
        },
        action: (facts) => {
          facts.apnea_risk = 'moderate';
          facts.firedRules.push('R6');
          console.log('[RULE] R6 fired: apnea_risk = moderate');
        }
      },
      {
        id: 'R7',
        category: 'Apnea',
        condition: (facts) => {
          const bmi = facts.bmiCategory || facts['BMI Category'];
          const age = facts.age || facts['Age'];
          return bmi === 'Obese' && age >= 40;
        },
        action: (facts) => {
          facts.apnea_risk = 'moderate';
          facts.firedRules.push('R7');
          console.log('[RULE] R7 fired: apnea_risk = moderate');
        }
      },
      {
        id: 'R8',
        category: 'Apnea',
        condition: (facts) => {
          const bmi = facts.bmiCategory || facts['BMI Category'];
          const bpStatus = facts.bloodPressureStatus;
          return bmi === 'Normal' && bpStatus === 'Normal';
        },
        action: (facts) => {
          facts.apnea_risk = 'low';
          facts.firedRules.push('R8');
          console.log('[RULE] R8 fired: apnea_risk = low');
        }
      },

      // ===== LIFESTYLE RULES =====
      {
        id: 'R9',
        category: 'Lifestyle',
        condition: (facts) => {
          const activity = facts.physicalActivity || facts['Physical Activity Level'];
          return activity < 30;
        },
        action: (facts) => {
          facts.lifestyle_issue_activity = true;
          facts.firedRules.push('R9');
          console.log('[RULE] R9 fired: lifestyle_issue_activity = true');
        }
      },
      {
        id: 'R10',
        category: 'Lifestyle',
        condition: (facts) => {
          const stress = facts.stressLevel || facts['Stress Level'];
          return stress >= 7;
        },
        action: (facts) => {
          facts.lifestyle_issue_stress = true;
          facts.firedRules.push('R10');
          console.log('[RULE] R10 fired: lifestyle_issue_stress = true');
        }
      },
      {
        id: 'R11',
        category: 'Lifestyle',
        condition: (facts) => {
          const duration = facts.sleepDuration || facts['Sleep Duration'];
          return duration < 6;
        },
        action: (facts) => {
          facts.lifestyle_issue_sleep = true;
          facts.firedRules.push('R11');
          console.log('[RULE] R11 fired: lifestyle_issue_sleep = true');
        }
      },
      {
        id: 'R12',
        category: 'Lifestyle',
        condition: (facts) => {
          const bmi = facts.bmiCategory || facts['BMI Category'];
          return ['Overweight', 'Obese'].includes(bmi);
        },
        action: (facts) => {
          facts.lifestyle_issue_weight = true;
          facts.firedRules.push('R12');
          console.log('[RULE] R12 fired: lifestyle_issue_weight = true');
        }
      },

      // ===== DIAGNOSIS RULES =====
      {
        id: 'R13',
        category: 'Diagnosis',
        condition: (facts) => {
          const insomniaRisk = facts.insomnia_risk;
          const stressIssue = facts.lifestyle_issue_stress;
          const sleepIssue = facts.lifestyle_issue_sleep;

          return insomniaRisk === 'high' ||
            (insomniaRisk === 'moderate' && (stressIssue || sleepIssue));
        },
        action: (facts) => {
          facts.diagnosis_insomnia = true;
          facts.firedRules.push('R13');
          console.log('[RULE] R13 fired: diagnosis_insomnia = true');
        }
      },
      {
        id: 'R14',
        category: 'Diagnosis',
        condition: (facts) => {
          const apneaRisk = facts.apnea_risk;
          const weightIssue = facts.lifestyle_issue_weight;

          return apneaRisk === 'high' ||
            (apneaRisk === 'moderate' && weightIssue);
        },
        action: (facts) => {
          facts.diagnosis_apnea = true;
          facts.firedRules.push('R14');
          console.log('[RULE] R14 fired: diagnosis_apnea = true');
        }
      },
      {
        id: 'R15',
        category: 'Diagnosis',
        condition: (facts) => {
          const insomniaDiagnosis = facts.diagnosis_insomnia;
          const apneaDiagnosis = facts.diagnosis_apnea;
          return insomniaDiagnosis && apneaDiagnosis;
        },
        action: (facts) => {
          facts.diagnosis_mixed = true;
          facts.firedRules.push('R15');
          console.log('[RULE] R15 fired: diagnosis_mixed = true');
        }
      },
      {
        id: 'R16',
        category: 'Diagnosis',
        condition: (facts) => {
          const insomniaRisk = facts.insomnia_risk;
          const apneaRisk = facts.apnea_risk;
          const activityIssue = facts.lifestyle_issue_activity;
          const stressIssue = facts.lifestyle_issue_stress;
          const sleepIssue = facts.lifestyle_issue_sleep;
          const weightIssue = facts.lifestyle_issue_weight;

          const allRisksLow = insomniaRisk === 'low' && apneaRisk === 'low';
          const noLifestyleIssues = !activityIssue && !stressIssue && !sleepIssue && !weightIssue;

          return allRisksLow && noLifestyleIssues;
        },
        action: (facts) => {
          facts.diagnosis_none = true;
          facts.firedRules.push('R16');
          console.log('[RULE] R16 fired: diagnosis_none = true');
        }
      },

      // ===== RECOMMENDATION RULES =====
      {
        id: 'R17',
        category: 'Recommendation',
        condition: (facts) => {
          const insomniaDiagnosis = facts.diagnosis_insomnia;
          const sleepIssue = facts.lifestyle_issue_sleep;
          return insomniaDiagnosis || sleepIssue;
        },
        action: (facts) => {
          if (!facts.recommendations) facts.recommendations = [];
          if (!facts.recommendations.includes('REC_SLEEP_HYGIENE')) {
            facts.recommendations.push('REC_SLEEP_HYGIENE');
          }
          facts.firedRules.push('R17');
          console.log('[RULE] R17 fired: add REC_SLEEP_HYGIENE');
        }
      },
      {
        id: 'R18',
        category: 'Recommendation',
        condition: (facts) => {
          return facts.lifestyle_issue_activity;
        },
        action: (facts) => {
          if (!facts.recommendations) facts.recommendations = [];
          if (!facts.recommendations.includes('REC_PHYSICAL_ACTIVITY')) {
            facts.recommendations.push('REC_PHYSICAL_ACTIVITY');
          }
          facts.firedRules.push('R18');
          console.log('[RULE] R18 fired: add REC_PHYSICAL_ACTIVITY');
        }
      },
      {
        id: 'R19',
        category: 'Recommendation',
        condition: (facts) => {
          return facts.lifestyle_issue_stress;
        },
        action: (facts) => {
          if (!facts.recommendations) facts.recommendations = [];
          if (!facts.recommendations.includes('REC_STRESS_MANAGEMENT')) {
            facts.recommendations.push('REC_STRESS_MANAGEMENT');
          }
          facts.firedRules.push('R19');
          console.log('[RULE] R19 fired: add REC_STRESS_MANAGEMENT');
        }
      },
      {
        id: 'R20',
        category: 'Recommendation',
        condition: (facts) => {
          const apneaDiagnosis = facts.diagnosis_apnea;
          const apneaRisk = facts.apnea_risk;
          return apneaDiagnosis || apneaRisk === 'high';
        },
        action: (facts) => {
          if (!facts.recommendations) facts.recommendations = [];
          if (!facts.recommendations.includes('REC_WEIGHT_MANAGEMENT')) {
            facts.recommendations.push('REC_WEIGHT_MANAGEMENT');
          }
          if (!facts.recommendations.includes('REC_APNEA_EVAL')) {
            facts.recommendations.push('REC_APNEA_EVAL');
          }
          facts.firedRules.push('R20');
          console.log('[RULE] R20 fired: add REC_WEIGHT_MANAGEMENT + REC_APNEA_EVAL');
        }
      }
    ];
  }

  // Preprocess input data
  preprocessInput(rawInput) {
    console.log('[SETUP] Preprocessing input data...');

    const facts = { ...rawInput };

    // Ensure numeric values
    facts.age = parseInt(facts.Age || facts.age || 0);
    facts.sleepDuration = parseFloat(facts['Sleep Duration'] || facts.sleepDuration || 0);

    // Handle sleep quality - can come from questionnaire score or direct input
    facts.sleepQuality = parseInt(
      facts.sleepQualityScore ||
      facts['Quality of Sleep'] ||
      facts.sleepQuality ||
      0
    );

    facts.stressLevel = parseInt(facts['Stress Level'] || facts.stressLevel || 0);

    // Handle physical activity - can be numeric or from dropdown
    facts.physicalActivity = parseInt(
      facts.physicalActivity ||
      facts['Physical Activity Level'] ||
      0
    );

    facts.heartRate = parseInt(facts['Heart Rate'] || facts.heartRate || 0);
    facts.dailySteps = parseInt(facts['Daily Steps'] || facts.dailySteps || 0);

    // Handle BMI - can come from category or calculate from weight/height
    if (!facts.bmiCategory && facts.weight && facts.height) {
      // Calculate BMI from weight and height
      const weightKg = facts.weightUnit === 'lbs' ? facts.weight * 0.453592 : facts.weight;
      const heightM = facts.heightUnit === 'in' ? facts.height * 0.0254 : facts.height / 100;

      if (weightKg > 0 && heightM > 0) {
        const bmi = weightKg / (heightM ** 2);

        if (bmi < 18.5) facts.bmiCategory = 'Underweight';
        else if (bmi < 25) facts.bmiCategory = 'Normal';
        else if (bmi < 30) facts.bmiCategory = 'Overweight';
        else facts.bmiCategory = 'Obese';

        facts.bmi = bmi; // Store calculated BMI
      }
    } else {
      // Use provided BMI category
      facts.bmiCategory = facts['BMI Category'] || facts.bmiCategory || 'Normal';
    }

    // Parse blood pressure
    if (facts.bloodPressure || facts['Blood Pressure']) {
      const bp = facts.bloodPressure || facts['Blood Pressure'];
      if (bp && bp.includes('/')) {
        const [systolic, diastolic] = bp.split('/').map(Number);
        facts.systolicBP = systolic;
        facts.diastolicBP = diastolic;

        // Determine hypertension status
        if (systolic >= 140 || diastolic >= 90) {
          facts.bloodPressureStatus = 'Hypertension';
        } else {
          facts.bloodPressureStatus = 'Normal';
        }
      } else {
        facts.bloodPressureStatus = 'Unknown';
      }
    }

    // Initialize arrays for results
    if (!facts.firedRules) facts.firedRules = [];
    if (!facts.recommendations) facts.recommendations = [];

    // Initialize lifestyle issues as false by default
    facts.lifestyle_issue_activity = false;
    facts.lifestyle_issue_stress = false;
    facts.lifestyle_issue_sleep = false;
    facts.lifestyle_issue_weight = false;

    console.log('[SUCCESS] Preprocessing complete:', {
      sleepDuration: facts.sleepDuration,
      sleepQuality: facts.sleepQuality,
      stressLevel: facts.stressLevel,
      bmiCategory: facts.bmiCategory,
      bloodPressureStatus: facts.bloodPressureStatus,
      physicalActivity: facts.physicalActivity
    });

    return facts;
  }

  // Run forward chaining inference
  runForwardChaining(input) {
    console.log('🧠 Starting rule engine inference...');

    const facts = this.preprocessInput(input);
    let changed = true;
    let iteration = 0;
    const maxIterations = 50;

    // Execute rules until no more changes or max iterations reached
    while (changed && iteration < maxIterations) {
      changed = false;
      iteration++;

      console.log(`\n🔄 Iteration ${iteration}:`);

      for (const rule of this.rules) {
        // Skip if rule already fired
        if (facts.firedRules.includes(rule.id)) {
          continue;
        }

        // Check condition
        try {
          if (rule.condition(facts)) {
            // Execute action
            rule.action(facts);
            changed = true;
            console.log(`   ✓ ${rule.id} fired`);
          }
        } catch (error) {
          console.error(`   ✗ Error in rule ${rule.id}:`, error.message);
        }
      }
    }

    if (iteration >= maxIterations) {
      console.warn('[WARNING] Maximum iterations reached');
    }

    // Determine final diagnosis
    facts.diagnosis = this.determineDiagnosis(facts);

    // Prepare lifestyle issues object
    facts.lifestyleIssues = {
      sleep: facts.lifestyle_issue_sleep || false,
      stress: facts.lifestyle_issue_stress || false,
      activity: facts.lifestyle_issue_activity || false,
      weight: facts.lifestyle_issue_weight || false
    };

    console.log('\n🎉 Inference completed:');
    console.log('   Diagnosis:', facts.diagnosis);
    console.log('   Fired rules:', facts.firedRules.length);
    console.log('   Recommendations:', facts.recommendations);

    return facts;
  }

  // Determine final diagnosis
  determineDiagnosis(facts) {
    if (facts.diagnosis_mixed) {
      return 'Mixed Sleep Disorder (Insomnia + Sleep Apnea)';
    } else if (facts.diagnosis_apnea) {
      return 'Sleep Apnea';
    } else if (facts.diagnosis_insomnia) {
      return 'Insomnia';
    } else if (facts.diagnosis_none) {
      return 'No Sleep Disorder';
    } else {
      return 'Unspecified / Inconclusive';
    }
  }

  // Get rule descriptions
  getRuleDescriptions() {
    return {
      R1: 'IF Sleep Duration < 5 hours AND Quality <= 4 THEN insomnia_risk = high',
      R2: 'IF Duration 5-6 hours AND Stress >= 7 THEN insomnia_risk = moderate',
      R3: 'IF Quality <= 4 AND Stress >= 7 THEN insomnia_risk = moderate',
      R4: 'IF Duration 7-9 hours AND Quality >= 7 AND Stress < 7 THEN insomnia_risk = low',
      R5: 'IF Obese AND Hypertension THEN apnea_risk = high',
      R6: 'IF Overweight AND Hypertension THEN apnea_risk = moderate',
      R7: 'IF Obese AND Age >= 40 THEN apnea_risk = moderate',
      R8: 'IF Normal BMI AND Normal BP THEN apnea_risk = low',
      R9: 'IF Physical Activity < 30 minutes THEN lifestyle_issue_activity = true',
      R10: 'IF Stress >= 7 THEN lifestyle_issue_stress = true',
      R11: 'IF Sleep Duration < 6 hours THEN lifestyle_issue_sleep = true',
      R12: 'IF BMI in {Overweight, Obese} THEN lifestyle_issue_weight = true',
      R13: 'IF insomnia_risk = high OR (moderate + stress/sleep issue) THEN diagnosis_insomnia = true',
      R14: 'IF apnea_risk = high OR (moderate + BMI issue) THEN diagnosis_apnea = true',
      R15: 'IF diagnosis_insomnia AND diagnosis_apnea THEN diagnosis_mixed = true',
      R16: 'IF All risks low AND no lifestyle issues THEN diagnosis_none = true',
      R17: 'IF Insomnia diagnosis OR sleep issue THEN add REC_SLEEP_HYGIENE',
      R18: 'IF Activity issue THEN add REC_PHYSICAL_ACTIVITY',
      R19: 'IF Stress issue THEN add REC_STRESS_MANAGEMENT',
      R20: 'IF Apnea diagnosis OR apnea high THEN add REC_WEIGHT_MANAGEMENT + REC_APNEA_EVAL'
    };
  }

  // Get rule by ID
  getRule(ruleId) {
    return this.rules.find(rule => rule.id === ruleId);
  }

  // Get all rules
  getAllRules() {
    return this.rules.map(rule => ({
      id: rule.id,
      category: rule.category,
      description: this.ruleDescriptions[rule.id] || 'No description'
    }));
  }

  // Validate input data
  validateInput(input) {
    const errors = [];

    if (!input.age && !input.Age) {
      errors.push('Age is required');
    }

    if (!input.sleepDuration && !input['Sleep Duration']) {
      errors.push('Sleep duration is required');
    }

    if (!input.sleepQuality && !input['Quality of Sleep'] && !input.sleepQualityScore) {
      errors.push('Sleep quality is required');
    }

    if (!input.stressLevel && !input['Stress Level']) {
      errors.push('Stress level is required');
    }

    if (!input.bmiCategory && !input['BMI Category']) {
      errors.push('BMI category is required');
    }

    if (!input.bloodPressure && !input['Blood Pressure']) {
      errors.push('Blood pressure is required');
    }

    return errors;
  }
}

// Create singleton instance
const ruleEngine = new RuleEngine();

module.exports = ruleEngine;