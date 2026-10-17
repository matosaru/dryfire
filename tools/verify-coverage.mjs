import { readFileSync } from 'node:fs';
import { coverageViolations } from './coverage-policy.mjs';
const policy = JSON.parse(readFileSync('docs/architecture/coverage-baseline.json', 'utf8'));
const summary = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));
const errors = coverageViolations(summary, policy);
if (errors.length) throw new Error(`Coverage regression:\n${errors.join('\n')}`);
console.log(`Coverage ratchet verified for ${Object.keys(policy.files).length} runtime modules and new typed packages.`);
