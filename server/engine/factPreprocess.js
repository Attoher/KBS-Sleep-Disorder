function parseBP(bpString) {
  const [systolic, diastolic] = bpString.split('/').map(Number);
  return { systolic, diastolic };
}

function categorizeBP(sys, dia) {
  if (sys < 120 && dia < 80) return "Normal";
  if ((sys >= 120 && sys < 140) || (dia >= 80 && dia < 90)) return "Elevated";
  if (sys >= 140 || dia >= 90) return "Hypertension";
  return "Unknown";
}

function categorizeSleepDuration(hours) {
  if (hours < 5) return "very_short";
  if (hours < 7) return "short";
  if (hours <= 9) return "normal";
  return "long";
}

function categorizeSleepQuality(quality) {
  if (quality <= 4) return "poor";
  if (quality <= 6) return "fair";
  if (quality <= 8) return "good";
  return "excellent";
}

function categorizeStress(level) {
  if (level <= 3) return "low";
  if (level <= 6) return "moderate";
  return "high";
}

function categorizeActivity(minutes) {
  if (minutes < 30) return "low";
  if (minutes <= 60) return "moderate";
  return "high";
}

function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

function categorizeBMI(bmi) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

function preprocessInput(rawInput) {
  const { systolic, diastolic } = parseBP(rawInput.bloodPressure);
  
  // Calculate BMI if weight and height provided
  let bmiCategory = rawInput.bmiCategory;
  if (rawInput.weight && rawInput.height) {
    const bmi = calculateBMI(rawInput.weight, rawInput.height);
    bmiCategory = categorizeBMI(bmi);
  }

  return {
    age: parseInt(rawInput.age) || 0,
    gender: rawInput.gender || 'Unknown',
    sleep_duration: parseFloat(rawInput.sleepDuration) || 0,
    sleep_duration_cat: categorizeSleepDuration(parseFloat(rawInput.sleepDuration) || 0),
    sleep_quality: parseInt(rawInput.sleepQuality) || 0,
    sleep_quality_cat: categorizeSleepQuality(parseInt(rawInput.sleepQuality) || 0),
    stress_level: parseInt(rawInput.stressLevel) || 0,
    stress_cat: categorizeStress(parseInt(rawInput.stressLevel) || 0),
    activity_minutes: parseInt(rawInput.activityMinutes) || 0,
    activity_level: categorizeActivity(parseInt(rawInput.activityMinutes) || 0),
    bmi_category: bmiCategory,
    bp_systolic: systolic,
    bp_diastolic: diastolic,
    bp_category: categorizeBP(systolic, diastolic),
    heart_rate: parseInt(rawInput.heartRate) || 0,
    daily_steps: parseInt(rawInput.dailySteps) || 0,
    weight: parseFloat(rawInput.weight) || null,
    height: parseFloat(rawInput.height) || null
  };
}

module.exports = {
  preprocessInput,
  parseBP,
  categorizeBP,
  categorizeSleepDuration,
  categorizeSleepQuality,
  categorizeStress,
  categorizeActivity,
  calculateBMI,
  categorizeBMI
};