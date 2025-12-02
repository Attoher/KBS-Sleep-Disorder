// Priority mapping
const RISK_PRIORITY = {
  "low": 0,
  "moderate": 1,
  "high": 2,
};

// Helper function to set risk with priority
function setRisk(facts, key, level) {
  const current = facts[key];
  if (current === undefined) {
    facts[key] = level;
    return;
  }

  if (RISK_PRIORITY[level] > (RISK_PRIORITY[current] || -1)) {
    facts[key] = level;
  }
}

// Rule definitions based on your table
const RULES = [
  // =====================
  // INSOMNIA RISK RULES
  // =====================
  {
    id: "R1",
    name: "Insomnia High Risk",
    category: "insomnia",
    condition: (facts) => facts.sleep_duration < 5 && facts.sleep_quality <= 4,
    action: (facts) => setRisk(facts, "insomnia_risk", "high"),
    source: "AASM/Morin 2012"
  },
  {
    id: "R2",
    name: "Insomnia Moderate Risk (Duration + Stress)",
    category: "insomnia",
    condition: (facts) => facts.sleep_duration >= 5 && facts.sleep_duration < 7 && facts.stress_level >= 7,
    action: (facts) => setRisk(facts, "insomnia_risk", "moderate"),
    source: "AASM"
  },
  {
    id: "R3",
    name: "Insomnia Moderate Risk (Quality + Stress)",
    category: "insomnia",
    condition: (facts) => facts.sleep_quality <= 4 && facts.stress_level >= 7,
    action: (facts) => setRisk(facts, "insomnia_risk", "moderate"),
    source: "Insomnia literature"
  },
  {
    id: "R4",
    name: "Insomnia Low Risk",
    category: "insomnia",
    condition: (facts) => facts.sleep_duration >= 7 && facts.sleep_duration <= 9 &&
      facts.sleep_quality >= 7 && facts.stress_level < 7,
    action: (facts) => setRisk(facts, "insomnia_risk", "low"),
    source: "AASM/WHO"
  },

  // =====================
  // APNEA RISK RULES
  // =====================
  {
    id: "R5",
    name: "Apnea High Risk",
    category: "apnea",
    condition: (facts) => facts.bmi_category === "Obese" && facts.bp_category === "Hypertension",
    action: (facts) => setRisk(facts, "apnea_risk", "high"),
    source: "AASM/OSA guideline"
  },
  {
    id: "R6",
    name: "Apnea Moderate Risk (Overweight + Hypertension)",
    category: "apnea",
    condition: (facts) => facts.bmi_category === "Overweight" && facts.bp_category === "Hypertension",
    action: (facts) => setRisk(facts, "apnea_risk", "moderate"),
    source: "OSA literature"
  },
  {
    id: "R7",
    name: "Apnea Moderate Risk (Obese + Age)",
    category: "apnea",
    condition: (facts) => facts.bmi_category === "Obese" && facts.age >= 40,
    action: (facts) => setRisk(facts, "apnea_risk", "moderate"),
    source: "OSA literature"
  },
  {
    id: "R8",
    name: "Apnea Low Risk",
    category: "apnea",
    condition: (facts) => facts.bmi_category === "Normal" && facts.bp_category === "Normal",
    action: (facts) => setRisk(facts, "apnea_risk", "low"),
    source: "Clinical baseline"
  },

  // =====================
  // LIFESTYLE ISSUES
  // =====================
  {
    id: "R9",
    name: "Low Physical Activity Issue",
    category: "lifestyle",
    condition: (facts) => facts.activity_level === "low",
    action: (facts) => {
      facts.lifestyle_issue_activity = true;
    },
    source: "WHO"
  },
  {
    id: "R10",
    name: "High Stress Issue",
    category: "lifestyle",
    condition: (facts) => facts.stress_level >= 7,
    action: (facts) => {
      facts.lifestyle_issue_stress = true;
    },
    source: "Psychology literature"
  },
  {
    id: "R11",
    name: "Short Sleep Issue",
    category: "lifestyle",
    condition: (facts) => facts.sleep_duration < 6,
    action: (facts) => {
      facts.lifestyle_issue_sleep = true;
    },
    source: "AASM/WHO"
  },
  {
    id: "R12",
    name: "Weight Issue",
    category: "lifestyle",
    condition: (facts) => ["Overweight", "Obese"].includes(facts.bmi_category),
    action: (facts) => {
      facts.lifestyle_issue_weight = true;
    },
    source: "WHO"
  },

  // =====================
  // DIAGNOSIS RULES
  // =====================
  {
    id: "R13",
    name: "Diagnosis: Insomnia",
    category: "diagnosis",
    condition: (facts) => (
      facts.insomnia_risk === "high" ||
      (facts.insomnia_risk === "moderate" &&
        (facts.lifestyle_issue_stress || facts.lifestyle_issue_sleep))
    ),
    action: (facts) => {
      facts.diagnosis_insomnia = true;
    },
    source: "AASM"
  },
  {
    id: "R14",
    name: "Diagnosis: Sleep Apnea",
    category: "diagnosis",
    condition: (facts) => (
      facts.apnea_risk === "high" ||
      (facts.apnea_risk === "moderate" &&
        ["Overweight", "Obese"].includes(facts.bmi_category))
    ),
    action: (facts) => {
      facts.diagnosis_apnea = true;
    },
    source: "AASM"
  },
  {
    id: "R15",
    name: "Diagnosis: Mixed Disorder",
    category: "diagnosis",
    condition: (facts) => facts.diagnosis_insomnia && facts.diagnosis_apnea,
    action: (facts) => {
      facts.diagnosis_mixed = true;
    },
    source: "Clinical"
  },
  {
    id: "R16",
    name: "Diagnosis: No Sleep Disorder",
    category: "diagnosis",
    condition: (facts) => (
      (!facts.insomnia_risk || facts.insomnia_risk === "low") &&
      (!facts.apnea_risk || facts.apnea_risk === "low") &&
      !facts.lifestyle_issue_sleep &&
      !facts.lifestyle_issue_activity &&
      !facts.lifestyle_issue_stress &&
      !facts.lifestyle_issue_weight
    ),
    action: (facts) => {
      facts.diagnosis_none = true;
    },
    source: "Clinical"
  },

  // =====================
  // RECOMMENDATIONS
  // =====================
  {
    id: "R17",
    name: "Recommendation: Sleep Hygiene",
    category: "recommendation",
    condition: (facts) => facts.diagnosis_insomnia || facts.lifestyle_issue_sleep,
    action: (facts) => {
      facts.recommendations.add("REC_SLEEP_HYGIENE");
    },
    source: "AASM"
  },
  {
    id: "R18",
    name: "Recommendation: Physical Activity",
    category: "recommendation",
    condition: (facts) => facts.lifestyle_issue_activity,
    action: (facts) => {
      facts.recommendations.add("REC_PHYSICAL_ACTIVITY");
    },
    source: "WHO"
  },
  {
    id: "R19",
    name: "Recommendation: Stress Management",
    category: "recommendation",
    condition: (facts) => facts.lifestyle_issue_stress,
    action: (facts) => {
      facts.recommendations.add("REC_STRESS_MANAGEMENT");
    },
    source: "Psychology"
  },
  {
    id: "R20",
    name: "Recommendation: Weight Management + Apnea Evaluation",
    category: "recommendation",
    condition: (facts) => facts.diagnosis_apnea ||
      (facts.apnea_risk === "high" && ["Overweight", "Obese"].includes(facts.bmi_category)),
    action: (facts) => {
      facts.recommendations.add("REC_WEIGHT_MANAGEMENT");
      facts.recommendations.add("REC_APNEA_EVAL");
    },
    source: "OSA guideline"
  }
];

module.exports = { RULES, setRisk, RISK_PRIORITY };