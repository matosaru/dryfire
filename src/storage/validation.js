import {isFeatureVector} from '../classifier.js';
import {normalizeCustomDrill} from '../drills.js';
import {normalizePracticeConfig,practiceDefinition} from '../practiceSession.js';
import {normalizeCalibration,normalizeEnabledLabels} from '../calibration.js';
import {GUN_TYPES} from './constants.js';

export function normalizeMaxResults(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(500, Math.trunc(n)));
}

export function validGunDetails(name, type) {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80 || !GUN_TYPES.includes(type)) {
    throw new TypeError('Enter a gun name of 1–80 characters and select a supported gun type.');
  }
  return { name: name.trim(), type };
}

export function validFeatures(vector) {
  return isFeatureVector(vector) && Array.from(vector).every(Number.isFinite);
}

export function validatePracticeSetting(key, value) {
  if (key === 'calibrationExamples') return normalizeCalibration(value);
  if (key === 'enabledSoundLabels') return normalizeEnabledLabels(value);
  if (key === 'practiceConfig') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Invalid practice settings.');
    return Object.fromEntries(Object.entries(value).map(([mode, config]) => {
      if (!practiceDefinition(mode)) throw new TypeError('Invalid practice mode.');
      return [mode, normalizePracticeConfig(config)];
    }));
  }
  return value;
}

export function validateCustomDrills(value) {
  if (!Array.isArray(value)) throw new TypeError('Invalid custom drill collection.');
  const ids = new Set();
  return Array.from(value, item => {
    const row = normalizeCustomDrill(item);
    if (ids.has(row.id)) throw new TypeError('Duplicated custom drill ID.');
    ids.add(row.id);
    return row;
  });
}

const retiredPractice = mode => ['reload', 'free'].includes(mode);

export const supportedSession = row => row?.kind !== 'practice' || !retiredPractice(row.practiceMode);

export function currentPracticeConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return config;
  return Object.fromEntries(Object.entries(config).filter(([key]) => !['durationSeconds', 'reloadStart', 'reloadEnd'].includes(key)));
}

export function currentPracticeSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).filter(([mode]) => !retiredPractice(mode))
    .map(([mode, config]) => [mode, currentPracticeConfig(config)]));
}

export function currentPracticeRecord(row) {
  if (row.kind !== 'practice') return row;
  return { ...row, config: currentPracticeConfig(row.config) };
}

export const sortedEvents = rows => rows.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
