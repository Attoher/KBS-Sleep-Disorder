import { readFile } from 'fs/promises';
import { preprocessInput } from '../engine/factPreprocess.js';
import { forwardChain } from '../engine/inference.js';

async function main() {
    try {
        const raw = JSON.parse(await readFile('./examples/exampleInput.json', 'utf8'));
        
        const facts = preprocessInput(raw);
        const { facts: finalFacts, firedRules } = forwardChain(facts);

        console.log("=== FINAL FACTS ===");
        for (const [k, v] of Object.entries(finalFacts)) {
            console.log(`${k}: ${v}`);
        }

        console.log("\n=== RULES FIRED ===");
        console.log(firedRules);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();