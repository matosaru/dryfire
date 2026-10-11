import * as engine from '../src/drillSession.js';
import { getDrill } from '../src/drills.js';

const gun = { id: 'gun-a', name: 'Practice gun', type: 'Handguns' };
const epoch = 1700000000000;
const clock = monoNow => ({ monoNow, epochNow: epoch + monoNow });
const create = (config = {}, drill = getDrill('rack-trigger')) => engine.createSession({
  id: 'session-a', gun, drill, config, ...clock(0), randomValue: 0,
});
const tick = (state, now, randomValue = 0) => engine.tickSession(state, { ...clock(now), randomValue });
const detect = (state, label, now, receivedAt = now) => engine.recordSessionDetection(
  state, { label, score: 87, detectedAtMs: now }, clock(receivedAt),
);
const start = (config = {}, drill) => tick(create({ fixedDelaySeconds: 0, ...config }, drill), 0);

describe('timed drill session configuration', () => {
  test('uses the published defaults', () => {
    expect(engine.normalizeSessionConfig()).toEqual({
      repetitions: 10, delayMode: 'fixed', fixedDelaySeconds: 3,
      randomMinSeconds: 2, randomMaxSeconds: 5, soundAtStart: false,
    });
  });

  test('accepts zero, tenths and both repetition bounds', () => {
    expect(engine.normalizeSessionConfig({ repetitions: 1, fixedDelaySeconds: 0 })).toMatchObject({ repetitions: 1, fixedDelaySeconds: 0 });
    expect(engine.normalizeSessionConfig({ repetitions: 100, fixedDelaySeconds: 30, randomMinSeconds: 0.1, randomMaxSeconds: 0.1 })).toMatchObject({ repetitions: 100, randomMinSeconds: 0.1 });
  });

  test.each([
    { repetitions: 0 }, { repetitions: 101 }, { repetitions: 1.5 }, { repetitions: '10' },
    { delayMode: 'other' }, { fixedDelaySeconds: -0.1 }, { fixedDelaySeconds: 30.1 },
    { fixedDelaySeconds: 0.01 }, { randomMinSeconds: NaN }, { randomMaxSeconds: Infinity },
    { randomMinSeconds: 5, randomMaxSeconds: 2 }, { soundAtStart: 'yes' },
  ])('rejects invalid configuration %j', config => {
    expect(() => engine.normalizeSessionConfig(config)).toThrow(TypeError);
  });
});

