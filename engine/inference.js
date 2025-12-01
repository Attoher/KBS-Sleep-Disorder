import { RULES } from './rules.js';

function initializeFacts(facts) {
    /** Set default values for all derived facts and structures. */
    if (facts.insomnia_risk === undefined) facts.insomnia_risk = null;
    if (facts.apnea_risk === undefined) facts.apnea_risk = null;

    if (facts.lifestyle_issue_sleep === undefined) facts.lifestyle_issue_sleep = false;
    if (facts.lifestyle_issue_stress === undefined) facts.lifestyle_issue_stress = false;
    if (facts.lifestyle_issue_activity === undefined) facts.lifestyle_issue_activity = false;
    if (facts.lifestyle_issue_weight === undefined) facts.lifestyle_issue_weight = false;

    if (facts.diagnosis_insomnia === undefined) facts.diagnosis_insomnia = false;
    if (facts.diagnosis_apnea === undefined) facts.diagnosis_apnea = false;
    if (facts.diagnosis_mixed === undefined) facts.diagnosis_mixed = false;
    if (facts.diagnosis_none === undefined) facts.diagnosis_none = false;

    // Use SET for recommendations (anti-duplicate)
    let recs = facts.recommendations;
    if (recs === undefined) {
        facts.recommendations = new Set();
    } else if (Array.isArray(recs)) {
        facts.recommendations = new Set(recs);
    }
    // If already a Set, leave as is

    return facts;
}

export function forwardChain(facts) {
    /**
     * Simple forward chaining:
     * - Each rule can only fire once.
     * - No before/after checking; while condition is True and hasn't fired, rule executes.
     * - Stops when no new rules fire in one iteration.
     */
    facts = initializeFacts(facts);
    const firedRules = [];
    const firedSet = new Set();

    let changed = true;
    while (changed) {
        changed = false;

        for (const rule of RULES) {
            const rid = rule.id;

            if (firedSet.has(rid)) continue;

            if (rule.condition(facts)) {
                rule.action(facts);
                firedSet.add(rid);
                firedRules.push(rid);
                changed = true;
            }
        }
    }

    // Convert recommendations from SET → LIST before returning
    if (facts.recommendations instanceof Set) {
        facts.recommendations = Array.from(facts.recommendations);
    }

    return { facts, firedRules };
}