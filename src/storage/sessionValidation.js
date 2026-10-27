import {validGunDetails} from './validation.js';
import {labels} from '../classifier.js';
import {normalizeSessionConfig} from '../drillSession.js';
import {validatePracticeRecord} from '../practiceSession.js';
import {DRILL_OUTCOMES,SESSION_STATUSES,TERMINAL_SESSION_STATUSES} from './constants.js';

const finiteNonnegative = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;

const nullableTime = value => value === null || finiteNonnegative(value);

const reasonValue = value => value === null || (typeof value === 'string' && !!value.trim());

function invalidSession(message) {
  throw new TypeError(`Invalid saved drill session: ${message}.`);
}

function validateAttempt(value, record, isCurrent) {
  const steps = record.drillSteps;
  const statuses = isCurrent ? ['waiting', 'active'] : ['completed', 'partial'];
  if (!value || !Number.isInteger(value.attempt) || value.attempt < 1 ||
      !Number.isInteger(value.ordinal) || value.ordinal < 1 || value.ordinal > record.config.repetitions ||
      !statuses.includes(value.status) || !finiteNonnegative(value.startedAt) || value.startedAt < record.startedAt ||
      !nullableTime(value.goAt) || !nullableTime(value.endedAt) || !nullableTime(value.elapsedMs) || !reasonValue(value.reason) ||
      !Number.isInteger(value.unknown) || value.unknown < 0 || !Number.isInteger(value.incorrect) || value.incorrect < 0 ||
      !Array.isArray(value.detections) || !Array.isArray(value.stepTimings)) invalidSession('invalid repetition outcome');
  if ((value.goAt !== null && value.goAt < value.startedAt) ||
      (value.endedAt !== null && value.endedAt < value.startedAt) ||
      (isCurrent && value.endedAt !== null) || (!isCurrent && value.endedAt === null) ||
      (isCurrent && value.reason !== null) || (value.status === 'waiting' && value.goAt !== null) ||
      (value.status === 'active' && value.goAt === null)) invalidSession('invalid repetition timestamps');
  let lastOffset = -1;
  const detections = Array.from(value.detections, item => {
    if (!item || ![...labels, 'unknown'].includes(item.label) || !finiteNonnegative(item.score) || item.score > 100 ||
        !finiteNonnegative(item.offsetMs) || item.offsetMs < lastOffset || !DRILL_OUTCOMES.includes(item.outcome) ||
        !Number.isInteger(item.position) || item.position < 0 || item.position >= steps.length ||
        ((item.label === 'unknown') !== (item.outcome === 'unknown')) ||
        (['matched', 'completed'].includes(item.outcome) && item.label !== steps[item.position]) ||
        (item.outcome === 'completed' && item.position !== steps.length - 1)) invalidSession('invalid saved sound detection');
    lastOffset = item.offsetMs;
    return { label: item.label, score: item.score, offsetMs: item.offsetMs, outcome: item.outcome, position: item.position };
  });
  if (value.unknown !== detections.filter(item => item.outcome === 'unknown').length ||
      value.incorrect !== detections.filter(item => item.outcome === 'incorrect').length) invalidSession('incorrect repetition counters');
  let previousOffset = 0;
  const stepTimings = Array.from(value.stepTimings, (item, index) => {
    if (!item || index >= steps.length || item.label !== steps[index] || !finiteNonnegative(item.offsetMs) ||
        item.offsetMs < previousOffset || !finiteNonnegative(item.splitMs) ||
        Math.abs(item.splitMs - (item.offsetMs - previousOffset)) > 0.000001) invalidSession('invalid sound-detection timing splits');
    if (!detections.some(detection => detection.label === item.label && detection.offsetMs === item.offsetMs)) {
      invalidSession('timing split has no matching sound detection');
    }
    previousOffset = item.offsetMs;
    return { label: item.label, offsetMs: item.offsetMs, splitMs: item.splitMs };
  });
  if (value.status === 'waiting' && (detections.length || stepTimings.length || value.elapsedMs !== null)) invalidSession('detections before GO');
  if (value.goAt === null && (detections.length || stepTimings.length || value.elapsedMs !== null)) invalidSession('timings without a GO signal');
  if (value.elapsedMs !== null && value.elapsedMs < Math.max(lastOffset, previousOffset)) invalidSession('elapsed time precedes detections');
  if (value.status === 'completed') {
    if (stepTimings.length !== steps.length || value.goAt === null || value.elapsedMs === null ||
        Math.abs(value.elapsedMs - previousOffset) > 0.000001 || ![null, 'completed'].includes(value.reason) ||
        detections.at(-1)?.outcome !== 'completed' || detections.at(-1)?.offsetMs !== value.elapsedMs) invalidSession('incomplete sequence reported as completed');
  } else if (stepTimings.length >= steps.length) invalidSession('complete sequence reported as partial');
  return { attempt: value.attempt, ordinal: value.ordinal, status: value.status, startedAt: value.startedAt,
    goAt: value.goAt, endedAt: value.endedAt, reason: value.reason, elapsedMs: value.elapsedMs,
    unknown: value.unknown, incorrect: value.incorrect, detections, stepTimings };
}

