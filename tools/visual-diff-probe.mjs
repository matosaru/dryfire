import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
const result = spawnSync(process.execPath, ['node_modules/playwright/cli.js', 'test', '--grep', 'gun-setup/first-gun.dark at 390px'], {
  stdio: 'inherit', env: { ...process.env, VISUAL_DIFF_PROBE: '1' },
});
if (result.error) throw result.error;
if (result.status !== 1) throw new Error(`Injected visible defect must fail, got exit ${result.status}`);
const report = JSON.parse(readFileSync('test-results-probe/results.json'));
const tests = report.suites.flatMap(function flatten(suite) { return [...(suite.specs ?? []).flatMap(spec => spec.tests), ...(suite.suites ?? []).flatMap(flatten)]; });
const canonical = tests.filter(test => test.projectName === 'chromium');
const nonCanonical = tests.filter(test => test.projectName !== 'chromium');
if (canonical.length !== 1 || nonCanonical.length !== 1 || nonCanonical[0].results[0]?.status !== 'skipped' || report.stats.unexpected !== 1 || report.stats.skipped !== 1) {
  throw new Error('Expected one deliberate screenshot failure in Chromium and the non-canonical browser to be skipped.');
}
for (const test of canonical) {
  const outcome = test.results[0];
  if (outcome.status !== 'failed' || !outcome.errors.some(error => /pixels.*different|image.*differ|Screenshot comparison failed/s.test(error.message))) throw new Error('Probe failed for a reason other than visual differences.');
  for (const suffix of ['-expected.png', '-actual.png', '-diff.png']) {
    const attachment = outcome.attachments.find(item => item.name.endsWith(suffix) || item.name.endsWith(suffix.replace('.png', '')) || item.path?.endsWith(suffix));
    if (!attachment || !existsSync(attachment.path)) throw new Error(`Missing ${suffix} evidence for ${test.projectName}`);
  }
}
console.log('Expected failure verified: Chromium detects the visible defect and produces expected/actual/diff PNGs. Non-canonical browser coverage remains skipped; the application and baselines are unchanged.');
