// Temporary synthetic test diagnostics for reviewing initial collection failures.
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
if (!existsSync('test-results/results.json')) process.exit(0);
const report = JSON.parse(readFileSync('test-results/results.json'));
const failures = report.suites.flatMap(function flatten(suite) {
  return [...(suite.specs ?? []).flatMap(spec => spec.tests.filter(test => test.status !== 'expected').map(test => ({
    title: spec.title, browser: test.projectName, status: test.results.at(-1)?.status,
    errors: (test.results.at(-1)?.errors ?? []).map(error => error.message.replace(/\x1b\[[0-9;]*m/g, '').slice(0, 3000)),
  }))), ...(suite.suites ?? []).flatMap(flatten)];
});
mkdirSync('visual-candidates', { recursive: true });
writeFileSync('visual-candidates/diagnostics.json', JSON.stringify({ source: process.env.GITHUB_SHA, stats: report.stats, errors: report.errors, failures }, null, 2) + '\n');
if (existsSync('test-results/build-manifest.json')) copyFileSync('test-results/build-manifest.json', 'visual-candidates/build-manifest.json');
