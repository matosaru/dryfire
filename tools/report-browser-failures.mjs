// Preserve Playwright's result/exit status; expose bounded details beyond its summary.
import { readFileSync, existsSync } from 'node:fs';
const path = process.argv[2] || 'test-results/results.json';
if (!existsSync(path)) { console.log('No browser result JSON was produced.'); process.exit(0); }
const report = JSON.parse(readFileSync(path, 'utf8'));
const failures = [];
function visit(suite, parents = []) {
  for (const spec of suite.specs || []) for (const test of spec.tests || []) {
    const failed = (test.results || []).find(result => ['failed', 'timedOut', 'interrupted'].includes(result.status));
    if (failed) failures.push([`${test.projectName}: ${spec.file}:${spec.line} ${[...parents, spec.title].join(' › ')}`,
      ...(failed.errors || []).map(error => error.message || error.stack || String(error))].join('\n').replace(/\u001b\[[0-9;]*m/g, '').slice(0, 2300));
  }
  for (const child of suite.suites || []) visit(child, [...parents, suite.title].filter(Boolean));
}
for (const suite of report.suites || []) visit(suite);
for (let index = 0; index < failures.length; index += 15) {
  const body = failures.slice(index, index + 15).join('\n\n').replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
  console.log(`::notice title=Browser failure details ${index / 15 + 1}::${body}`);
}
console.log(`${failures.length} browser failures reported; original Playwright status is unchanged.`);
