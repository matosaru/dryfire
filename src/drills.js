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

// Display only multi-action built-ins; retain every definition for saved sessions.
export const SEQUENCE_DRILLS = Object.freeze(DRILLS.filter(drill => drill.steps.length > 1));

const SOUND_LABELS = Object.freeze(['draw', 'rack', 'trigger', 'reload']);

/** Validate user/imported presets and return an independent recognition definition. */
export function normalizeCustomDrill(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Custom drill must be an object.');
  }
  const { id, title, steps } = value;
  if (typeof id !== 'string' || id.length > 80 || !/^[A-Za-z0-9_-]+$/.test(id)
    || DRILLS.some(drill => drill.id === id)) {
    throw new TypeError('Custom drill ID is invalid or reserved.');
  }
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 80) {
    throw new TypeError('Custom drill name must contain 1 to 80 characters.');
  }
  if (!Array.isArray(steps) || steps.length < 1 || steps.length > 32
    || Array.from(steps).some(step => !SOUND_LABELS.includes(step))) {
    throw new TypeError('Custom drill must contain 1 to 32 known actions.');
  }
  return { id, title: title.trim(), steps: [...steps] };
}

export function getDrill(id, customDrills = []) {
  const builtIn = DRILLS.find(drill => drill.id === id);
  if (builtIn) return builtIn;
  if (!Array.isArray(customDrills)) throw new TypeError('Custom drill catalog must be an array.');
  const custom = customDrills.find(drill => drill?.id === id);
  return custom ? normalizeCustomDrill(custom) : null;
}

/** Create a fresh, session-scoped state object, not persisted between launches. */
export function createDrillState(drillId, customDrills = []) {
  const drill = getDrill(drillId, customDrills);
  if (!drill) throw new TypeError('Unknown drill.');
  return { drillId: drill.id, stepIndex: 0, completed: 0, incorrect: 0, unknown: 0, lastOutcome: 'ready' };
}

/**
 * Advance a preset's detected sound sequence. Unknowns are informational;
 * out-of-order KNOWN events invalidate the partial attempt. The first step
 * can immediately start a fresh attempt when it is detected again.
 * Returned state is immutable from the caller's perspective.
 */
export function advanceDrill(state, predictedLabel, customDrills = []) {
  const drill = getDrill(state?.drillId, customDrills);
  if (!drill || !Number.isInteger(state.stepIndex) || state.stepIndex < 0 || state.stepIndex >= drill.steps.length) {
    throw new TypeError('Invalid drill session state.');
  }
  if (predictedLabel == null || predictedLabel === 'unknown') {
    return { ...state, unknown: state.unknown + 1, lastOutcome: 'unknown' };
  }
  if (!SOUND_LABELS.includes(predictedLabel)) {
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
