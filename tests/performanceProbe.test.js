import { timingProbeRejected } from '../tools/performance/timing-probe-policy.mjs';
const slowdown = metric => `chromium ${metric}: confirmed paired median slowdown (20/20 slower pairs); baseline median/p95 100/120, candidate 350/370; 99% difference interval {}.`;
const diagnostic = 'chromium warm navigation phase medians (ms since navigation, diagnostic only): baseline {"ready":100}; candidate {"ready":350}.';
function evidence() { return { runtimeProbe: 'Deliberate candidate-only 250 ms startup CPU stall; expected regression.', browsers: { chromium: { comparisons: { cold: {regression:true},warm:{regression:true},returning:{regression:true} } } }, errors: [slowdown('cold'),slowdown('warm'),diagnostic,slowdown('returning')] }; }
const failed = {status:1};
test('the slowdown control accepts confirmed startup regressions with their warm phase diagnostic', () => {
  expect(timingProbeRejected(failed,evidence())).toBe(true);
});
test('the diagnostic is optional when no warm regression was confirmed', () => {
  const report=evidence();report.errors=[slowdown('cold')];report.browsers.chromium.comparisons.warm.regression=false;
  expect(timingProbeRejected(failed,report)).toBe(true);
});
test.each([{status:0},{status:null},{status:1,error:new Error('spawn failed')}])('a successful or failed-to-run command never proves rejection: %p', result => {
  expect(timingProbeRejected(result,evidence())).toBe(false);
});
test.each(['Critical js raw: 200 exceeds 100.','Error: page crashed','chromium actual startup: Critical js raw: 200 exceeds 100.'])('unrelated failure is not accepted as expected slowdown: %s', error => {
  const report=evidence();report.errors.push(error);expect(timingProbeRejected(failed,report)).toBe(false);
});
test('missing startup proof or missing probe marker is rejected', () => {
  const report=evidence();report.runtimeProbe=null;expect(timingProbeRejected(failed,report)).toBe(false);
  report.runtimeProbe='controlled';for(const metric of Object.values(report.browsers.chromium.comparisons))metric.regression=false;
  expect(timingProbeRejected(failed,report)).toBe(false);
});
test('an orphan warm diagnostic is not allowed to mask missing warm slowdown evidence', () => {
  const report=evidence();report.errors=[slowdown('cold'),diagnostic];report.browsers.chromium.comparisons.warm.regression=false;
  expect(timingProbeRejected(failed,report)).toBe(false);
});
test('empty errors are not proof of rejection', () => {
  const report=evidence();report.errors=[];expect(timingProbeRejected(failed,report)).toBe(false);
});
test('a regression flag without its matching error is insufficient', () => {
  const report=evidence();report.errors=[slowdown('navigation')];report.browsers.chromium.comparisons.navigation={regression:true};
  expect(timingProbeRejected(failed,report)).toBe(false);
});
test('a confirmed tail regression also proves the startup control', () => {
  const report=evidence();report.errors=[slowdown('cold').replace('paired median','p95 tail')];
  expect(timingProbeRejected(failed,report)).toBe(true);
});
test.each([{}, {runtimeProbe:'controlled'}, {runtimeProbe:'controlled',browsers:{chromium:{comparisons:{}}},errors:[null]}])('incomplete evidence fails closed: %p', report => {
  expect(timingProbeRejected(failed,report)).toBe(false);
});
test('a textual slowdown is rejected when its comparison did not confirm regression', () => {
  const report=evidence();report.errors=[slowdown('cold')];report.browsers.chromium.comparisons.cold.regression=false;
  expect(timingProbeRejected(failed,report)).toBe(false);
});
test('a diagnostic without its actual warm error cannot borrow a warm regression flag', () => {
  const report=evidence();report.errors=[slowdown('cold'),diagnostic];
  expect(timingProbeRejected(failed,report)).toBe(false);
});
