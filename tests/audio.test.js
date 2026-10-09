import { analyzeRecording, extractFeatures, FEATURE_VERSION } from '../src/audio.js';

function toneSamples(durationSeconds = 2, sampleRate = 8000, onset = 0.4, amplitude = 0.4) {
  const samples = new Float32Array(durationSeconds * sampleRate);
  const start = Math.floor(onset * sampleRate);
  for (let i = start; i < Math.min(samples.length, start + 1200); i += 1) {
    samples[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * amplitude;
  }
  return samples;
}

describe('audio features', () => {
  test('returns a finite 15-value vector', () => {
    const vector = extractFeatures(toneSamples(2, 8000), 8000);
    expect(vector).toHaveLength(15);
    expect(vector.every(Number.isFinite)).toBe(true);
    expect(vector[0]).toBeGreaterThan(0);
    expect(FEATURE_VERSION).toBe(2);
  });

  test('returns finite zeros for an extremely short snippet', () => {
    expect(extractFeatures(new Float32Array([0.1, -0.1]), 48000)).toEqual(Array(15).fill(0));
  });

  test('rejects silence', () => {
    expect(() => analyzeRecording(new Float32Array(16000), 8000)).toThrow(/No clear sound/i);
  });

  test('rejects clipped audio', () => {
    expect(() => analyzeRecording(new Float32Array(16000).fill(1), 8000)).toThrow(/distorted/i);
  });

  test('rejects recordings that are too short', () => {
    expect(() => analyzeRecording(new Float32Array(10), 8000)).toThrow(/too short/i);
  });

  test('extracts comparable features when the same event occurs at different offsets', () => {
    const a = analyzeRecording(toneSamples(2, 8000, 0.4), 8000);
    const b = analyzeRecording(toneSamples(2, 8000, 1.1), 8000);
    expect(a.features).toHaveLength(15);
    a.features.forEach((value, i) => expect(value).toBeCloseTo(b.features[i], 1));
  });
});
