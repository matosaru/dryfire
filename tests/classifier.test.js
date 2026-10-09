import { classify, labels, trainingCounts, MIN_EXAMPLES_PER_CLASS, isFeatureVector } from '../src/classifier.js';

const examples = [
  { label: 'draw', features: [0.10, 0.20, 0.10] },
  { label: 'draw', features: [0.12, 0.18, 0.11] },
  { label: 'draw', features: [0.11, 0.19, 0.09] },
  { label: 'reload', features: [0.70, 0.80, 0.75] },
  { label: 'reload', features: [0.72, 0.78, 0.76] },
  { label: 'reload', features: [0.71, 0.81, 0.74] },
  { label: 'rack', features: [1.95, 2.06, 2.04] },
  { label: 'rack', features: [1.94, 2.04, 2.06] },
  { label: 'rack', features: [1.98, 2.03, 2.08] },
  { label: 'trigger', features: [1.30, 1.40, 1.35] },
  { label: 'trigger', features: [1.28, 1.42, 1.34] },
  { label: 'trigger', features: [1.31, 1.39, 1.36] },
];

describe('classifier', () => {
  test('supports four distinct learned actions and counts training data', () => {
    expect(labels).toEqual(['draw', 'rack', 'trigger', 'reload']);
    expect(MIN_EXAMPLES_PER_CLASS).toBe(3);
    expect(trainingCounts(examples)).toEqual({ draw: 3, rack: 3, trigger: 3, reload: 3 });
  });

  test('requires valid candidate features', () => {
    expect(isFeatureVector([0.5, 1])).toBe(true);
    expect(isFeatureVector([NaN])).toBe(false);
    expect(() => classify(examples, [NaN])).toThrow(TypeError);
  });

  test('returns null when there are no examples', () => {
    expect(classify([], [1, 2, 3])).toBeNull();
  });

  test('classifies a candidate similar to learned draw examples', () => {
    const result = classify(examples, [0.105, 0.195, 0.1]);
    expect(result.label).toBe('draw');
    expect(result.status).toBe('matched');
    expect(result.score).toBeGreaterThan(60);
    expect(result.distances.draw).toBeLessThan(result.distances.reload);
  });

  test('returns unknown for clearly foreign sound features', () => {
    const result = classify(examples, [20, 20, 20]);
    expect(result.status).toBe('unknown');
    expect(result.label).toBeNull();
  });

  test('filters legacy malformed examples, retaining absent classes as Infinity', () => {
    const result = classify([
      { label: 'draw', features: [0.2, 0.3] },
      { label: 'trigger', features: [NaN, 0.4] },
      { label: 'reload', features: [0.4] },
    ], [0.2, 0.3]);
    expect(result.status).toBe('unknown'); // one class offers no competition
    expect(result.distances.reload).toBe(Infinity);
  });
});
