import { PRACTICE_MODES, normalizePracticeConfig, createPractice, tickPractice, detectPractice, nextPractice, pausePractice, resumePractice, endPractice, toPracticeRecord, recoverPracticeRecord, validatePracticeRecord, practiceStatistics } from '../src/practiceSession.js';
const gun = { id: 'gun-a', name: 'Test gun', type: 'Handguns' };
const clock = n => ({ monoNow: n, epochNow: 10000 + n, randomValue: 0 });
function start(mode = 'single', config = {}) {
  return tickPractice(createPractice({ id: 'test', gun, mode, config: { delayMode: 'fixed', fixedDelaySeconds: 0, soundAtStart: false, repetitions: 2, ...config }, ...clock(0) }), clock(0));
}
const event = (s, label, n, score = 90) => detectPractice(s, { label, score, detectedAtMs: n }, clock(n + 100));
describe('one practice engine supports all modes', () => {
  test('six modes and validated shared defaults', () => {
    expect(PRACTICE_MODES.map(x => x.id)).toEqual(['single', 'repeated', 'par', 'control', 'reload', 'free']);
    expect(normalizePracticeConfig()).toMatchObject({ repetitions: 10, delayMode: 'random', soundAtStart: true, parSeconds: 1.5, durationSeconds: 60 });
    expect(() => normalizePracticeConfig({ reloadStart: 'rack', reloadEnd: 'rack' })).toThrow();
    expect(() => normalizePracticeConfig({ repetitions: 0 })).toThrow();
    expect(() => normalizePracticeConfig({ parSeconds: .05 })).toThrow();
  });
  test('single automatically starts a fresh delay after the first accepted click', () => {
    let s = event(start(), 'trigger', 300);
    expect(s).toMatchObject({ phase: 'result', completed: 1, shots: 1, remaining: 1 });
    expect(event(s, 'trigger', 500)).toBe(s);
    s = tickPractice(s, clock(700));
    expect(s).toMatchObject({ phase: 'active', goAtMs: 700, completed: 1 });
    s = event(s, 'trigger', 1000);
    expect(s).toMatchObject({ status: 'completed', phase: 'review', shots: 2 });
  });
  test('unknown or handling sound never counts a shot', () => {
    let s = event(start(), 'unknown', 100);
    s = event(s, 'rack', 200);
    expect(s.shots).toBe(0);
    expect(s.current.detections).toHaveLength(1);
  });
  test.each(['repeated', 'control'])('%s continuously records distinct clicks and intervals', mode => {
    let s = event(start(mode), 'trigger', 200);
    expect(s.phase).toBe('active');
    s = event(s, 'trigger', 450);
    expect(s.status).toBe('completed');
    expect(s.repetitions[1].intervalMs).toBe(250);
    expect(practiceStatistics(toPracticeRecord(s)).intervalMeanMs).toBe(250);
  });
  test('duplicate/pre-GO onsets do not create another count', () => {
    let s = start('repeated');
    s = event(s, 'trigger', 200);
    expect(event(s, 'trigger', 200)).toBe(s);
    expect(event(s, 'trigger', 100)).toBe(s);
  });
  test('par deadline equality counts and delayed classification uses captured onset', () => {
    const s = detectPractice(start('par', { parSeconds: 1 }), { label: 'trigger', score: 90, detectedAtMs: 1000 }, clock(1500));
    expect(s.repetitions[0].status).toBe('hit');
  });
  test('par misses consume attempts without adding shots; late click is not in time', () => {
    let s = event(start('par', { parSeconds: 1 }), 'trigger', 1100);
    s = tickPractice(s, clock(3200));
    expect(s).toMatchObject({ phase: 'result', completed: 1, shots: 0 });
    expect(s.repetitions[0].status).toBe('miss');
  });
  test('reload requires defined order and handling completion is not a shot', () => {
    let s = start('reload');
    s = event(s, 'reload', 100);
    expect(s.completed).toBe(0);
    s = event(s, 'rack', 300);
    s = event(s, 'reload', 700);
    expect(s).toMatchObject({ completed: 1, shots: 0, phase: 'result' });
    expect(s.repetitions[0].stepTimings[1].splitMs).toBe(400);
  });
  test('free practice finishes at its active duration and retains all accepted clicks', () => {
    let s = event(start('free', { durationSeconds: 1 }), 'trigger', 300);
    s = tickPractice(s, clock(3200));
    expect(s).toMatchObject({ status: 'completed', shots: 1, remaining: null, elapsedMs: 1000 });
  });
  test('pause releases logical attempt, resume uses fresh clocks and no interval spans pause', () => {
    let s = event(start('repeated'), 'trigger', 200);
    s = pausePractice(s, clock(500));
    s = resumePractice(s, { monoNow: 0, epochNow: 12000, randomValue: 0 });
    s = tickPractice(s, { monoNow: 0, epochNow: 12000 });
    s = detectPractice(s, { label: 'trigger', score: 90, detectedAtMs: 200 }, { monoNow: 300, epochNow: 12300 });
    expect(s.status).toBe('completed');
    expect(s.repetitions.filter(x => x.status === 'hit').at(-1).intervalMs).toBeNull();
  });
  test('external cue starts timing only when configured and never counts a shot', () => {
    let s = start('single', { startSource: 'external' });
    expect(s.phase).toBe('await-cue');
    expect(event(s, 'trigger', 200)).toBe(s);
    s = event(s, 'cue', 500);
    expect(s).toMatchObject({ phase: 'active', shots: 0 });
    s = event(s, 'trigger', 800);
    expect(s.repetitions[0].elapsedMs).toBe(300);
  });
  test('app cue guard excludes input but does not apply to silent practice', () => {
    const s = start('single', { soundAtStart: true });
    expect(event(s, 'trigger', 50)).toBe(s);
    expect(event(s, 'trigger', 100).shots).toBe(1);
  });
  test('interrupt/recovery preserves a partial and does not auto-resume capture', () => {
    let s = event(start('reload'), 'rack', 200);
    const saved = validatePracticeRecord(toPracticeRecord(s), gun.id);
    const recovered = recoverPracticeRecord(saved, 14000);
    expect(recovered).toMatchObject({ status: 'interrupted', currentAttempt: null, completed: 0 });
    expect(recovered.repetitions[0].status).toBe('partial');
    expect(validatePracticeRecord(recovered, gun.id)).toEqual(recovered);
    s = endPractice(s, { ...clock(500), reason: 'background', interrupted: true });
    expect(validatePracticeRecord(toPracticeRecord(s), gun.id).status).toBe('interrupted');
  });
  test.each(['single', 'repeated', 'par', 'control', 'reload', 'free'])('%s portable records validate and reject corrupt counts', mode => {
    const record = toPracticeRecord(start(mode));
    expect(validatePracticeRecord(record, gun.id)).toEqual(record);
    expect(() => validatePracticeRecord({ ...record, shots: 55 }, gun.id)).toThrow();
    expect(() => validatePracticeRecord(record, 'other-gun')).toThrow();
  });
});

