import { FEATURE_VERSION } from './featureFormat.js';
import { labels, isFeatureVector, trainingCounts, MIN_EXAMPLES_PER_CLASS } from './classifier.js';
export const CALIBRATION_KINDS = Object.freeze(['reset', 'noise', 'cue']);
export function normalizeCalibration(value) {
  if (!Array.isArray(value) || value.length > 150) throw new TypeError('Invalid rejection/cue calibration.');
  const ids = new Set(), counts = {};
  return value.map(row => {
    if (!row || typeof row.id !== 'string' || !row.id || ids.has(row.id) || !CALIBRATION_KINDS.includes(row.kind) ||
        !isFeatureVector(row.features) || row.features.length !== 15 || !Number.isInteger(row.featureVersion) || row.featureVersion < 1 ||
        !Number.isFinite(row.createdAt) || row.createdAt < 0 || (counts[row.kind] ?? 0) >= 50) throw new TypeError('Invalid rejection/cue calibration.');
    ids.add(row.id); counts[row.kind] = (counts[row.kind] ?? 0) + 1;
    return { id: row.id, kind: row.kind, features: [...row.features], featureVersion: row.featureVersion, createdAt: row.createdAt };
  });
}
export const compatibleCalibration = rows => rows.filter(row => row.featureVersion === FEATURE_VERSION);
export function normalizeEnabledLabels(value) {
  if (!Array.isArray(value) || !value.includes('trigger') || new Set(value).size !== value.length || !value.every(label => labels.includes(label))) throw new TypeError('Invalid optional sound preferences.');
  return labels.filter(label => value.includes(label));
}
export function initialEnabledLabels(examples) {
  const counts = trainingCounts(examples);
  return labels.filter(label => label === 'trigger' || counts[label] >= MIN_EXAMPLES_PER_CLASS);
}
export function recognitionOptions(calibration, enabledLabels) {
  return { enabledLabels, negativeExamples: compatibleCalibration(calibration) };
}
export function classifyExternalCue(classify, examples, calibration, features) {
  const cues = compatibleCalibration(calibration).filter(row => row.kind === 'cue').map(row => ({ ...row, label: 'trigger' }));
  if (cues.length < MIN_EXAMPLES_PER_CLASS) return null;
  return classify(cues, features, { enabledLabels: ['trigger'], negativeExamples: [
    ...examples, ...compatibleCalibration(calibration).filter(row => row.kind !== 'cue'),
  ] });
}
