import * as drillLogic from '../src/drills.js';

const { DRILLS, advanceDrill, createDrillState, getDrill } = drillLogic;

describe('built-in sound-sequence drills', () => {
  test('catalog shows only multi-action sequences while legacy trigger sessions still resolve', () => {
    expect(drillLogic.SEQUENCE_DRILLS.map(drill => drill.id)).toEqual(['rack-trigger', 'mag-trigger', 'draw-mag-trigger']);
    expect(getDrill('trigger-only').steps).toEqual(['trigger']);
  });
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

describe('custom sound-sequence drills', () => {
  const preset = {
    id: 'custom-repeated-trigger',
    title: '  Two triggers after rack  ',
    steps: ['rack', 'trigger', 'trigger'],
  };

  test('normalizes a preset without mutating its title or steps', () => {
    const normalized = drillLogic.normalizeCustomDrill(preset);
    expect(normalized).toEqual({
      id: preset.id,
      title: 'Two triggers after rack',
      steps: ['rack', 'trigger', 'trigger'],
    });
    expect(normalized).not.toBe(preset);
    expect(normalized.steps).not.toBe(preset.steps);
    normalized.steps.push('draw');
    expect(preset.steps).toEqual(['rack', 'trigger', 'trigger']);
    expect(preset.title).toBe('  Two triggers after rack  ');
  });

  test('resolves only the supplied custom catalog and retains built-in identity', () => {
    expect(getDrill(preset.id)).toBeNull();
    expect(getDrill(preset.id, [preset])).toEqual({ ...preset, title: 'Two triggers after rack' });
    expect(getDrill('missing', [preset])).toBeNull();
    for (const builtIn of DRILLS) expect(getDrill(builtIn.id, [preset])).toBe(builtIn);
  });

  test('completes a repeated-action sequence and starts another repetition', () => {
    let state = createDrillState(preset.id, [preset]);
    for (const sound of preset.steps) state = advanceDrill(state, sound, [preset]);
    expect(state).toMatchObject({ completed: 1, stepIndex: 0, incorrect: 0, lastOutcome: 'completed' });
    for (const sound of preset.steps) state = advanceDrill(state, sound, [preset]);
    expect(state.completed).toBe(2);
  });

  test('retains unknown and out-of-order semantics for custom drills', () => {
    let state = advanceDrill(createDrillState(preset.id, [preset]), 'rack', [preset]);
    state = advanceDrill(state, 'unknown', [preset]);
    expect(state).toMatchObject({ stepIndex: 1, unknown: 1, incorrect: 0 });
    state = advanceDrill(state, 'draw', [preset]);
    expect(state).toMatchObject({ stepIndex: 0, incorrect: 1, completed: 0, lastOutcome: 'incorrect' });
    state = advanceDrill(state, 'rack', [preset]);
    state = advanceDrill(state, 'rack', [preset]);
    expect(state).toMatchObject({ stepIndex: 1, incorrect: 2, lastOutcome: 'incorrect' });
  });

  test('supports the minimum and maximum sequence lengths', () => {
    for (const steps of [['trigger'], Array(32).fill('trigger')]) {
      const definition = { id: 'custom-length', title: 'Length', steps };
      let state = createDrillState(definition.id, [definition]);
      for (const sound of steps) state = advanceDrill(state, sound, [definition]);
      expect(state.completed).toBe(1);
      expect(state.stepIndex).toBe(0);
    }
  });

  test.each([
    ['missing object', null],
    ['missing ID', { title: 'Example', steps: ['draw'] }],
    ['non-string ID', { id: 5, title: 'Example', steps: ['draw'] }],
    ['blank ID', { id: ' ', title: 'Example', steps: ['draw'] }],
    ['unsafe ID', { id: 'custom/<script>', title: 'Example', steps: ['draw'] }],
    ['untrimmed ID', { id: ' custom-test ', title: 'Example', steps: ['draw'] }],
    ['long ID', { id: 'x'.repeat(81), title: 'Example', steps: ['draw'] }],
    ['built-in ID collision', { id: 'trigger-only', title: 'Example', steps: ['draw'] }],
    ['missing title', { id: 'custom-test', steps: ['draw'] }],
    ['non-string title', { id: 'custom-test', title: 5, steps: ['draw'] }],
    ['blank title', { id: 'custom-test', title: '\t ', steps: ['draw'] }],
    ['long title', { id: 'custom-test', title: 'x'.repeat(81), steps: ['draw'] }],
    ['missing steps', { id: 'custom-test', title: 'Example' }],
    ['non-array steps', { id: 'custom-test', title: 'Example', steps: 'draw' }],
    ['empty sequence', { id: 'custom-test', title: 'Example', steps: [] }],
    ['too many steps', { id: 'custom-test', title: 'Example', steps: Array(33).fill('draw') }],
    ['sparse steps', { id: 'custom-test', title: 'Example', steps: Array(3) }],
    ['null action', { id: 'custom-test', title: 'Example', steps: [null] }],
    ['unknown action', { id: 'custom-test', title: 'Example', steps: ['unknown'] }],
    ['display label instead of identifier', { id: 'custom-test', title: 'Example', steps: ['Draw'] }],
    ['renamed persisted label', { id: 'custom-test', title: 'Example', steps: ['magazine'] }],
  ])('rejects %s', (_reason, definition) => {
    expect(() => drillLogic.normalizeCustomDrill(definition)).toThrow(TypeError);
  });

  test('removes extra fields and preserves exactly 80-character titles', () => {
    const normalized = drillLogic.normalizeCustomDrill({
      id: 'custom-test', title: ` ${'x'.repeat(80)} `, steps: ['draw'], gunId: 'other-gun', completed: 99,
    });
    expect(normalized).toEqual({ id: 'custom-test', title: 'x'.repeat(80), steps: ['draw'] });
  });

  test('rejects unknown custom state and invalid labels', () => {
    expect(() => createDrillState(preset.id)).toThrow(TypeError);
    const state = createDrillState(preset.id, [preset]);
    expect(() => advanceDrill(state, 'rack')).toThrow(TypeError);
    expect(() => advanceDrill(state, 'potato', [preset])).toThrow(TypeError);
    expect(() => advanceDrill({ ...state, stepIndex: 3 }, 'trigger', [preset])).toThrow(TypeError);
  });
});