describe('timed session progression', () => {
  test('snapshots gun, drill and configuration without retaining mutable references', () => {
    const inputGun = { ...gun };
    const drill = { id: 'custom-repeat', title: 'Repeated', steps: ['trigger', 'trigger'] };
    const config = { repetitions: 2 };
    const state = engine.createSession({ id: 'snapshot', gun: inputGun, drill, config, ...clock(0), randomValue: 0 });
    inputGun.name = 'Edited gun'; drill.steps.reverse(); drill.steps.push('draw'); drill.title = 'Edited preset'; config.repetitions = 99;
    expect(state).toMatchObject({ gunId: gun.id, gunName: gun.name, drillId: 'custom-repeat', drillTitle: 'Repeated', drillSteps: ['trigger', 'trigger'], config: { repetitions: 2 } });
    expect(engine.toSessionRecord(state).currentAttempt.status).toBe('waiting');
  });

  test('does not accept sounds before GO; transitions once at the actual displayed GO', () => {
    const state = create();
    expect(state).toMatchObject({ phase: 'countdown', countdownEndsAtMs: 3000, completed: 0, remaining: 10 });
    expect(detect(state, 'rack', 2999)).toBe(state);
    expect(tick(state, 2999)).toBe(state);
    const active = tick(state, 3050);
    expect(active).toMatchObject({ phase: 'active', goAtMs: 3050, cueGuardUntilMs: 3050 });
    expect(tick(active, 3051)).toBe(active);
    expect(detect(active, 'rack', 3049, 3200)).toBe(active);
    expect(active.current.stepIndex).toBe(0);
  });

  test('zero-delay begins on the first tick', () => {
    expect(start()).toMatchObject({ phase: 'active', goAtMs: 0 });
  });

  test('random delays include the configured endpoints and remain unchanged between ticks', () => {
    for (const [randomValue, expected] of [[0, 2000], [1, 5000], [0.5, 3500]]) {
      const state = engine.createSession({ id: 'random', gun, drill: getDrill('trigger-only'), config: { delayMode: 'random' }, ...clock(0), randomValue });
      expect(state.countdownEndsAtMs).toBe(expected);
      expect(tick(state, 100, 1)).toBe(state);
    }
  });

  test('every repetition applies a new delay after the one-second result display', () => {
    let state = start({ repetitions: 2, delayMode: 'random', randomMinSeconds: 0, randomMaxSeconds: 2 }, getDrill('trigger-only'));
    state = detect(state, 'trigger', 200);
    expect(state).toMatchObject({ phase: 'result', completed: 1, remaining: 1, resultUntilMs: 1200 });
    expect(tick(state, 1199, 1)).toBe(state);
    state = tick(state, 1200, 1);
    expect(state).toMatchObject({ phase: 'countdown', countdownEndsAtMs: 3200 });
    expect(state.current.ordinal).toBe(2);
    expect(state.current.attempt).toBe(2);
  });

  test('unknown and out-of-order events are retained without completing a repetition', () => {
    let state = start();
    state = detect(state, 'rack', 100);
    state = detect(state, null, 150);
    expect(state.current).toMatchObject({ stepIndex: 1, unknown: 1, incorrect: 0 });
    state = detect(state, 'draw', 200);
    expect(state.current).toMatchObject({ stepIndex: 0, unknown: 1, incorrect: 1, stepTimings: [] });
    state = detect(state, 'rack', 250);
    state = detect(state, 'rack', 300);
    expect(state.current).toMatchObject({ stepIndex: 1, incorrect: 2, stepTimings: [{ label: 'rack', offsetMs: 300, splitMs: 300 }] });
    expect(state).toMatchObject({ completed: 0, remaining: 10 });
    state = detect(state, 'trigger', 500);
    expect(state.repetitions[0]).toMatchObject({ status: 'completed', unknown: 1, incorrect: 2 });
    expect(state.repetitions[0].detections.map(event => event.outcome)).toEqual(['matched', 'unknown', 'incorrect', 'matched', 'incorrect', 'completed']);
  });

  test('repeated actions complete in order and timestamp splits exclude asynchronous processing latency', () => {
    const drill = { id: 'custom-repeat', title: 'Two clicks', steps: ['trigger', 'trigger'] };
    let state = start({ repetitions: 1 }, drill);
    state = detect(state, 'trigger', 100, 500);
    state = detect(state, 'trigger', 250, 900);
    expect(state).toMatchObject({ phase: 'result', completed: 1, remaining: 0, resultUntilMs: 1900, current: null });
    expect(state.repetitions[0]).toMatchObject({ elapsedMs: 250, startedAt: epoch, goAt: epoch, endedAt: epoch + 250,
      stepTimings: [{ label: 'trigger', offsetMs: 100, splitMs: 100 }, { label: 'trigger', offsetMs: 250, splitMs: 150 }] });
    expect(detect(state, 'trigger', 1000)).toBe(state);
    state = tick(state, 1900);
    expect(state).toMatchObject({ phase: 'review', status: 'completed', completed: 1, remaining: 0 });
  });

  test('a beep applies the 300ms guard but timings stay relative to visual GO', () => {
    const active = start({ soundAtStart: true }, getDrill('trigger-only'));
    expect(active.cueGuardUntilMs).toBe(300);
    expect(detect(active, 'trigger', 299, 600)).toBe(active);
    const completed = detect(active, 'trigger', 300);
    expect(completed.completed).toBe(1);
    expect(completed.repetitions[0].elapsedMs).toBe(300);
  });

  test('silent mode accepts an immediate action at GO', () => {
    expect(detect(start({}, getDrill('trigger-only')), 'trigger', 0).completed).toBe(1);
  });

  test('duplicate and earlier capture timestamps cannot advance repeated actions', () => {
    const drill = { id: 'custom-repeat', title: 'Two clicks', steps: ['trigger', 'trigger'] };
    const first = detect(start({}, drill), 'trigger', 100);
    expect(detect(first, 'trigger', 100, 500)).toBe(first);
    expect(detect(first, 'trigger', 99, 500)).toBe(first);
    expect(detect(first, 'trigger', 101, 500).completed).toBe(1);
  });

  test('an event from the previous repetition cannot count after a new GO', () => {
    let state = detect(start({ repetitions: 2 }, getDrill('trigger-only')), 'trigger', 100);
    state = tick(state, 1100);
    expect(state).toMatchObject({ phase: 'active', goAtMs: 1100 });
    expect(detect(state, 'trigger', 1099, 1200)).toBe(state);
    expect(detect(state, 'trigger', 1100, 1200).completed).toBe(2);
  });

  test('does not mutate prior state or retained result arrays', () => {
    const initial = start();
    const next = detect(initial, 'rack', 100);
    const done = detect(next, 'trigger', 250);
    expect(initial.current.detections).toEqual([]);
    expect(next.current.detections).toHaveLength(1);
    expect(next.current.stepIndex).toBe(1);
    expect(done.repetitions[0].detections).toHaveLength(2);
    const record = engine.toSessionRecord(done);
    record.drillSteps.push('draw'); record.repetitions[0].detections[0].label = 'draw';
    expect(done.drillSteps).toEqual(['rack', 'trigger']);
    expect(done.repetitions[0].detections[0].label).toBe('rack');
  });

  test('invalid clocks, random values, identities and detected sounds are rejected', () => {
    expect(() => engine.createSession({ id: '', gun, drill: getDrill('rack-trigger'), ...clock(0) })).toThrow(TypeError);
    expect(() => engine.createSession({ id: 'invalid', gun: { ...gun, type: 'Other' }, drill: getDrill('rack-trigger'), ...clock(0) })).toThrow(TypeError);
    expect(() => tick(create(), NaN)).toThrow(TypeError);
    expect(() => engine.createSession({ id: 'random', gun, drill: getDrill('rack-trigger'), config: { delayMode: 'random' }, ...clock(0), randomValue: 1.1 })).toThrow(TypeError);
    expect(() => detect(start(), 'potato', 100)).toThrow(TypeError);
    expect(() => detect(start(), 'rack', Infinity)).toThrow(TypeError);
  });
});

