import { practiceDefinition } from './practiceModes.js';
export { PRACTICE_MODES, practiceMode, practiceDefinition } from './practiceModes.js';

const LABELS = ['draw', 'rack', 'trigger', 'reload'];
const TYPES = ['Handguns', 'Rifles and Carbines', 'Shotguns'];
export const PRACTICE_CUE_GUARD_MS = 80;
// Let segmentation finish an event captured before a deadline; score by onset.
export const DETECTION_SETTLE_MS = 2000;
export const continuousPractice = mode => ['repeated', 'control'].includes(mode);
const terminal = state => ['completed', 'ended', 'interrupted'].includes(state.status);
const finite = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
const defaults = { repetitions: 10, delayMode: 'random', fixedDelaySeconds: 3, randomMinSeconds: 2,
  randomMaxSeconds: 5, soundAtStart: true, startSource: 'app', parSeconds: 1.5 };

export function normalizePracticeConfig(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Invalid practice configuration.');
  const config = Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, value[key] === undefined ? fallback : value[key]]));
  if (!Number.isInteger(config.repetitions) || config.repetitions < 1 || config.repetitions > 100) throw new TypeError('Choose 1–100 repetitions or clicks.');
  if (!['fixed', 'random'].includes(config.delayMode) || !['app', 'external'].includes(config.startSource) || typeof config.soundAtStart !== 'boolean') throw new TypeError('Invalid start signal.');
  for (const key of ['fixedDelaySeconds', 'randomMinSeconds', 'randomMaxSeconds', 'parSeconds']) {
    const n = config[key];
    if (!finite(n) || n > 30 || Math.abs(n * 10 - Math.round(n * 10)) > 1e-8 || (key === 'parSeconds' && n < .1)) throw new TypeError('Choose valid timing in tenths of a second, up to 30 seconds.');
  }
  if (config.randomMinSeconds > config.randomMaxSeconds) throw new TypeError('Random minimum must not exceed maximum.');
  return config;
}
export const practiceLabels = () => ['trigger'];
function clockValue(clock) {
  if (!finite(clock?.monoNow) || !finite(clock?.epochNow)) throw new TypeError('Valid practice clocks are required.');
  return clock;
}
function change(state, clock, updates) {
  return { ...state, ...updates, revision: state.revision + 1, updatedAt: Math.max(state.updatedAt, clock.epochNow) };
}
function attempt(state, clock) {
  return { attempt: state.repetitions.length + 1, ordinal: state.completed + 1, status: 'waiting',
    startedAt: clock.epochNow, goAt: null, endedAt: null, reason: null, elapsedMs: null,
    intervalMs: null, detections: [], stepTimings: [] };
}
function delay(config, randomValue = 0) {
  if (config.delayMode === 'fixed') return config.fixedDelaySeconds * 1000;
  if (!finite(randomValue) || randomValue > 1) throw new TypeError('Invalid random timing value.');
  const min = Math.round(config.randomMinSeconds * 10), max = Math.round(config.randomMaxSeconds * 10);
  return Math.min(max, min + Math.floor(randomValue * (max - min + 1))) * 100;
}
function ready(state, clock) {
  return change(state, clock, { status: 'running', phase: state.config.startSource === 'external' ? 'await-cue' : 'countdown',
    current: attempt(state, clock), countdownEndsAtMs: clock.monoNow + delay(state.config, clock.randomValue),
    goAtMs: null, readyAtMs: clock.monoNow, segmentStartMs: null, cueGuardUntilMs: null, lastDetectionAtMs: null });
}
function activate(state, clock, onset = clock.monoNow) {
  return change(state, clock, { phase: 'active', countdownEndsAtMs: null, goAtMs: onset, segmentStartMs: onset,
    cueGuardUntilMs: onset + (state.config.startSource === 'app' && state.config.soundAtStart ? PRACTICE_CUE_GUARD_MS : 0),
    current: { ...state.current, status: 'active', startedAt: clock.epochNow - (clock.monoNow - onset), goAt: clock.epochNow - (clock.monoNow - onset) } });
}
export function createPractice({ id, gun, mode = 'single', config, ...clock } = {}) {
  clockValue(clock);
  if (typeof id !== 'string' || !id || id.length > 80 || !practiceDefinition(mode) || !gun?.id || !gun.name?.trim() || !TYPES.includes(gun.type)) throw new TypeError('A valid gun and practice mode are required.');
  const normalized = normalizePracticeConfig(config);
  return ready({ kind: 'practice', practiceMode: mode, id, gunId: gun.id, gunName: gun.name, gunType: gun.type,
    drillId: `practice-${mode}`, drillTitle: practiceDefinition(mode).title, drillSteps: practiceLabels(),
    config: normalized, revision: 0, startedAt: clock.epochNow, updatedAt: clock.epochNow, endedAt: null,
    endReason: null, status: 'running', phase: 'countdown', completed: 0, remaining: normalized.repetitions,
    shots: 0, elapsedMs: 0, repetitions: [], current: null, activeBaseMs: 0, lastShotOffsetMs: null }, clock);
}
export function practiceElapsed(state, monoNow) {
  return state.segmentStartMs === null ? state.elapsedMs : state.activeBaseMs + Math.max(0, monoNow - state.segmentStartMs);
}
function finishAttempt(state, clock, status, reason, current = state.current) {
  const elapsedMs = state.goAtMs === null ? null : Math.max(0, clock.monoNow - state.goAtMs);
  const row = { ...current, status, reason, elapsedMs: reason === 'early' ? null : current.elapsedMs ?? elapsedMs, endedAt: clock.epochNow };
  const completed = state.completed + (status === 'partial' ? 0 : 1);
  const done = completed === state.config.repetitions;
  return change(state, clock, { current: null, repetitions: [...state.repetitions, row], completed,
    remaining: state.config.repetitions - completed,
    phase: done ? 'review' : 'result', status: done ? 'completed' : 'running',
    endedAt: done ? clock.epochNow : null, endReason: done ? 'target' : null,
    elapsedMs: practiceElapsed(state, clock.monoNow), segmentStartMs: null });
}
export function tickPractice(state, clock) {
  clockValue(clock);
  if (state.phase === 'result' && state.practiceMode === 'single' && !terminal(state)) {
    const next = nextPractice(state, clock);
    return next.phase === 'countdown' && clock.monoNow >= next.countdownEndsAtMs ? activate(next, clock) : next;
  }
  if (state.phase === 'countdown' && clock.monoNow >= state.countdownEndsAtMs) return activate(state, clock);
  if (!['active', 'closing'].includes(state.phase)) return state;
  if (state.practiceMode === 'par') {
    const end = state.goAtMs + state.config.parSeconds * 1000;
    if (clock.monoNow > end + DETECTION_SETTLE_MS) return finishAttempt(state, clock, 'miss', state.current.detections.some(x => x.outcome === 'late') ? 'late' : 'no-click');
    if (clock.monoNow > end && state.phase !== 'closing') return change(state, clock, { phase: 'closing' });
  }

  return state;
}
export function detectPractice(state, { label, score = 0, detectedAtMs } = {}, clock) {
  clockValue(clock);
  if (!finite(detectedAtMs) || detectedAtMs > clock.monoNow || !finite(score) || score > 100) throw new TypeError('Invalid captured detection.');
  if (state.practiceMode === 'single' && ['countdown', 'active'].includes(state.phase) && state.config.startSource === 'app' && label === 'trigger') {
    // A delayed timer has not played GO yet. Its earliest possible start is now.
    const reference = state.goAtMs ?? Math.max(state.countdownEndsAtMs, clock.monoNow);
    if (detectedAtMs < state.readyAtMs) return state;
    if (state.phase === 'countdown' || detectedAtMs < reference) {
      return finishAttempt(state, clock, 'miss', 'early', { ...state.current, detections: [
        { label, score, offsetMs: detectedAtMs - reference, outcome: 'early' },
      ], stepTimings: [] });
    }
  }
  if (state.phase === 'await-cue') return label === 'cue' ? activate(state, clock, detectedAtMs) : state;
  if (!['active', 'closing'].includes(state.phase) || detectedAtMs < state.cueGuardUntilMs || (state.lastDetectionAtMs !== null && detectedAtMs <= state.lastDetectionAtMs)) return state;
  if (label == null) label = 'unknown';
  if (![...LABELS, 'unknown', 'cue'].includes(label)) throw new TypeError('Invalid detected label.');
  if (label === 'unknown') return state;
  const continuous = continuousPractice(state.practiceMode);
  const offsetMs = continuous ? state.activeBaseMs + detectedAtMs - state.segmentStartMs : detectedAtMs - state.goAtMs;
  const late = state.practiceMode === 'par' && offsetMs > state.config.parSeconds * 1000;
  const steps = state.current.stepTimings;
  const expected = state.drillSteps[steps.length];
  const accepted = !late && label === expected;
  const nextSteps = accepted ? [...steps, { label, offsetMs, splitMs: offsetMs - (steps.at(-1)?.offsetMs ?? 0) }] : steps;

  const outcome = late ? 'late' : accepted ? (label === 'trigger' ? 'shot' : 'handling') : 'ignored';
  const current = { ...state.current, detections: [...state.current.detections, { label, score, offsetMs, outcome }], stepTimings: nextSteps };
  let next = change(state, clock, { current, lastDetectionAtMs: detectedAtMs, shots: state.shots + (outcome === 'shot' ? 1 : 0), elapsedMs: practiceElapsed(state, clock.monoNow) });
  if (!accepted || nextSteps.length !== state.drillSteps.length) return next;
  const intervalMs = continuous && state.lastShotOffsetMs !== null ? offsetMs - state.lastShotOffsetMs : null;
  const doneCurrent = { ...current, elapsedMs: offsetMs, intervalMs };
  next = finishAttempt(next, clock, 'hit', 'recognized', doneCurrent);
  if (!continuous || next.status === 'completed') return next;
  return change(next, clock, { phase: 'active', current: { ...attempt(next, clock), status: 'active', startedAt: current.startedAt, goAt: current.goAt },
    segmentStartMs: state.segmentStartMs, activeBaseMs: state.activeBaseMs, lastShotOffsetMs: offsetMs });
}
export function nextPractice(state, clock) {
  clockValue(clock);
  if (state.phase !== 'result' || terminal(state)) throw new TypeError('Resolve this repetition first.');
  return ready({ ...state, activeBaseMs: state.elapsedMs, lastShotOffsetMs: null }, clock);
}
function partial(state, clock, reason) {
  if (!state.current) return state.repetitions;
  return [...state.repetitions, { ...state.current, status: 'partial', reason, endedAt: clock.epochNow,
    elapsedMs: state.goAtMs === null ? null : Math.max(0, clock.monoNow - state.goAtMs) }];
}
export function pausePractice(state, clock) {
  clockValue(clock);
  if (terminal(state) || state.status === 'paused') return state;
  return change(state, clock, { status: 'paused', phase: 'paused', repetitions: partial(state, clock, 'paused'), current: null,
    elapsedMs: practiceElapsed(state, clock.monoNow), segmentStartMs: null, goAtMs: null, countdownEndsAtMs: null, lastShotOffsetMs: null });
}
export function resumePractice(state, clock) {
  clockValue(clock);
  if (state.status !== 'paused') throw new TypeError('Only paused practice can resume.');
  return ready({ ...state, activeBaseMs: state.elapsedMs, lastShotOffsetMs: null }, clock);
}
export function endPractice(state, { reason = 'ended', interrupted = false, ...clock } = {}) {
  clockValue(clock);
  if (terminal(state)) return state;
  return change(state, clock, { status: interrupted ? 'interrupted' : 'ended', phase: 'review',
    repetitions: partial(state, clock, reason), current: null, endedAt: clock.epochNow, endReason: reason,
    elapsedMs: practiceElapsed(state, clock.monoNow), segmentStartMs: null, goAtMs: null, countdownEndsAtMs: null });
}
export function toPracticeRecord(state) {
  const { phase, current, countdownEndsAtMs, goAtMs, readyAtMs, segmentStartMs, cueGuardUntilMs, lastDetectionAtMs, activeBaseMs, lastShotOffsetMs, ...record } = state;
  return structuredClone({ ...record, currentAttempt: current });
}
export function recoverPracticeRecord(record, now) {
  if (!finite(now)) throw new TypeError('Invalid recovery time.');
  if (terminal(record)) return structuredClone(record);
  const epoch = Math.max(now, record.updatedAt);
  const repetitions = [...record.repetitions];
  if (record.currentAttempt) repetitions.push({ ...record.currentAttempt, status: 'partial', reason: 'refresh', endedAt: epoch,
    elapsedMs: record.currentAttempt.goAt === null ? null : (record.currentAttempt.detections.at(-1)?.offsetMs ?? 0) });
  return { ...structuredClone(record), repetitions, status: 'interrupted', endReason: 'refresh', currentAttempt: null,
    endedAt: epoch, updatedAt: epoch, revision: record.revision + 1 };
}

