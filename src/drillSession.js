import { advanceDrill, createDrillState, getDrill, normalizeCustomDrill } from './drills.js';

export const RESULT_HOLD_MS = 1000;
export const CUE_GUARD_MS = 300;
export const DEFAULT_SESSION_CONFIG = Object.freeze({
  repetitions: 10,
  delayMode: 'fixed',
  fixedDelaySeconds: 3,
  randomMinSeconds: 2,
  randomMaxSeconds: 5,
  soundAtStart: false,
});
const GUN_TYPES = ['Handguns', 'Rifles and Carbines', 'Shotguns'];
const LABELS = ['draw', 'rack', 'trigger', 'reload'];
const terminal = state => ['completed', 'ended', 'interrupted'].includes(state.status);

export function normalizeSessionConfig(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Session configuration must be an object.');
  const config = Object.fromEntries(Object.entries(DEFAULT_SESSION_CONFIG).map(([key, fallback]) => [key, value[key] === undefined ? fallback : value[key]]));
  if (!Number.isInteger(config.repetitions) || config.repetitions < 1 || config.repetitions > 100) throw new TypeError('Choose 1 to 100 repetitions.');
  if (!['fixed', 'random'].includes(config.delayMode)) throw new TypeError('Choose fixed or random start timing.');
  for (const key of ['fixedDelaySeconds', 'randomMinSeconds', 'randomMaxSeconds']) {
    const seconds = config[key];
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0 || seconds > 30 || Math.abs(seconds * 10 - Math.round(seconds * 10)) > 1e-8) {
      throw new TypeError('Start delays must be 0 to 30 seconds, in tenths of a second.');
    }
  }
  if (config.randomMinSeconds > config.randomMaxSeconds) throw new TypeError('Random minimum must not exceed maximum.');
  if (typeof config.soundAtStart !== 'boolean') throw new TypeError('Sound at start must be on or off.');
  return config;
}

function validateClock({ monoNow, epochNow } = {}) {
  if (!Number.isFinite(monoNow) || monoNow < 0 || !Number.isFinite(epochNow) || epochNow < 0) throw new TypeError('A valid monotonic and wall clock is required.');
  return { monoNow, epochNow };
}

function delayMs(config, randomValue = 0) {
  if (config.delayMode === 'fixed') return Math.round(config.fixedDelaySeconds * 1000);
  if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue > 1) throw new TypeError('Random timing requires a value from zero to one.');
  const min = Math.round(config.randomMinSeconds * 10);
  const max = Math.round(config.randomMaxSeconds * 10);
  return Math.min(max, min + Math.floor(randomValue * (max - min + 1))) * 100;
}

function freshAttempt(state, epochNow) {
  return {
    attempt: state.repetitions.length + 1, ordinal: state.completed + 1,
    status: 'waiting', startedAt: epochNow, goAt: null, endedAt: null,
    reason: null, elapsedMs: null, unknown: 0, incorrect: 0,
    detections: [], stepTimings: [], stepIndex: 0, lastOutcome: 'ready',
  };
}

function change(state, clock, updates) {
  return { ...state, ...updates, revision: state.revision + 1,
    updatedAt: Math.max(state.updatedAt, clock.epochNow, updates.endedAt ?? 0,
      updates.repetitions?.at(-1)?.endedAt ?? 0) };
}

function beginCountdown(state, clock, randomValue) {
  return change(state, clock, {
    status: 'running', phase: 'countdown', current: freshAttempt(state, clock.epochNow),
    countdownEndsAtMs: clock.monoNow + delayMs(state.config, randomValue),
    goAtMs: null, cueGuardUntilMs: null, resultUntilMs: null,
  });
}

function activate(state, clock) {
  return change(state, clock, {
    phase: 'active', countdownEndsAtMs: null, goAtMs: clock.monoNow,
    cueGuardUntilMs: clock.monoNow + (state.config.soundAtStart ? CUE_GUARD_MS : 0),
    current: { ...state.current, status: 'active', startedAt: clock.epochNow, goAt: clock.epochNow },
  });
}

