import { analyzeRecording, extractFeatures } from './audio.js';
import { classify } from './classifier.js';

/** Keep saved version-2 vectors; match both legacy short and Learn windows. */
export function recognitionFeatures(samples, sampleRate) {
  const original = analyzeRecording(samples, sampleRate).features;
  const width = Math.floor(sampleRate * .8);
  if (samples.length >= width) return [original];
  const frame = Math.max(64, Math.floor(sampleRate * .01));
  let loudest = 0, energy = 0;
  for (let start = 0; start + frame <= samples.length; start += frame) {
    let sum = 0;
    for (let i = start; i < start + frame; i++) sum += samples[i] ** 2;
    if (sum > energy) { energy = sum; loudest = start; }
  }
  // Learn analyses a 0.8 s window with its dominant frame at 35%.
  // Supply the missing silence around a short segment using the same framing.
  const padded = new Float32Array(width);
  const leading = Math.max(0, Math.floor(width * .35) - loudest);
  padded.set(samples.subarray(0, width - leading), leading);
  return [original, extractFeatures(padded, sampleRate)];
}

export function selectRecognition(predictions) {
  const available = predictions.filter(Boolean);
  // A plausible calibrated negative in either framing keeps an ambiguous click unknown.
  const rejected = available.find(result => result.rejectedNegative && result.distances[result.closestLabel] <= result.rejectionRadius);
  if (rejected) return { ...rejected, status: 'unknown', label: null };
  const matched = available.filter(result => result.label !== null);
  return (matched.length ? matched : available).sort((a, b) => b.score - a.score)[0] || null;
}

export function recognizeRecording(examples, samples, sampleRate, options) {
  return selectRecognition(recognitionFeatures(samples, sampleRate).map(features => classify(examples, features, options)));
}
