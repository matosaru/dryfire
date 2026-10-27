import { coverageViolations } from '../tools/coverage-policy.mjs';
const metrics = pct => Object.fromEntries(['statements','branches','functions','lines'].map(name => [name, { pct }]));
const floor = Object.fromEntries(['statements','branches','functions','lines'].map(name => [name, 80]));
const policy = { total: floor, files: { 'src/audio.js': floor }, newRuntimeRoots: ['apps/web/src/'], newRuntimeMinimum: { ...floor, lines: 90 } };
const summary = () => ({ total: metrics(90), '/repo/src/audio.js': metrics(90) });
test('an expanded report retains its full denominator and covered runtime owners', () => {
  expect(coverageViolations(summary(), policy, '/repo')).toEqual([]);
});
test('a missing measured owner cannot disappear silently from coverage', () => {
  const report = summary(); delete report['/repo/src/audio.js'];
  expect(coverageViolations(report, policy, '/repo')).toEqual(['src/audio.js: missing coverage']);
});
test('lower global coverage fails even when individual measured modules pass', () => {
  const report = summary(); report.total.lines.pct = 79;
  expect(coverageViolations(report, policy, '/repo')[0]).toContain('total: lines 79% below 80%');
});
test('a file regression cannot be hidden by a higher overall result', () => {
  const report = summary(); report['/repo/src/audio.js'].branches.pct = 79;
  expect(coverageViolations(report, policy, '/repo')[0]).toContain('src/audio.js: branches');
});
test('new typed runtime code needs the approved package floor', () => {
  const report = summary(); report['/repo/apps/web/src/features/practice/adapter.ts'] = metrics(85);
  expect(coverageViolations(report, policy, '/repo')[0]).toContain('adapter.ts: lines 85% below 90%');
});
test('a missing metric fails rather than being interpreted as a passing zero-work module', () => {
  const report = summary(); delete report['/repo/src/audio.js'].functions;
  expect(coverageViolations(report, policy, '/repo')[0]).toContain('functions missing%');
});
test('extracted owners retain an aggregate denominator and the unchanged original floor',()=>{const p={total:floor,files:{},newRuntimeRoots:[],groups:{storage:{files:['src/a.js','src/b.js'],minimum:floor}}};const counted=(covered,total)=>Object.fromEntries(['statements','branches','functions','lines'].map(key=>[key,{covered,total,pct:covered/total*100}]));const report={total:metrics(90),'/repo/src/a.js':counted(9,10),'/repo/src/b.js':counted(71,90)};expect(coverageViolations(report,p,'/repo')).toEqual([]);report['/repo/src/b.js']=counted(70,90);expect(coverageViolations(report,p,'/repo')).toHaveLength(4);delete report['/repo/src/b.js'];expect(coverageViolations(report,p,'/repo')).toEqual(['storage: missing coverage src/b.js']);});
