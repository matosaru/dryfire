/** A compact, local similarity model; scores are NOT calibrated probabilities. */
export const labels = Object.freeze(['draw', 'rack', 'trigger', 'reload']);
export const MIN_EXAMPLES_PER_CLASS = 3;
export const RECOMMENDED_EXAMPLES_PER_CLASS = 8;

export function isFeatureVector(vector) {
  return Array.isArray(vector) && vector.length > 0 && vector.length <= 128 &&
    vector.every(value => typeof value === 'number' && Number.isFinite(value));
}

export function trainingCounts(examples) {
  return Object.fromEntries(labels.map(label => [label, examples.filter(e => e.label === label).length]));
}

function euclidean(a, b) {
  let squared = 0;
  for (let i = 0; i < a.length; i += 1) squared += (a[i] - b[i]) ** 2;
  return Math.sqrt(squared);
}

function normalizeTraining(examples, candidate, negatives = []) {
  const dims = candidate.length;
  const means = new Array(dims).fill(0);
  const scales = new Array(dims).fill(1);
  for (let d = 0; d < dims; d += 1) {
    means[d] = examples.reduce((s, item) => s + item.features[d], 0) / examples.length;
    const variance = examples.reduce((s, item) => s + (item.features[d] - means[d]) ** 2, 0) / examples.length;
    // Do not allow near-constant features to dominate the distance.
    scales[d] = Math.max(Math.sqrt(variance), Math.abs(means[d]) * 0.05, 0.005);
  }
  const transform = vector => vector.map((value, i) => (value - means[i]) / scales[i]);
  return { examples: examples.map(e => ({ label: e.label, vector: transform(e.features) })), candidate: transform(candidate), negatives: negatives.map(e => transform(e.features)) };
}

function averageNearest(distances, count = 3) {
  if (!distances.length) return Infinity;
  const closest = distances.sort((a, b) => a - b).slice(0, count);
  return closest.reduce((sum, distance) => sum + distance, 0) / closest.length;
}

/**
 * Returns {label:null, status:'unknown'} for ambiguous or out-of-distribution
 * inputs. Calibration is heuristic and must be validated with real samples.
 */
export function classify(examples, candidate, { enabledLabels = labels, negativeExamples = [] } = {}) {
  if (!isFeatureVector(candidate)) throw new TypeError('Invalid feature vector.');
  const compatible = item => isFeatureVector(item?.features) && item.features.length === candidate.length;
  const allowed = new Set(enabledLabels.filter(label => labels.includes(label)));
  const training = examples.filter(item => allowed.has(item.label) && compatible(item));
  if (!training.length) return null;

  const negatives = [...negativeExamples, ...examples.filter(item => labels.includes(item.label) && !allowed.has(item.label))].filter(compatible);
  const normalized = normalizeTraining(training, candidate, negatives);
  const byLabel = Object.fromEntries(labels.map(label => {
    const distances = normalized.examples.filter(e => e.label === label).map(e => euclidean(e.vector, normalized.candidate));
    return [label, averageNearest(distances)];
  }));
  const ranked = Object.entries(byLabel).sort((a, b) => a[1] - b[1]);
  const [bestLabel, bestDistance] = ranked[0];
  const second = ranked[1][1];

  // Leave-one-out distances measure how far genuine examples are from classmates.
  const knownDistances = normalized.examples.filter(e => e.label === bestLabel).map((sample, index, group) => {
    const classmates = group.filter((_, i) => i !== index).map(e => euclidean(e.vector, sample.vector));
    return averageNearest(classmates);
  }).filter(Number.isFinite).sort((a, b) => a - b);
  const percentile = knownDistances.length
    ? knownDistances[Math.floor((knownDistances.length - 1) * 0.9)] : 0;
  const rejectionRadius = Math.max(2.5, percentile * 1.8);
  const margin = Number.isFinite(second) && second > 0 ? Math.max(0, 1 - bestDistance / second) : 0;
  const closeness = Math.max(0, 1 - bestDistance / rejectionRadius);
  const score = Math.round(100 * (0.65 * closeness + 0.35 * (Number.isFinite(second) ? margin : closeness)));
  const hasCompetition = Number.isFinite(second);
  const enoughSingleClass = training.filter(item => item.label === bestLabel).length >= MIN_EXAMPLES_PER_CLASS;
  const negativeDistance = normalized.negatives.length ? Math.min(...normalized.negatives.map(vector => euclidean(vector, normalized.candidate))) : Infinity;
  const rejectedNegative = negativeDistance <= bestDistance * 1.25 + 1e-8;
  const recognized = !rejectedNegative && bestDistance <= rejectionRadius && (hasCompetition ? margin >= 0.12 : enoughSingleClass);

  return {
    status: recognized ? 'matched' : 'unknown',
    label: recognized ? bestLabel : null,
    closestLabel: bestLabel,
    score,
    // Kept for previous callers, but never use this value as a probability.
    confidence: score / 100,
    distances: byLabel,
    rejectionRadius,
    rejectedNegative,
  };
}