/** Begin only after the controller has obtained the microphone. No device APIs live here. */
export function createSession({ id, gun, drill, config, monoNow, epochNow, randomValue } = {}) {
  const clock = validateClock({ monoNow, epochNow });
  if (typeof id !== 'string' || !id || id.length > 80) throw new TypeError('A session ID is required.');
  if (!gun || typeof gun.id !== 'string' || !gun.id || typeof gun.name !== 'string' || !gun.name.trim() || gun.name.length > 80 || !GUN_TYPES.includes(gun.type)) {
    throw new TypeError('A named gun with a supported type is required.');
  }
  const definition = getDrill(drill?.id) ?? normalizeCustomDrill(drill);
  const state = {
    id, gunId: gun.id, gunName: gun.name, gunType: gun.type,
    drillId: definition.id, drillTitle: definition.title, drillSteps: [...definition.steps],
    config: normalizeSessionConfig(config), revision: 0,
    status: 'running', phase: 'countdown', startedAt: epochNow, updatedAt: epochNow,
    endedAt: null, endReason: null, completed: 0,
    remaining: normalizeSessionConfig(config).repetitions, repetitions: [], current: null,
    countdownEndsAtMs: null, goAtMs: null, cueGuardUntilMs: null, resultUntilMs: null,
  };
  return beginCountdown(state, clock, randomValue);
}

/** The controller serializes clock transitions behind pending durable result writes. */
export function tickSession(state, { monoNow, epochNow, randomValue } = {}) {
  const clock = validateClock({ monoNow, epochNow });
  if (state.phase === 'countdown' && clock.monoNow >= state.countdownEndsAtMs) return activate(state, clock);
  if (state.phase !== 'result' || clock.monoNow < state.resultUntilMs) return state;
  if (state.completed === state.config.repetitions) return endSession(state, { ...clock, reason: 'completed' });
  const next = beginCountdown(state, clock, randomValue);
  return clock.monoNow >= next.countdownEndsAtMs ? activate(next, clock) : next;
}

function plainAttempt(attempt) {
  const { stepIndex, lastOutcome, ...record } = attempt;
  return structuredClone(record);
}

/** Capture timestamp precedes classification and persistence; offsets therefore exclude queue latency. */
export function recordSessionDetection(state, { label, score, detectedAtMs } = {}, { monoNow, epochNow } = {}) {
  const clock = validateClock({ monoNow, epochNow });
  if (!Number.isFinite(detectedAtMs) || detectedAtMs < 0 || detectedAtMs > clock.monoNow) throw new TypeError('Invalid sound-detection timestamp.');
  if (state.phase !== 'active' || detectedAtMs < state.cueGuardUntilMs) return state;
  const predicted = label == null || label === 'unknown' ? 'unknown' : label;
  if (!LABELS.includes(predicted) && predicted !== 'unknown') throw new TypeError('Invalid detected sound.');
  if (!Number.isFinite(score) || score < 0 || score > 100) throw new TypeError('Invalid sound-detection score.');
  const offsetMs = detectedAtMs - state.goAtMs;
  if (state.current.detections.length && offsetMs <= state.current.detections.at(-1).offsetMs) return state;
  const catalog = [{ id: state.drillId, title: state.drillTitle, steps: state.drillSteps }];
  const before = { ...createDrillState(state.drillId, catalog), stepIndex: state.current.stepIndex,
    unknown: state.current.unknown, incorrect: state.current.incorrect };
  const after = advanceDrill(before, predicted, catalog);
  const detection = { label: predicted, score, offsetMs, outcome: after.lastOutcome, position: before.stepIndex };
  let timings = state.current.stepTimings;
  if (after.lastOutcome === 'incorrect') {
    timings = after.stepIndex === 1 ? [{ label: state.drillSteps[0], offsetMs, splitMs: offsetMs }] : [];
  } else if (['matched', 'completed'].includes(after.lastOutcome)) {
    timings = [...timings, { label: predicted, offsetMs, splitMs: offsetMs - (timings.at(-1)?.offsetMs ?? 0) }];
  }
  const current = { ...state.current, stepIndex: after.stepIndex, lastOutcome: after.lastOutcome,
    unknown: after.unknown, incorrect: after.incorrect,
    detections: [...state.current.detections, detection], stepTimings: timings };
  if (after.lastOutcome !== 'completed') return change(state, clock, { current });
  const repetition = plainAttempt({ ...current, status: 'completed', elapsedMs: offsetMs,
    endedAt: current.goAt + offsetMs, reason: 'completed' });
  return change(state, clock, {
    phase: 'result', completed: state.completed + 1, remaining: state.remaining - 1,
    repetitions: [...state.repetitions, repetition], current: null,
    resultUntilMs: clock.monoNow + RESULT_HOLD_MS,
  });
}

