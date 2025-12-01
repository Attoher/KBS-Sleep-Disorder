/**
 * Rules Module
 * Ported from kbs/engine/rules.py
 */

import { ProcessedFacts } from "./fact_preprocess";

export interface Rule {
    id: string;
    condition: (f: ProcessedFacts) => boolean;
    action: (f: ProcessedFacts) => void;
}

// Risk Priority: low < moderate < high
const RISK_PRIORITY: Record<string, number> = {
    low: 0,
    moderate: 1,
    high: 2,
};

const setRisk = (facts: ProcessedFacts, key: "insomnia_risk" | "apnea_risk", level: string) => {
    const current = facts[key];
    if (!current) {
        facts[key] = level;
        return;
    }

    const currentPriority = RISK_PRIORITY[current] || -1;
    const newPriority = RISK_PRIORITY[level];

    if (newPriority > currentPriority) {
        facts[key] = level;
    }
};

export const RULES: Rule[] = [
    // =====================
    // INSOMNIA RISK RULES
    // =====================
    {
        id: "R1",
        condition: (f) => f.sleep_duration < 5 && f.sleep_quality <= 4,
        action: (f) => setRisk(f, "insomnia_risk", "high"),
    },
    {
        id: "R2",
        condition: (f) => f.sleep_duration >= 5 && f.sleep_duration < 7 && f.stress_level >= 7,
        action: (f) => setRisk(f, "insomnia_risk", "moderate"),
    },
    {
        id: "R3",
        condition: (f) => f.sleep_quality <= 4 && f.stress_level >= 7,
        action: (f) => setRisk(f, "insomnia_risk", "moderate"),
    },
    {
        id: "R4",
        condition: (f) =>
            f.sleep_duration >= 7 &&
            f.sleep_duration <= 9 &&
            f.sleep_quality >= 7 &&
            f.stress_level < 7,
        action: (f) => setRisk(f, "insomnia_risk", "low"),
    },

    // =====================
    // APNEA RISK RULES
    // =====================
    {
        id: "R5",
        condition: (f) => f.bmi_category === "Obese" && f.bp_category === "Hypertension",
        action: (f) => setRisk(f, "apnea_risk", "high"),
    },
    {
        id: "R6",
        condition: (f) => f.bmi_category === "Overweight" && f.bp_category === "Hypertension",
        action: (f) => setRisk(f, "apnea_risk", "moderate"),
    },
    {
        id: "R7",
        condition: (f) => f.bmi_category === "Obese" && f.age >= 40,
        action: (f) => setRisk(f, "apnea_risk", "moderate"),
    },
    {
        id: "R8",
        condition: (f) => f.bmi_category === "Normal" && f.bp_category === "Normal",
        action: (f) => setRisk(f, "apnea_risk", "low"),
    },

    // =====================
    // LIFESTYLE ISSUES
    // =====================
    {
        id: "R9",
        condition: (f) => f.activity_level === "low",
        action: (f) => { f.lifestyle_issue_activity = true; },
    },
    {
        id: "R10",
        condition: (f) => f.stress_level >= 7,
        action: (f) => { f.lifestyle_issue_stress = true; },
    },
    {
        id: "R11",
        condition: (f) => f.sleep_duration < 6,
        action: (f) => { f.lifestyle_issue_sleep = true; },
    },
    {
        id: "R12",
        condition: (f) => ["Overweight", "Obese"].includes(f.bmi_category),
        action: (f) => { f.lifestyle_issue_weight = true; },
    },

    // =====================
    // FINAL DIAGNOSIS
    // =====================
    {
        id: "R13",
        condition: (f) =>
            f.insomnia_risk === "high" ||
            (f.insomnia_risk === "moderate" && (f.lifestyle_issue_stress || f.lifestyle_issue_sleep)),
        action: (f) => { f.diagnosis_insomnia = true; },
    },
    {
        id: "R14",
        condition: (f) =>
            f.apnea_risk === "high" ||
            (f.apnea_risk === "moderate" && ["Overweight", "Obese"].includes(f.bmi_category)),
        action: (f) => { f.diagnosis_apnea = true; },
    },
    {
        id: "R15",
        condition: (f) => !!f.diagnosis_insomnia && !!f.diagnosis_apnea,
        action: (f) => { f.diagnosis_mixed = true; },
    },
    {
        id: "R16",
        condition: (f) =>
            (!f.insomnia_risk || f.insomnia_risk === "low") &&
            (!f.apnea_risk || f.apnea_risk === "low") &&
            !f.lifestyle_issue_sleep &&
            !f.lifestyle_issue_activity &&
            !f.lifestyle_issue_stress &&
            !f.lifestyle_issue_weight,
        action: (f) => { f.diagnosis_none = true; },
    },

    // =====================
    // RECOMMENDATIONS
    // =====================
    {
        id: "R17",
        condition: (f) => !!f.diagnosis_insomnia || !!f.lifestyle_issue_sleep,
        action: (f) => f.recommendations.add("REC_SLEEP_HYGIENE"),
    },
    {
        id: "R18",
        condition: (f) => !!f.lifestyle_issue_activity,
        action: (f) => f.recommendations.add("REC_PHYSICAL_ACTIVITY"),
    },
    {
        id: "R19",
        condition: (f) => !!f.lifestyle_issue_stress,
        action: (f) => f.recommendations.add("REC_STRESS_MANAGEMENT"),
    },
    {
        id: "R20",
        condition: (f) =>
            !!f.diagnosis_apnea ||
            (f.apnea_risk === "high" && ["Overweight", "Obese"].includes(f.bmi_category)),
        action: (f) => {
            f.recommendations.add("REC_WEIGHT_MANAGEMENT");
            f.recommendations.add("REC_APNEA_EVAL");
        },
    },
];
