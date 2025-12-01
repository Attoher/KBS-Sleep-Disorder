function parseBp(bpString) {
    const [sys, dia] = bpString.split("/").map(Number);
    return { sys, dia };
}

function categorizeBp(sys, dia) {
    if (sys < 120 && dia < 80) return "Normal";
    if (sys < 140 && dia < 90) return "Elevated";
    return "Hypertension";
}

function categorizeSleepDuration(hours) {
    if (hours < 5) return "very_short";
    if (hours < 7) return "short";
    if (hours <= 9) return "normal";
    return "long";
}

function categorizeSleepQuality(q) {
    if (q <= 4) return "poor";
    if (q <= 6) return "fair";
    if (q <= 8) return "good";
    return "very_good";
}

function categorizeStress(s) {
    if (s <= 3) return "low";
    if (s <= 6) return "moderate";
    return "high";
}

function categorizeActivity(mins) {
    if (mins < 30) return "low";
    if (mins <= 60) return "moderate";
    return "high";
}

export function preprocessInput(raw) {
    const { sys, dia } = parseBp(raw["Blood Pressure"]);
    const bpCat = categorizeBp(sys, dia);

    return {
        age: raw.Age,
        gender: raw.Gender,
        sleep_duration: raw["Sleep Duration"],
        sleep_duration_cat: categorizeSleepDuration(raw["Sleep Duration"]),
        sleep_quality: raw["Quality of Sleep"],
        sleep_quality_cat: categorizeSleepQuality(raw["Quality of Sleep"]),
        stress_level: raw["Stress Level"],
        stress_cat: categorizeStress(raw["Stress Level"]),
        activity_minutes: raw["Physical Activity Level"],
        activity_level: categorizeActivity(raw["Physical Activity Level"]),
        bmi_category: raw["BMI Category"],
        bp_category: bpCat,
        heart_rate: raw["Heart Rate"],
        daily_steps: raw["Daily Steps"]
    };
}