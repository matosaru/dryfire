import { relative, resolve } from 'node:path';

const metrics = ['statements', 'branches', 'functions', 'lines'];
export function coverageViolations(summary, policy, root = process.cwd()) {
  const errors = [];
  const entries = Object.fromEntries(Object.entries(summary).filter(([path]) => path !== 'total')
    .map(([path, value]) => [relative(root, resolve(path)).replaceAll('\\', '/'), value]));
  const check = (name, actual, floor) => {
    if (!actual) { errors.push(`${name}: missing coverage`); return; }
    for (const metric of metrics) if (!Number.isFinite(actual[metric]?.pct) || actual[metric].pct < floor[metric]) {
      errors.push(`${name}: ${metric} ${actual[metric]?.pct ?? 'missing'}% below ${floor[metric]}%`);
    }
  };
  check('total', summary.total, policy.total);
  for (const [path, floor] of Object.entries(policy.files)) check(path, entries[path], floor);
  for (const [path, value] of Object.entries(entries)) {
    if (!policy.files[path] && policy.newRuntimeRoots.some(prefix => path.startsWith(prefix))) {
      check(path, value, policy.newRuntimeMinimum);
    }
  }
  return errors;
}
