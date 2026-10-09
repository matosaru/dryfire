import { DRILLS, advanceDrill, createDrillState, getDrill } from '../src/drills.js';

describe('built-in sound-sequence drills', () => {
  test('contains exactly the four requested sequences in order', () => {
    expect(DRILLS.map(({ id, steps }) => [id, [...steps]])).toEqual([
      ['trigger-only', ['trigger']],
      ['rack-trigger', ['rack', 'trigger']],
      ['mag-trigger', ['reload', 'trigger']],
      ['draw-mag-trigger', ['draw', 'reload', 'trigger']],
    ]);
  });

  test.each(DRILLS)('completes $id, then repeats', drill => {
    let state = createDrillState(drill.id);
    for (const sound of drill.steps) state = advanceDrill(state, sound);
    expect(state.completed).toBe(1);
    expect(state.stepIndex).toBe(0);
    expect(state.lastOutcome).toBe('completed');
    for (const sound of drill.steps) state = advanceDrill(state, sound);
    expect(state.completed).toBe(2);
    expect(state.stepIndex).toBe(0);
  });

  test('unexpected known sound resets the partial attempt', () => {
    let s = advanceDrill(createDrillState('draw-mag-trigger'), 'draw');
    s = advanceDrill(s, 'trigger');
    expect(s.stepIndex).toBe(0);
    expect(s.incorrect).toBe(1);
    expect(s.completed).toBe(0);
    expect(s.lastOutcome).toBe('incorrect');
  });

  test('repeating first step begins a new attempt even mid-sequence', () => {
    let s = advanceDrill(createDrillState('draw-mag-trigger'), 'draw');
    s = advanceDrill(s, 'draw');
    expect(s.stepIndex).toBe(1);
    expect(s.incorrect).toBe(1);
  });

  test('unknown sounds do not advance or reset the partial attempt', () => {
    let s = advanceDrill(createDrillState('rack-trigger'), 'rack');
    s = advanceDrill(s, null);
    s = advanceDrill(s, 'unknown');
    expect(s.stepIndex).toBe(1);
    expect(s.unknown).toBe(2);
    expect(advanceDrill(s, 'trigger').completed).toBe(1);
  });

  test('bad IDs and labels are rejected', () => {
    expect(getDrill('nonexistent')).toBeNull();
    expect(() => createDrillState('nonexistent')).toThrow();
    expect(() => advanceDrill(createDrillState('rack-trigger'), 'potato')).toThrow();
  });
});
