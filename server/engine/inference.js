const { RULES } = require('./rules');

function initializeFacts(facts) {
  // Set default values
  const defaults = {
    insomnia_risk: null,
    apnea_risk: null,
    lifestyle_issue_sleep: false,
    lifestyle_issue_stress: false,
    lifestyle_issue_activity: false,
    lifestyle_issue_weight: false,
    diagnosis_insomnia: false,
    diagnosis_apnea: false,
    diagnosis_mixed: false,
    diagnosis_none: false,
    recommendations: new Set()
  };

  // Merge with provided facts
  return { ...defaults, ...facts };
}

function forwardChain(facts) {
  const initializedFacts = initializeFacts(facts);
  const firedRules = [];
  const firedSet = new Set();

  let changed = true;
  
  while (changed) {
    changed = false;

    for (const rule of RULES) {
      const ruleId = rule.id;

      if (firedSet.has(ruleId)) {
        continue;
      }

      try {
        if (rule.condition(initializedFacts)) {
          rule.action(initializedFacts);
          firedSet.add(ruleId);
          firedRules.push(ruleId);
          changed = true;
        }
      } catch (error) {
        console.error(`Error executing rule ${ruleId}:`, error);
      }
    }
  }

  // Convert Set to Array for recommendations
  if (initializedFacts.recommendations instanceof Set) {
    initializedFacts.recommendations = Array.from(initializedFacts.recommendations);
  }

  return {
    facts: initializedFacts,
    firedRules: firedRules.sort(),
    firedRulesDetails: firedRules.map(id => RULES.find(r => r.id === id))
  };
}

// Get all rules for documentation
function getAllRules() {
  return RULES.map(rule => ({
    id: rule.id,
    name: rule.name,
    category: rule.category,
    source: rule.source,
    description: getRuleDescription(rule)
  }));
}

function getRuleDescription(rule) {
  const descriptions = {
    "R1": "Jika durasi tidur <5 jam DAN kualitas tidur ≤4, risiko insomnia = tinggi",
    "R2": "Jika durasi tidur 5-6 jam DAN tingkat stres ≥7, risiko insomnia = sedang",
    "R3": "Jika kualitas tidur ≤4 DAN tingkat stres ≥7, risiko insomnia = sedang",
    "R4": "Jika durasi tidur 7-9 jam, kualitas ≥7, DAN stres <7, risiko insomnia = rendah",
    "R5": "Jika Obesitas DAN Hipertensi, risiko apnea = tinggi",
    "R6": "Jika Overweight DAN Hipertensi, risiko apnea = sedang",
    "R7": "Jika Obesitas DAN usia ≥40, risiko apnea = sedang",
    "R8": "Jika BMI Normal DAN tekanan darah Normal, risiko apnea = rendah",
    "R9": "Jika aktivitas fisik rendah, tandai masalah gaya hidup: aktivitas",
    "R10": "Jika tingkat stres ≥7, tandai masalah gaya hidup: stres",
    "R11": "Jika durasi tidur <6 jam, tandai masalah gaya hidup: tidur",
    "R12": "Jika BMI Overweight/Obese, tandai masalah gaya hidup: berat badan",
    "R13": "Jika risiko insomnia tinggi ATAU (sedang + ada masalah stres/tidur), diagnosis insomnia",
    "R14": "Jika risiko apnea tinggi ATAU (sedang + masalah berat badan), diagnosis apnea",
    "R15": "Jika diagnosis insomnia DAN apnea, diagnosis campuran",
    "R16": "Jika semua risiko rendah DAN tidak ada masalah gaya hidup, tidak ada gangguan",
    "R17": "Jika diagnosis insomnia ATAU masalah tidur, rekomendasi kebersihan tidur",
    "R18": "Jika masalah aktivitas, rekomendasi aktivitas fisik",
    "R19": "Jika masalah stres, rekomendasi manajemen stres",
    "R20": "Jika diagnosis apnea ATAU risiko apnea tinggi, rekomendasi manajemen berat + evaluasi apnea"
  };
  
  return descriptions[rule.id] || "Tidak ada deskripsi tersedia";
}

module.exports = {
  forwardChain,
  getAllRules,
  initializeFacts
};