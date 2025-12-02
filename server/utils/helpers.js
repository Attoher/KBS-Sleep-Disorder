/**
 * Utility functions for the Sleep Health KBS
 */

/**
 * Validates blood pressure string format
 * @param {string} bp - Blood pressure in format "systolic/diastolic"
 * @returns {boolean} - True if valid format
 */
function isValidBloodPressure(bp) {
  const regex = /^\d{2,3}\/\d{2,3}$/;
  if (!regex.test(bp)) return false;
  
  const [systolic, diastolic] = bp.split('/').map(Number);
  return systolic > 0 && diastolic > 0 && systolic < 300 && diastolic < 200;
}

/**
 * Calculates BMI from weight and height
 * @param {number} weight - Weight in kilograms
 * @param {number} height - Height in centimeters
 * @returns {number} - BMI value
 */
function calculateBMI(weight, height) {
  if (!weight || !height || height === 0) return null;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Categorizes BMI value
 * @param {number} bmi - BMI value
 * @returns {string} - BMI category
 */
function categorizeBMI(bmi) {
  if (bmi === null || bmi === undefined) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Validates sleep quality score
 * @param {number} score - Sleep quality score (1-10)
 * @returns {boolean} - True if valid
 */
function isValidSleepQuality(score) {
  return Number.isInteger(score) && score >= 1 && score <= 10;
}

/**
 * Validates stress level score
 * @param {number} score - Stress level score (1-10)
 * @returns {boolean} - True if valid
 */
function isValidStressLevel(score) {
  return Number.isInteger(score) && score >= 1 && score <= 10;
}

/**
 * Formats diagnosis for display
 * @param {Object} facts - Inference facts
 * @returns {string} - Formatted diagnosis
 */
function formatDiagnosis(facts) {
  if (facts.diagnosis_mixed) return "Mixed Sleep Disorder (Insomnia + Sleep Apnea)";
  if (facts.diagnosis_apnea) return "Sleep Apnea";
  if (facts.diagnosis_insomnia) return "Insomnia";
  if (facts.diagnosis_none) return "No Sleep Disorder";
  return "Unspecified / Inconclusive";
}

/**
 * Generates unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} - Unique ID
 */
function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

/**
 * Maps recommendation ID to human-readable text
 * @param {string} recId - Recommendation ID
 * @returns {Object} - Recommendation details
 */
function mapRecommendation(recId) {
  const mapping = {
    "REC_SLEEP_HYGIENE": {
      title: "Improve Sleep Hygiene",
      description: "Establish regular sleep schedule, optimize sleep environment",
      priority: "high",
      category: "lifestyle"
    },
    "REC_PHYSICAL_ACTIVITY": {
      title: "Increase Physical Activity",
      description: "Aim for ≥150 minutes of moderate exercise per week",
      priority: "medium",
      category: "lifestyle"
    },
    "REC_STRESS_MANAGEMENT": {
      title: "Stress Management",
      description: "Practice relaxation techniques like meditation or deep breathing",
      priority: "medium",
      category: "mental health"
    },
    "REC_WEIGHT_MANAGEMENT": {
      title: "Weight Management Program",
      description: "Consult with healthcare provider for weight management plan",
      priority: "high",
      category: "medical"
    },
    "REC_APNEA_EVAL": {
      title: "Sleep Apnea Evaluation",
      description: "Schedule sleep study with sleep specialist",
      priority: "high",
      category: "medical"
    }
  };

  return mapping[recId] || { title: recId, description: "", priority: "low", category: "other" };
}

/**
 * Calculates age from birth year
 * @param {number} birthYear - Birth year
 * @returns {number} - Age
 */
function calculateAge(birthYear) {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

/**
 * Formats timestamp to readable string
 * @param {string|Date} timestamp - ISO timestamp or Date object
 * @returns {string} - Formatted date string
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validates patient data
 * @param {Object} data - Patient input data
 * @returns {Object} - Validation result
 */
function validatePatientData(data) {
  const errors = [];

  // Required fields
  const requiredFields = ['age', 'gender', 'sleepDuration', 'sleepQuality', 'stressLevel'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Numeric validations
  if (data.age && (data.age < 1 || data.age > 120)) {
    errors.push('Age must be between 1 and 120');
  }

  if (data.sleepDuration && (data.sleepDuration < 0 || data.sleepDuration > 24)) {
    errors.push('Sleep duration must be between 0 and 24 hours');
  }

  if (data.sleepQuality && !isValidSleepQuality(data.sleepQuality)) {
    errors.push('Sleep quality must be between 1 and 10');
  }

  if (data.stressLevel && !isValidStressLevel(data.stressLevel)) {
    errors.push('Stress level must be between 1 and 10');
  }

  // Blood pressure validation
  if (data.bloodPressure && !isValidBloodPressure(data.bloodPressure)) {
    errors.push('Blood pressure must be in format "systolic/diastolic" (e.g., "120/80")');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes input data
 * @param {Object} data - Raw input data
 * @returns {Object} - Sanitized data
 */
function sanitizeInput(data) {
  const sanitized = { ...data };

  // Convert numeric strings to numbers
  const numericFields = ['age', 'sleepDuration', 'sleepQuality', 'stressLevel', 'activityMinutes', 'heartRate', 'dailySteps'];
  numericFields.forEach(field => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = Number(sanitized[field]);
    }
  });

  // Trim string fields
  const stringFields = ['gender', 'bmiCategory', 'bloodPressure'];
  stringFields.forEach(field => {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitized[field].trim();
    }
  });

  return sanitized;
}

/**
 * Logs inference process
 * @param {string} caseId - Case identifier
 * @param {Object} input - Input data
 * @param {Object} output - Output data
 */
function logInference(caseId, input, output) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    caseId,
    input: sanitizeInput(input),
    output: {
      diagnosis: output.diagnosis,
      risks: output.results?.risks,
      rulesFired: output.rules?.fired?.length || 0,
      confidence: output.results?.confidence || 0
    }
  };

  // In production, this would write to a log file or database
  if (process.env.NODE_ENV === 'development') {
    console.log('Inference Log:', JSON.stringify(logEntry, null, 2));
  }
}

module.exports = {
  isValidBloodPressure,
  calculateBMI,
  categorizeBMI,
  isValidSleepQuality,
  isValidStressLevel,
  formatDiagnosis,
  generateId,
  mapRecommendation,
  calculateAge,
  formatDate,
  sleep,
  validatePatientData,
  sanitizeInput,
  logInference
};