function abandonCurrent(state, clock, reason) {
  if (!state.current) return state.repetitions;
  const elapsedMs = state.current.goAt === null ? null : Math.max(0, clock.monoNow - state.goAtMs);
  const partial = plainAttempt({ ...state.current, status: 'partial', reason, elapsedMs,
    endedAt: Math.max(state.current.startedAt, clock.epochNow) });
  return [...state.repetitions, partial];
}

export function pauseSession(state, { monoNow, epochNow, reason = 'paused' } = {}) {
  const clock = validateClock({ monoNow, epochNow });
  if (terminal(state) || state.status === 'paused') return state;
  if (state.completed === state.config.repetitions) return endSession(state, { ...clock, reason: 'completed' });
  return change(state, clock, {
    phase: 'paused', status: 'paused', repetitions: abandonCurrent(state, clock, reason), current: null,
    countdownEndsAtMs: null, goAtMs: null, cueGuardUntilMs: null, resultUntilMs: null,
  });
}

export function resumeSession(state, { monoNow, epochNow, randomValue } = {}) {
  const clock = validateClock({ monoNow, epochNow });
  if (state.status !== 'paused') throw new TypeError('Only a paused session can resume.');
  return beginCountdown(state, clock, randomValue);
}

export function endSession(state, { monoNow, epochNow, reason = 'ended', interrupted = false } = {}) {
  const clock = validateClock({ monoNow, epochNow });
  if (terminal(state)) return state;
  const completed = state.completed === state.config.repetitions;
  return change(state, clock, {
    phase: 'review', status: completed ? 'completed' : interrupted ? 'interrupted' : 'ended',
    endReason: completed ? 'completed' : reason, endedAt: Math.max(state.updatedAt, clock.epochNow),
    repetitions: abandonCurrent(state, clock, completed ? 'completed' : reason), current: null,
    countdownEndsAtMs: null, goAtMs: null, cueGuardUntilMs: null, resultUntilMs: null,
  });
}

/** Persist only JSON data; browser/audio monotonic clocks cannot survive a restart. */
export function toSessionRecord(state) {
  const { phase, countdownEndsAtMs, goAtMs, cueGuardUntilMs, resultUntilMs, current, ...record } = state;
  return structuredClone({ ...record, currentAttempt: current ? plainAttempt(current) : null });
}

/** Called on saved running/paused records after a restart; never restarts capture. */
export function recoverSessionRecord(record, epochNow) {
  if (!Number.isFinite(epochNow) || epochNow < 0) throw new TypeError('Invalid recovery timestamp.');
  if (!['running', 'paused'].includes(record.status)) return structuredClone(record);
  const recovered = structuredClone(record);
  const completed = recovered.completed === recovered.config.repetitions;
  const recoveredAt = Math.max(epochNow, recovered.updatedAt);
  if (recovered.currentAttempt) {
    // We know only the last durable sound offset, not when an abrupt shutdown happened.
    const current = recovered.currentAttempt;
    recovered.repetitions.push({ ...current, status: 'partial', reason: 'refresh',
      elapsedMs: current.goAt === null ? null : (current.detections.at(-1)?.offsetMs ?? 0),
      endedAt: recoveredAt });
  }
  return { ...recovered, status: completed ? 'completed' : 'interrupted',
    endReason: completed ? 'completed' : 'refresh', revision: recovered.revision + 1,
    updatedAt: recoveredAt, endedAt: recoveredAt, currentAttempt: null };
}
