import express from 'express';
import { preprocessInput } from './engine/factPreprocess.js';
import { forwardChain } from './engine/inference.js';
import { Neo4jClient } from './neo4j-integration/neo4jClient.js';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Helper functions
function summarizeDiagnosis(facts) {
    if (facts.diagnosis_mixed) return "Mixed Sleep Disorder (Insomnia + Sleep Apnea)";
    if (facts.diagnosis_apnea) return "Sleep Apnea";
    if (facts.diagnosis_insomnia) return "Insomnia";
    if (facts.diagnosis_none) return "No Sleep Disorder";
    return "Unspecified / Inconclusive";
}

function mapRecIdToText(recId) {
    const mapping = {
        "REC_SLEEP_HYGIENE": "Improve sleep hygiene",
        "REC_PHYSICAL_ACTIVITY": "Increase physical activity (≥150 min/week)",
        "REC_STRESS_MANAGEMENT": "Practice stress reduction / stress management",
        "REC_WEIGHT_MANAGEMENT": "Weight management program",
        "REC_APNEA_EVAL": "Consult healthcare provider for sleep apnea evaluation",
    };
    return mapping[recId] || recId;
}

// API endpoint for diagnosis
app.post('/api/diagnose', async (req, res) => {
    try {
        const rawInput = req.body;
        
        // Basic validation
        if (!rawInput.BloodPressure || !rawInput.BloodPressure.includes('/')) {
            return res.status(400).json({ error: "Blood Pressure format invalid. Use e.g. '120/80'." });
        }

        const preprocessed = preprocessInput(rawInput);
        const { facts: finalFacts, firedRules } = forwardChain(preprocessed);

        const result = {
            diagnosis: summarizeDiagnosis(finalFacts),
            insomniaRisk: finalFacts.insomnia_risk || "N/A",
            apneaRisk: finalFacts.apnea_risk || "N/A",
            lifestyleIssues: {
                sleep: finalFacts.lifestyle_issue_sleep || false,
                stress: finalFacts.lifestyle_issue_stress || false,
                activity: finalFacts.lifestyle_issue_activity || false,
                weight: finalFacts.lifestyle_issue_weight || false,
            },
            recommendations: (finalFacts.recommendations || []).map(recId => ({
                id: recId,
                text: mapRecIdToText(recId)
            })),
            firedRules: firedRules,
            allFacts: finalFacts
        };

        res.json(result);
    } catch (error) {
        console.error('Diagnosis error:', error);
        res.status(500).json({ error: 'Internal server error during diagnosis' });
    }
});

app.listen(PORT, () => {
    console.log(`Sleep Health KBS server running on http://localhost:${PORT}`);
});