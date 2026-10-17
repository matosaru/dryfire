import { readFileSync } from 'node:fs';
import { measureArtifact, payloadViolations } from './artifact.mjs';
const actual = measureArtifact('dist');
const baselines = JSON.parse(readFileSync('docs/architecture/performance-baseline.json','utf8'));
const baseline = baselines.editions[actual.edition];
if (!baseline) throw new Error(`Missing accepted ${actual.edition} payload budget.`);
const errors = payloadViolations(actual,baseline);
if (errors.length) throw new Error(errors.join('\n'));
console.log(`${actual.edition}: critical JS ${actual.critical.js.raw} raw / ${actual.critical.js.gzip} gzip; CSS ${actual.critical.css.raw} raw / ${actual.critical.css.gzip} gzip. Payload budgets pass.`);
