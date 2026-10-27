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
  // A moved implementation retains its original logical-owner floor and full denominator.
  for(const [name,group]of Object.entries(policy.groups??{})){
    const missing=group.files.filter(path=>!entries[path]);
    if(missing.length){for(const path of missing)errors.push(`${name}: missing coverage ${path}`);continue;}
    const aggregate=Object.fromEntries(metrics.map(metric=>{const total=group.files.reduce((sum,path)=>sum+entries[path][metric].total,0),covered=group.files.reduce((sum,path)=>sum+entries[path][metric].covered,0);return[metric,{pct:total?Math.floor(covered/total*10000)/100:100}];}));
    check(name,aggregate,group.minimum);
  }

  for (const [path, value] of Object.entries(entries)) {
    if (!policy.files[path] && policy.newRuntimeRoots.some(prefix => path.startsWith(prefix))) {
      check(path, value, policy.newRuntimeMinimum);
    }
  }
  return errors;
}