export function validateSession(value, owner) {
  if (value?.kind === 'practice') return validatePracticeRecord(value, owner);
  if (!value || typeof value.id !== 'string' || !value.id || value.gunId !== owner ||
      typeof value.drillId !== 'string' || !value.drillId || value.drillId.length > 80 ||
      typeof value.drillTitle !== 'string' || !value.drillTitle.trim() || value.drillTitle.length > 80 ||
      !Array.isArray(value.drillSteps) || !value.drillSteps.length || value.drillSteps.length > 32 ||
      !Array.from(value.drillSteps).every(label => labels.includes(label)) ||
      !Number.isInteger(value.revision) || value.revision < 0 || !SESSION_STATUSES.includes(value.status) ||
      !finiteNonnegative(value.startedAt) || !finiteNonnegative(value.updatedAt) || value.updatedAt < value.startedAt ||
      !nullableTime(value.endedAt) || !reasonValue(value.endReason) || !Array.isArray(value.repetitions) ||
      !Number.isInteger(value.completed) || !Number.isInteger(value.remaining)) invalidSession('invalid identity, status or fields');
  validGunDetails(value.gunName, value.gunType);
  if (!value.config || typeof value.config !== 'object' || Array.isArray(value.config)) invalidSession('invalid configuration snapshot');
  const config = normalizeSessionConfig(value.config);
  if (Object.keys(config).some(key => value.config[key] !== config[key])) invalidSession('invalid configuration snapshot');
  if (value.completed < 0 || value.completed > config.repetitions || value.remaining !== config.repetitions - value.completed) {
    invalidSession('incorrect completed and remaining counts');
  }
  const terminal = TERMINAL_SESSION_STATUSES.includes(value.status);
  if ((terminal && value.endedAt === null) || (!terminal && value.endedAt !== null) ||
      (value.endedAt !== null && value.endedAt < value.startedAt) ||
      (value.status === 'completed' && value.remaining !== 0) ||
      (terminal && value.currentAttempt !== null) || (value.status === 'paused' && value.currentAttempt !== null)) invalidSession('invalid final session status');
  const record = { id: value.id, gunId: owner, gunName: value.gunName, gunType: value.gunType,
    drillId: value.drillId, drillTitle: value.drillTitle, drillSteps: [...value.drillSteps], config,
    revision: value.revision, startedAt: value.startedAt, updatedAt: value.updatedAt, endedAt: value.endedAt,
    status: value.status, endReason: value.endReason, completed: value.completed, remaining: value.remaining,
    repetitions: [], currentAttempt: null };
  let completed = 0;
  let previousAttempt = 0;
  record.repetitions = Array.from(value.repetitions, item => {
    const attempt = validateAttempt(item, record, false);
    if (attempt.attempt <= previousAttempt || attempt.ordinal !== completed + 1) invalidSession('invalid repetition order');
    previousAttempt = attempt.attempt;
    if (attempt.status === 'completed') completed += 1;
    return attempt;
  });
  if (completed !== record.completed) invalidSession('completed count does not match saved repetitions');
  if (value.currentAttempt !== null) {
    const current = validateAttempt(value.currentAttempt, record, true);
    if (current.attempt <= previousAttempt || current.ordinal !== completed + 1 || record.remaining === 0) invalidSession('invalid active repetition');
    record.currentAttempt = current;
  }
  return record;
}
