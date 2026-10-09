import { ACTUAL_CLASSES, PREDICTED_CLASSES, evaluateEvents } from '../src/evaluation.js';

describe('manually verified recognition metrics', () => {
  test('only counts labeled events, including correct unknown rejection', () => {
    const result = evaluateEvents([
      { label: 'draw', actualLabel: 'draw' },
      { label: 'reload', actualLabel: 'draw' },
      { label: 'unknown', actualLabel: 'other' },
      { label: 'trigger', actualLabel: 'other' },
      { label: 'draw' },
    ]);
    expect(result.verified).toBe(4);
    expect(result.correct).toBe(2);
    expect(result.accuracy).toBe(0.5);
    expect(result.matrix.draw.reload).toBe(1);
    expect(result.matrix.other.unknown).toBe(1);
    expect(result.falsePositives).toBe(1);
    expect(result.otherFalsePositiveRate).toBe(0.5);
    expect(result.recallByClass.draw).toBe(0.5);
  });

  test('slide-racking is tracked independently of magazine changes', () => {
    const result = evaluateEvents([
      { label: 'rack', actualLabel: 'rack' },
      { label: 'reload', actualLabel: 'rack' },
      { label: 'reload', actualLabel: 'reload' },
    ]);
    expect(result.verified).toBe(3);
    expect(result.correct).toBe(2);
    expect(result.matrix.rack.reload).toBe(1);
  });

  test('empty metrics do not invent accuracy or false-positive rate', () => {
    const result = evaluateEvents([]);
    expect(result.verified).toBe(0);
    expect(result.accuracy).toBeNull();
    expect(result.otherFalsePositiveRate).toBeNull();
    expect(ACTUAL_CLASSES).toEqual(['draw', 'rack', 'trigger', 'reload', 'other']);
    expect(PREDICTED_CLASSES).toEqual(['draw', 'rack', 'trigger', 'reload', 'unknown']);
  });
});
