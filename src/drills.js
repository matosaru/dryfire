/**
 * Built-in acoustic drill definitions. These describe recognition order only;
 * the classifier remains responsible for deciding what sound it heard.
 */
export const DRILLS = Object.freeze([
  Object.freeze({
    id: 'trigger-only',
    title: 'Trigger pull',
    steps: Object.freeze(['trigger']),
  }),
  Object.freeze({
    id: 'rack-trigger',
    title: 'Rack slide → Trigger pull',
    steps: Object.freeze(['rack', 'trigger']),
  }),
  Object.freeze({
    id: 'mag-trigger',
    title: 'Magazine change → Trigger pull',
    steps: Object.freeze(['reload', 'trigger']),
  }),
  Object.freeze({
    id: 'draw-mag-trigger',
    title: 'Draw from holster → Magazine change → Trigger pull',
    steps: Object.freeze(['draw', 'reload', 'trigger']),
  }),
]);

export function getDrill(id) {
  return DRILLS.find(drill => drill.id === id) ?? null;
}

/** Create a fresh, session-scoped state object, not persisted between launches. */
export function createDrillState(drillId) {
  const drill = getDrill(drillId);
  if (!drill) throw new TypeError('Unknown drill.');
  return { drillId: drill.id, stepIndex: 0, completed: 0, incorrect: 0, unknown: 0, lastOutcome: 'ready' };
}

/**
 * Advance a preset's detected sound sequence. Unknowns are informational;
 * out-of-order KNOWN events invalidate the partial attempt. The first step
 * can immediately start a fresh attempt when it is detected again.
 * Returned state is immutable from the caller's perspective.
 */
export function advanceDrill(state, predictedLabel) {
  const drill = getDrill(state?.drillId);
  if (!drill || !Number.isInteger(state.stepIndex) || state.stepIndex < 0 || state.stepIndex >= drill.steps.length) {
    throw new TypeError('Invalid drill session state.');
  }
  if (predictedLabel == null || predictedLabel === 'unknown') {
    return { ...state, unknown: state.unknown + 1, lastOutcome: 'unknown' };
  }
  if (!['draw', 'rack', 'trigger', 'reload'].includes(predictedLabel)) {
    throw new TypeError('Invalid predicted sound.');
  }
  if (drill.steps[state.stepIndex] !== predictedLabel) {
    return {
      ...state,
      stepIndex: predictedLabel === drill.steps[0] ? 1 : 0,
      incorrect: state.incorrect + 1,
      lastOutcome: 'incorrect',
    };
  }
  const nextStep = state.stepIndex + 1;
  if (nextStep === drill.steps.length) {
    return { ...state, stepIndex: 0, completed: state.completed + 1, lastOutcome: 'completed' };
  }
  return { ...state, stepIndex: nextStep, lastOutcome: 'matched' };
}
