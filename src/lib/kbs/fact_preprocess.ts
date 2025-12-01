/**
 * Fact Preprocessing Module
 * Ported from kbs/engine/fact_preprocess.py
 */

export interface RawInput {
    age: number;
    gender: string;
    sleepDuration: number;
    qualityOfSleep: number;
    stressLevel: number;
    physicalActivity: number;
    bmiCategory: string;
    bloodPressure: string;
    heartRate: number;
    dailySteps: number;
}

export interface ProcessedFacts {
    // Raw values
    age: number;
    gender: string;
    sleep_duration: number;
    sleep_quality: number;
    stress_level: number;
    activity_minutes: number;
    bmi_category: string;
    heart_rate: number;
    daily_steps: number;

    // Categorized values
    sleep_duration_cat: string;
    sleep_quality_cat: string;
    stress_cat: string;
    activity_level: string;
    bp_category: string;

    // Derived risks (initialized to null/low)
    insomnia_risk?: string | null;
    apnea_risk?: string | null;

    // Lifestyle issues
    lifestyle_issue_sleep?: boolean;
    lifestyle_issue_stress?: boolean;
    lifestyle_issue_activity?: boolean;
    lifestyle_issue_weight?: boolean;

    // Diagnoses
    diagnosis_insomnia?: boolean;
    diagnosis_apnea?: boolean;
    diagnosis_mixed?: boolean;
    diagnosis_none?: boolean;

    // Recommendations
    recommendations: Set<string>;
}

// Helper functions
const parseBp = (bpString: string): [number, number] => {
    const [sys, dia] = bpString.split("/").map(Number);
    return [sys, dia];
};

const categorizeBp = (sys: number, dia: number): string => {
    if (sys < 120 && dia < 80) return "Normal";
    if ((sys >= 120 && sys < 140) || (dia >= 80 && dia < 90)) return "Elevated";
    return "Hypertension";
};

const categorizeSleepDuration = (hours: number): string => {
    if (hours < 5) return "very_short";
    if (hours < 7) return "short";
    if (hours <= 9) return "normal";
    return "long";
};

const categorizeSleepQuality = (q: number): string => {
    if (q <= 4) return "poor";
    if (q <= 6) return "fair";
    if (q <= 8) return "good";
    return "very_good";
};

const categorizeStress = (s: number): string => {
    if (s <= 3) return "low";
    if (s <= 6) return "moderate";
    return "high";
};

const categorizeActivity = (mins: number): string => {
    if (mins < 30) return "low";
    if (mins <= 60) return "moderate";
    return "high";
};

export const preprocessInput = (raw: RawInput): ProcessedFacts => {
    const [sysBp, diaBp] = parseBp(raw.bloodPressure);
    const bpCat = categorizeBp(sysBp, diaBp);

    return {
        age: raw.age,
        gender: raw.gender,
        sleep_duration: raw.sleepDuration,
        sleep_quality: raw.qualityOfSleep,
        stress_level: raw.stressLevel,
        activity_minutes: raw.physicalActivity,
        bmi_category: raw.bmiCategory, // Ensure casing matches (e.g. "Obese", "Normal")
        heart_rate: raw.heartRate,
        daily_steps: raw.dailySteps,

        // Categorized
        sleep_duration_cat: categorizeSleepDuration(raw.sleepDuration),
        sleep_quality_cat: categorizeSleepQuality(raw.qualityOfSleep),
        stress_cat: categorizeStress(raw.stressLevel),
        activity_level: categorizeActivity(raw.physicalActivity),
        bp_category: bpCat,

        // Initialize derived fields
        recommendations: new Set<string>(),
    };
};
