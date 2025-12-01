/**
 * Inference Engine
 * Ported from kbs/engine/inference.py
 */

import { ProcessedFacts } from "./fact_preprocess";
import { RULES } from "./rules";

const initializeFacts = (facts: ProcessedFacts): ProcessedFacts => {
    // Defaults are mostly handled in preprocessInput or by optional types
    // But we ensure risks are null if not set
    if (!facts.insomnia_risk) facts.insomnia_risk = null;
    if (!facts.apnea_risk) facts.apnea_risk = null;

    return facts;
};

export interface InferenceResult {
    facts: ProcessedFacts;
    firedRules: string[];
}

export const forwardChain = (facts: ProcessedFacts): InferenceResult => {
    facts = initializeFacts(facts);
    const firedRules: string[] = [];
    const firedSet = new Set<string>();

    let changed = true;
    while (changed) {
        changed = false;

        for (const rule of RULES) {
            if (firedSet.has(rule.id)) continue;

            if (rule.condition(facts)) {
                rule.action(facts);
                firedSet.add(rule.id);
                firedRules.push(rule.id);
                changed = true;
            }
        }
    }

    return { facts, firedRules };
};