describe('pause, termination and durable snapshots', () => {
  test('pause preserves the unfinished attempt as partial and resume uses a fresh countdown', () => {
    const active = detect(start(), 'rack', 100);
    const paused = engine.pauseSession(active, { ...clock(200), reason: 'paused' });
    expect(paused).toMatchObject({ phase: 'paused', status: 'paused', current: null, completed: 0, remaining: 10 });
    expect(paused.repetitions[0]).toMatchObject({ ordinal: 1, attempt: 1, status: 'partial', reason: 'paused', elapsedMs: 200 });
    expect(detect(paused, 'trigger', 300)).toBe(paused);
    const resumed = engine.resumeSession(paused, { ...clock(1000), randomValue: 0 });
    expect(resumed).toMatchObject({ phase: 'countdown', status: 'running', countdownEndsAtMs: 1000, current: { attempt: 2, ordinal: 1, stepIndex: 0 } });
    expect(tick(resumed, 1000).phase).toBe('active');
  });

  test('pause during countdown records no detections or fabricated GO timing', () => {
    const paused = engine.pauseSession(create(), { ...clock(1000), reason: 'paused' });
    expect(paused.repetitions[0]).toMatchObject({ status: 'partial', goAt: null, elapsedMs: null, detections: [], stepTimings: [] });
  });

  test('pause during result retains one completed row without fabricating another attempt', () => {
    const result = detect(start({ repetitions: 2 }, getDrill('trigger-only')), 'trigger', 100);
    const paused = engine.pauseSession(result, clock(200));
    expect(paused.repetitions).toHaveLength(1);
    expect(paused.completed).toBe(1);
    expect(paused.current).toBeNull();
    const resumed = engine.resumeSession(paused, clock(1000));
    expect(resumed.current).toMatchObject({ ordinal: 2, attempt: 2 });
  });

  test('resume works when a fresh microphone context restarts its monotonic clock at zero', () => {
    const paused = engine.pauseSession(detect(start(), 'rack', 100), clock(200));
    const resumed = engine.resumeSession(paused, { monoNow: 0, epochNow: epoch + 5000, randomValue: 0 });
    const active = engine.tickSession(resumed, { monoNow: 0, epochNow: epoch + 5000 });
    const matched = engine.recordSessionDetection(active, { label: 'rack', score: 80, detectedAtMs: 100 }, { monoNow: 100, epochNow: epoch + 5100 });
    const result = engine.recordSessionDetection(matched, { label: 'trigger', score: 80, detectedAtMs: 200 }, { monoNow: 200, epochNow: epoch + 5200 });
    expect(result.repetitions[1]).toMatchObject({ ordinal: 1, attempt: 2, elapsedMs: 200, goAt: epoch + 5000, endedAt: epoch + 5200 });
    expect(result.startedAt).toBe(epoch);
  });

  test('ending preserves partial details and never reports the session completed', () => {
    const active = detect(start(), 'rack', 100);
    const ended = engine.endSession(active, { ...clock(200), reason: 'ended' });
    expect(ended).toMatchObject({ phase: 'review', status: 'ended', endReason: 'ended', completed: 0, remaining: 10, endedAt: epoch + 200, current: null });
    expect(ended.repetitions[0]).toMatchObject({ status: 'partial', reason: 'ended', stepTimings: [{ label: 'rack', offsetMs: 100, splitMs: 100 }] });
    expect(engine.endSession(ended, clock(300))).toBe(ended);
  });

  test('interruption has an accurate reason and status', () => {
    const interrupted = engine.endSession(start(), { ...clock(200), reason: 'background', interrupted: true });
    expect(interrupted).toMatchObject({ status: 'interrupted', endReason: 'background', completed: 0 });
  });

  test('end or pause after the final complete sequence remains completed', () => {
    const result = detect(start({ repetitions: 1 }, getDrill('trigger-only')), 'trigger', 100);
    expect(engine.endSession(result, { ...clock(200), reason: 'background', interrupted: true }).status).toBe('completed');
    expect(engine.pauseSession(result, clock(200))).toMatchObject({ phase: 'review', status: 'completed' });
  });

  test('persistent snapshots contain only JSON values and no monotonic-clock fields', () => {
    const state = detect(start(), 'rack', 100);
    const record = engine.toSessionRecord(state);
    expect(JSON.parse(JSON.stringify(record))).toEqual(record);
    for (const key of ['phase', 'countdownEndsAtMs', 'goAtMs', 'cueGuardUntilMs', 'resultUntilMs', 'current']) expect(record).not.toHaveProperty(key);
    expect(record.currentAttempt).toMatchObject({ status: 'active', stepTimings: [{ label: 'rack', offsetMs: 100, splitMs: 100 }] });
    expect(record.revision).toBeGreaterThan(0);
  });

  test('refresh recovery preserves completed results and last durable partial without resuming', () => {
    let state = detect(start({ repetitions: 2 }, getDrill('trigger-only')), 'trigger', 100);
    state = tick(state, 1100);
    state = tick(state, 1100);
    state = detect(state, 'unknown', 1200);
    const original = engine.toSessionRecord(state);
    const recovered = engine.recoverSessionRecord(original, epoch + 5000);
    expect(recovered).toMatchObject({ status: 'interrupted', endReason: 'refresh', endedAt: epoch + 5000, completed: 1, remaining: 1, currentAttempt: null });
    expect(recovered.repetitions).toHaveLength(2);
    expect(recovered.repetitions[0]).toEqual(original.repetitions[0]);
    expect(recovered.repetitions[1]).toMatchObject({ status: 'partial', unknown: 1, reason: 'refresh', elapsedMs: 100 });
    expect(original.currentAttempt).not.toBeNull();
    expect(recovered.revision).toBe(original.revision + 1);
    expect(engine.recoverSessionRecord(recovered, epoch + 6000)).toEqual(recovered);
  });

  test('a paused snapshot recovers interrupted without duplicating its already partial row', () => {
    const record = engine.toSessionRecord(engine.pauseSession(start(), clock(100)));
    const recovered = engine.recoverSessionRecord(record, epoch + 1000);
    expect(recovered.status).toBe('interrupted');
    expect(recovered.repetitions).toHaveLength(1);
  });

  test('refresh during the final result display recognizes the already finished target', () => {
    const record = engine.toSessionRecord(detect(start({ repetitions: 1 }, getDrill('trigger-only')), 'trigger', 100));
    const recovered = engine.recoverSessionRecord(record, epoch + 1000);
    expect(recovered).toMatchObject({ status: 'completed', completed: 1, remaining: 0, currentAttempt: null });
    expect(recovered.repetitions).toHaveLength(1);
  });
});
