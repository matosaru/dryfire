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
  if (sampleCount < MIN_EXAMPLES_PER_CLASS) return { status: 'needs-samples', sampleCount, needed: MIN_EXAMPLES_PER_CLASS - sampleCount, outlierIndexes: [] };

  const centers = Array.from({ length: dimensions }, (_, dimension) => median(samples.map(item => item.features[dimension])));
  const scales = centers.map((center, dimension) => {
    const deviation = median(samples.map(item => Math.abs(item.features[dimension] - center)));
    return Math.max(deviation * 1.4826, Math.abs(center) * .03, .005);
  });
  const distances = samples.map(item => Math.sqrt(item.features.reduce((sum, value, dimension) => sum + ((value - centers[dimension]) / scales[dimension]) ** 2, 0) / dimensions));
  const outlierIndexes = distances.map((distance, index) => distance > 4 ? index : -1).filter(index => index >= 0);
  if (outlierIndexes.length) return { status: 'variable', sampleCount, needed: 0, outlierIndexes };
  return { status: 'stable', sampleCount, needed: 0, outlierIndexes: [] };
}

export function renderTriggerProfile(examples, root = document, translate) {
  if (typeof translate !== 'function') throw new TypeError('A message resolver is required to render trigger profile guidance.');
  const quality=assessTriggerProfile(examples),status=root.querySelector('#triggerProfileStatus');
  status.className=`trigger-profile-status is-${quality.status}`;
  root.querySelector('#triggerProfileSymbol').textContent=quality.status==='stable'?'✓':quality.status==='variable'?'!':'…';
  const key=quality.status==='needs-samples'?'needsSamples':quality.status==='variable'?'variable':'stable';
  root.querySelector('#triggerProfileTitle').textContent=translate(`profile.${key}`);
  root.querySelector('#triggerProfileMessage').textContent=quality.status==='needs-samples'
    ? translate(quality.needed===1?'profile.oneSample':'profile.needsSamplesMessage',{count:quality.needed})
    : translate(quality.status==='variable'?'profile.variableMessage':'profile.stableMessage');
  const eyebrow=root.querySelector('#triggerProfileStatus .eyebrow');if(eyebrow)eyebrow.textContent=translate('profile.eyebrow');
  const button=root.querySelector('#runSoundCheckBtn');if(button)button.textContent=translate('profile.soundCheck');
  if(button)button.disabled=quality.status==='needs-samples';
}

