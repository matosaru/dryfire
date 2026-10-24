// Engine/controllers need only identity and titles. Keep the complete public
// catalog for build-time presentation without shipping its unused descriptions.
const definitions = Object.freeze([
  {
    "id": "single",
    "title": "Single trigger press"
  },
  {
    "id": "repeated",
    "title": "Repeated trigger press"
  },
  {
    "id": "par",
    "title": "Par time practice"
  },
  {
    "id": "control",
    "title": "Trigger control"
  }
]);
const descriptions = {
  "single": "Reaction time for one click after each start signal.",
  "repeated": "Count distinct clicks and the intervals between them.",
  "par": "Recognize a click within your chosen time limit.",
  "control": "Compare the consistency of your detected click intervals."
};
export const PRACTICE_MODES = /* @__PURE__ */ Object.freeze(
  /* @__PURE__ */ definitions.map(mode => ({ ...mode, description: descriptions[mode.id] }))
);
export const practiceMode = id => PRACTICE_MODES.find(mode => mode.id === id);
export const practiceDefinition = id => definitions.find(mode => mode.id === id);

// Preserve immutable titles in supported sessions saved before the catalog copy update.
const previousTitles = { repeated: 'Repeated trigger presses', par: 'Par-time practice' };
export const matchesPracticeTitle = (mode, title) => typeof title === 'string' &&
  (title === practiceDefinition(mode)?.title || title === previousTitles[mode]);
