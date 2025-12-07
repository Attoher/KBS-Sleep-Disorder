export const RECOMMENDATION_TEXTS = {
  REC_SLEEP_HYGIENE: 'Improve sleep hygiene practices',
  REC_PHYSICAL_ACTIVITY: 'Increase physical activity (≥30 minutes per day)',
  REC_STRESS_MANAGEMENT: 'Practice stress reduction techniques',
  REC_WEIGHT_MANAGEMENT: 'Follow a weight management program',
  REC_APNEA_EVAL: 'Consult healthcare provider for sleep apnea evaluation',
};

export const RULE_DESCRIPTIONS = {
  R1: 'Sleep Duration < 5 hours AND Quality <= 4 → insomnia_risk = high',
  R2: 'Duration 5-6 hours AND Stress >= 7 → insomnia_risk = moderate',
  R3: 'Quality <= 4 AND Stress >= 7 → insomnia_risk = moderate',
  R4: 'Duration 7-9 hours AND Quality >= 7 AND Stress < 7 → insomnia_risk = low',
  R5: 'Obese AND Hypertension → apnea_risk = high',
  R6: 'Overweight AND Hypertension → apnea_risk = moderate',
  R7: 'Obese AND Age >= 40 → apnea_risk = moderate',
  R8: 'Normal BMI AND Normal BP → apnea_risk = low',
  R9: 'Physical Activity < 30 minutes → lifestyle_issue_activity = true',
  R10: 'Stress >= 7 → lifestyle_issue_stress = true',
  R11: 'Sleep Duration < 6 hours → lifestyle_issue_sleep = true',
  R12: 'BMI in {Overweight, Obese} → lifestyle_issue_weight = true',
  R13: 'insomnia_risk = high OR (moderate + stress/sleep issue) → diagnosis_insomnia = true',
  R14: 'apnea_risk = high OR (moderate + BMI issue) → diagnosis_apnea = true',
  R15: 'diagnosis_insomnia AND diagnosis_apnea → diagnosis_mixed = true',
  R16: 'All risks low AND no lifestyle issues → diagnosis_none = true',
  R17: 'Insomnia diagnosis OR sleep issue → add REC_SLEEP_HYGIENE',
  R18: 'Activity issue → add REC_PHYSICAL_ACTIVITY',
  R19: 'Stress issue → add REC_STRESS_MANAGEMENT',
  R20: 'Apnea diagnosis OR apnea high → add REC_WEIGHT_MANAGEMENT + REC_APNEA_EVAL',
};

export const DIAGNOSIS_COLORS = {
  'Insomnia': 'from-blue-500 to-blue-600',
  'Sleep Apnea': 'from-purple-500 to-purple-600',
  'Mixed Sleep Disorder (Insomnia + Sleep Apnea)': 'from-red-500 to-red-600',
  'No Sleep Disorder': 'from-green-500 to-green-600',
  'Unspecified / Inconclusive': 'from-gray-500 to-gray-600',
};