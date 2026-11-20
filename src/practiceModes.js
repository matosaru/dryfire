// Persisted records keep their original English title for compatibility.
// Current titles and descriptions are sourced from locale catalogs.
const storedDefinitions = Object.freeze([
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
export const PRACTICE_MODES = Object.freeze(storedDefinitions.map(({id})=>Object.freeze({id})));
export const PRACTICE_MODE_IDS = PRACTICE_MODES;
export const practiceMode = id => PRACTICE_MODES.find(mode => mode.id === id);
export const practiceDefinition = id => storedDefinitions.find(mode => mode.id === id);

// Preserve immutable titles in supported sessions saved before the catalog copy update.
const previousTitles = { repeated: 'Repeated trigger presses', par: 'Par-time practice' };
export const matchesPracticeTitle = (mode, title) => typeof title === 'string' &&
  (title === practiceDefinition(mode)?.title || title === previousTitles[mode]);