test('automatic Single samples a fresh random delay, ignores waiting clicks and stops at its target', () => {
  let s = createPractice({ id: 'automatic', gun, mode: 'single', config: { repetitions: 2, randomMinSeconds: 1, randomMaxSeconds: 3 }, ...clock(0) });
  s = tickPractice(s, clock(1000));
  s = event(s, 'trigger', 1300);
  const finished = structuredClone(s.repetitions[0]);
  s = tickPractice(s, { ...clock(1500), randomValue: 1 });
  expect(s).toMatchObject({ phase: 'countdown', countdownEndsAtMs: 4500, completed: 1, remaining: 1 });
  expect(event(s, 'trigger', 2000)).toBe(s);
  expect(tickPractice(s, clock(4400))).toBe(s);
  s = tickPractice(s, clock(4500));
  s = event(s, 'trigger', 4800);
  expect(s).toMatchObject({ phase: 'review', shots: 2, completed: 2, remaining: 0 });
  expect(s.repetitions[0]).toEqual(finished);
  expect(s.repetitions[1].elapsedMs).toBe(300);
  expect(tickPractice(s, clock(9000))).toBe(s);
});

test('automatic Single with an external cue waits for a fresh cue without an app countdown', () => {
  let s = event(event(start('single', { startSource: 'external' }), 'cue', 100), 'trigger', 500);
  s = tickPractice(s, clock(700));
  expect(s).toMatchObject({ phase: 'await-cue', shots: 1 });
  expect(event(s, 'trigger', 800)).toBe(s);
  s = event(event(s, 'cue', 1000), 'trigger', 1300);
  expect(s).toMatchObject({ phase: 'review', shots: 2 });
});

test('unknown and rejected inputs do not alter durable practice records', () => {
  const s = start('single');
  for (const label of ['unknown', null]) expect(event(s, label, 100)).toBe(s);
  expect(toPracticeRecord(s).currentAttempt.detections).toEqual([]);
});

test('portable results reject contradictory shot outcomes and future result timestamps', () => {
  const original = toPracticeRecord(event(start('single', { repetitions: 1 }), 'trigger', 300));
  const handlingTrigger = structuredClone(original);
  handlingTrigger.repetitions[0].detections[0].outcome = 'handling'; handlingTrigger.shots = 0;
  expect(() => validatePracticeRecord(handlingTrigger, gun.id)).toThrow();
  const future = structuredClone(original); future.endedAt = future.updatedAt + 1000;
  expect(() => validatePracticeRecord(future, gun.id)).toThrow();
  const futureAttempt = structuredClone(original); futureAttempt.repetitions[0].endedAt = futureAttempt.updatedAt + 1000;
  expect(() => validatePracticeRecord(futureAttempt, gun.id)).toThrow();
});
