import { readFileSync } from 'node:fs';
import { measureArtifact, payloadViolations } from './artifact.mjs';
import { readBuildProfile } from '../build-profile.mjs';
const actual = measureArtifact('dist');
const baselines = JSON.parse(readFileSync('docs/architecture/performance-baseline.json','utf8'));
// Full's remembered-mode default predates this refactor and changes chunk
// hashes/compression slightly. Compare the matching original branch profile.
const full = readBuildProfile() === 'preview' ? JSON.parse(readFileSync('docs/architecture/performance-baseline.full.json','utf8')) : null;
const baseline = full?.editions[actual.edition] ?? baselines.editions[actual.edition];
if (!baseline) throw new Error(`Missing accepted ${actual.edition} payload budget.`);
const errors = payloadViolations(actual,baseline);
if (errors.length) throw new Error(errors.join('\n'));
console.log(`${actual.edition}: critical JS ${actual.critical.js.raw} raw / ${actual.critical.js.gzip} gzip; CSS ${actual.critical.css.raw} raw / ${actual.critical.css.gzip} gzip. Payload budgets pass.`);
