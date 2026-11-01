import { isFeatureVector, MIN_EXAMPLES_PER_CLASS } from './classifier.js';

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Guidance only: this never changes, deletes or re-labels saved examples. */
export function assessTriggerProfile(examples) {
  const candidates = examples.filter(item => item?.label === 'trigger' && isFeatureVector(item.features));
  const lengthCounts = new Map();
  for (const item of candidates) lengthCounts.set(item.features.length, (lengthCounts.get(item.features.length) ?? 0) + 1);
  const dimensions = [...lengthCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const samples = candidates.filter(item => item.features.length === dimensions);
  const sampleCount = samples.length;
  if (sampleCount < MIN_EXAMPLES_PER_CLASS) return {
    status: 'needs-samples', sampleCount, needed: MIN_EXAMPLES_PER_CLASS - sampleCount, outlierIndexes: [],
    title: 'Needs samples', message: `Record ${MIN_EXAMPLES_PER_CLASS - sampleCount} more natural trigger ${MIN_EXAMPLES_PER_CLASS - sampleCount === 1 ? 'press' : 'presses'}.`,
  };

  const centers = Array.from({ length: dimensions }, (_, dimension) => median(samples.map(item => item.features[dimension])));
  const scales = centers.map((center, dimension) => {
    const deviation = median(samples.map(item => Math.abs(item.features[dimension] - center)));
    return Math.max(deviation * 1.4826, Math.abs(center) * .03, .005);
  });
  const distances = samples.map(item => Math.sqrt(item.features.reduce((sum, value, dimension) => sum + ((value - centers[dimension]) / scales[dimension]) ** 2, 0) / dimensions));
  const outlierIndexes = distances.map((distance, index) => distance > 4 ? index : -1).filter(index => index >= 0);
  if (outlierIndexes.length) return {
    status: 'variable', sampleCount, needed: 0, outlierIndexes,
    title: 'Variable examples', message: 'The examples differ. Keep one room and phone position; reset and rerecord if this stays variable.',
  };
  return { status: 'stable', sampleCount, needed: 0, outlierIndexes: [], title: 'Stable profile', message: 'Your trigger examples are consistent. Run a sound check before practice.' };
}

export function renderTriggerProfile(examples, root = document) {
  const quality=assessTriggerProfile(examples),status=root.querySelector('#triggerProfileStatus');
  status.className=`trigger-profile-status is-${quality.status}`;
  root.querySelector('#triggerProfileSymbol').textContent=quality.status==='stable'?'✓':quality.status==='variable'?'!':'…';
  root.querySelector('#triggerProfileTitle').textContent=quality.title;
  root.querySelector('#triggerProfileMessage').textContent=quality.message;
}

