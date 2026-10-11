import { classify } from '../src/classifier.js';

const positives = [0.98, 1, 1.02].map(x => ({ label: 'trigger', features: [x, x / 2, x / 3] }));
describe('trigger-first recognition', () => {
  test('three trigger positives suffice without other positive classes', () => {
    expect(classify(positives, [1.01, .505, 1.01 / 3]).label).toBe('trigger');
  });
  test('unseen distant noise stays unknown with one positive class', () => {
    expect(classify(positives, [5, 4, 3]).label).toBeNull();
  });
  test('one positive example is insufficient for one-class matching', () => {
    expect(classify(positives.slice(0, 1), positives[0].features).label).toBeNull();
  });
  test('a calibrated reset is rejection evidence rather than another shot', () => {
    const reset = { features: [1.05, .525, .35] };
    expect(classify(positives, reset.features, { negativeExamples: [reset] }).label).toBeNull();
    expect(classify(positives, positives[0].features, { negativeExamples: [reset] }).label).toBe('trigger');
  });
  test('disabled trained handling labels act as rejection evidence', () => {
    const handling = [.99, 1, 1.01].map(x => ({ label: 'rack', features: [x * 2, x * 3, x * 4] }));
    const model = [...positives, ...handling];
    expect(classify(model, handling[1].features, { enabledLabels: ['trigger'] }).label).toBeNull();
    expect(classify(model, positives[1].features, { enabledLabels: ['trigger'] }).label).toBe('trigger');
    expect(classify(model, handling[1].features, { enabledLabels: ['trigger', 'rack'] }).label).toBe('rack');
  });
});
