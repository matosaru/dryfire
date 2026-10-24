import { timingStatistics, timingEvidence } from '../tools/performance/timing-policy.mjs';

test('a consistent slowdown, including one below 5%, remains a failing regression', () => {
  const original=Array.from({length:40},(_,i)=>100+i%4);
  for(const delta of [2,50]) {
    const result=timingEvidence(original,original.map(value=>value+delta));
    expect(result.regression).toBe(true);expect(result.medianConfirmed).toBe(true);
    expect(result.confidence.median.lower).toBe(delta);
  }
});

test('a tail-only slowdown is detected even when the median is unchanged', () => {
  const original=Array(40).fill(100), changed=original.map((value,i)=>i>=24?200:value);
  const result=timingEvidence(original,changed);
  expect(result.baseline.median).toBe(result.candidate.median);
  expect(result.medianConfirmed).toBe(false);expect(result.tailConfirmed).toBe(true);expect(result.regression).toBe(true);
});

test('a noisy high-quantile point does not claim reproducibility when its paired interval crosses zero', () => {
  const original=Array.from({length:40},(_,i)=>100+(i%20)*2);
  const changed=original.map((value,i)=>i%20>=16?value+10:value-1);
  const result=timingEvidence(original,changed);
  expect(result.observedSignal).toBe(true);expect(result.confidence.p95.lower).toBeLessThanOrEqual(0);
  expect(result.regression).toBe(false);expect(result.interpretation).toContain('retain uncertainty');
});

test('identical-code controls retain raw signals without overriding the candidate comparison', () => {
  const original=Array(20).fill(100),changed=Array(20).fill(200);
  const control=timingEvidence(original,changed,true);
  expect(control.confirmedSignal).toBe(true);expect(control.regression).toBe(false);
  expect(timingEvidence(original,changed).regression).toBe(true);
  expect(timingEvidence(original,original).regression).toBe(false);
  expect(timingEvidence(changed,original).observedSignal).toBe(false);
});

test('deterministic evidence and rank definitions remain reproducible, and broken observations fail', () => {
  expect(timingStatistics([4,1,3,2])).toMatchObject({median:3,p95:4});
  expect(timingEvidence([1,2,3,4],[2,1,4,3])).toEqual(timingEvidence([1,2,3,4],[2,1,4,3]));
  for(const [a,b] of [[[1],[2]],[[1,2],[2]],[[1,2],[2,NaN]],[[1,2],[-1,2]]]) expect(()=>timingEvidence(a,b)).toThrow('paired');
});