/** Validate portable practice data before writing or atomically importing it. */
export function validatePracticeRecord(value, owner) {
  const fail = () => { throw new TypeError('Invalid saved practice session.'); };
  if (!value || value.kind !== 'practice' || value.gunId !== owner || typeof value.id !== 'string' || !value.id || value.id.length > 80 ||
      typeof value.gunName !== 'string' || !value.gunName.trim() || value.gunName.length > 80 || !TYPES.includes(value.gunType) ||
      !practiceDefinition(value.practiceMode) || value.drillId !== `practice-${value.practiceMode}` || value.drillTitle !== practiceDefinition(value.practiceMode).title ||
      !Number.isInteger(value.revision) || value.revision < 0 || !finite(value.startedAt) || !finite(value.updatedAt) || value.updatedAt < value.startedAt ||
      !['running', 'paused', 'completed', 'ended', 'interrupted'].includes(value.status) || !finite(value.elapsedMs) || !Array.isArray(value.repetitions)) fail();
  const config = normalizePracticeConfig(value.config);
  if (Object.keys(value.config).length !== Object.keys(config).length || Object.keys(config).some(key => config[key] !== value.config[key]) || JSON.stringify(value.drillSteps) !== JSON.stringify(practiceLabels())) fail();
  const isTerminal = terminal(value);
  if ((isTerminal ? !finite(value.endedAt) || value.endedAt < value.startedAt || value.endedAt > value.updatedAt : value.endedAt !== null) ||
      (isTerminal && (typeof value.endReason !== 'string' || !value.endReason)) || (!isTerminal && value.endReason !== null) ||
      (isTerminal && value.currentAttempt !== null) || (value.status === 'paused' && value.currentAttempt !== null)) fail();
  let completed = 0, shots = 0, attemptNumber = 0;
  const rows = [...value.repetitions, ...(value.currentAttempt ? [value.currentAttempt] : [])];
  for (const row of rows) {
    const current = row === value.currentAttempt;
    const early = !current && row?.status === 'miss' && row.reason === 'early' && value.practiceMode === 'single' && config.startSource === 'app';
    if (!row || !Number.isInteger(row.attempt) || row.attempt <= attemptNumber || row.ordinal !== completed + 1 ||
        !(current ? ['waiting', 'active'] : ['hit', 'miss', 'partial']).includes(row.status) ||
        !finite(row.startedAt) || row.startedAt < value.startedAt || row.startedAt > value.updatedAt ||
        (row.goAt !== null && (!finite(row.goAt) || row.goAt < row.startedAt || row.goAt > value.updatedAt)) ||
        (row.elapsedMs !== null && !finite(row.elapsedMs)) || (row.intervalMs !== null && !finite(row.intervalMs)) ||
        !Array.isArray(row.detections) || !Array.isArray(row.stepTimings) ||
        (current ? row.endedAt !== null || row.reason !== null || (row.status === 'waiting' ? row.goAt !== null : row.goAt === null)
          : !finite(row.endedAt) || row.endedAt < (row.goAt ?? row.startedAt) || row.endedAt > value.updatedAt || typeof row.reason !== 'string')) fail();
    attemptNumber = row.attempt;
    let offset = -Infinity;
    for (const detection of row.detections) {
      if (![...LABELS, 'unknown', 'cue'].includes(detection.label) || !finite(detection.score) || detection.score > 100 ||
          !(early ? Number.isFinite(detection.offsetMs) && detection.offsetMs <= 0 && detection.label === 'trigger' && detection.outcome === 'early' : finite(detection.offsetMs)) ||
          detection.offsetMs <= offset || !['shot', 'handling', 'ignored', 'late', ...(early ? ['early'] : [])].includes(detection.outcome) ||
          (detection.outcome === 'shot' && (detection.label !== 'trigger' || !value.drillSteps.includes('trigger'))) ||
          (detection.outcome === 'handling' && !['draw', 'rack', 'reload'].includes(detection.label))) fail();
      if (detection.outcome === 'shot') shots++;
      offset = detection.offsetMs;
    }
    let previous = 0;
    row.stepTimings.forEach((timing, i) => {
      if (timing.label !== value.drillSteps[i] || !finite(timing.offsetMs) || timing.offsetMs < previous ||
          !finite(timing.splitMs) || Math.abs(timing.splitMs - (timing.offsetMs - previous)) > 1e-6 ||
          !row.detections.some(x => x.label === timing.label && x.offsetMs === timing.offsetMs && ['shot', 'handling'].includes(x.outcome))) fail();
      previous = timing.offsetMs;
    });
    if (early && (row.detections.length !== 1 || row.stepTimings.length || row.elapsedMs !== null || row.intervalMs !== null)) fail();
    if (row.reason === 'early' && !early) fail();
    if (!early && row.goAt === null && (row.detections.length || row.stepTimings.length || row.elapsedMs !== null)) fail();
    if (row.status === 'hit' && (row.stepTimings.length !== value.drillSteps.length || row.elapsedMs !== previous)) fail();
    if (row.status === 'miss' && ((!early && value.practiceMode !== 'par') || row.stepTimings.length)) fail();
    if (['hit', 'miss'].includes(row.status)) completed++;
  }
  if (value.completed !== completed || value.shots !== shots ||
      (completed > config.repetitions || value.remaining !== config.repetitions - completed) ||
      (value.status === 'completed' && value.remaining !== 0)) fail();
  return structuredClone(value);
}
export function practiceStatistics(record) {
  const intervals = record.repetitions.filter(row => row.status === 'hit' && row.intervalMs !== null).map(row => row.intervalMs);
  const mean = intervals.length ? intervals.reduce((a, b) => a + b, 0) / intervals.length : null;
  return { hits: record.repetitions.filter(row => row.status === 'hit').length, misses: record.repetitions.filter(row => row.status === 'miss').length,
    intervalMeanMs: mean, intervalMinMs: intervals.length ? Math.min(...intervals) : null,
    intervalMaxMs: intervals.length ? Math.max(...intervals) : null,
    intervalSpreadMs: mean === null ? null : Math.sqrt(intervals.reduce((sum, x) => sum + (x - mean) ** 2, 0) / intervals.length) };
}
