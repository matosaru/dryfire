import { renderPracticeRun, renderPracticeReview, practiceResultDetails, renderSequenceRun, renderSequenceReview, sequenceResultDetails } from '../../src/sessionPresentation.js';
import { toPracticeRecord } from '../../src/practiceSession.js';
import { toSessionRecord } from '../../src/drillSession.js';
import { guideSoundTitle } from '../../src/practiceGuides.js';

/** The same templates and presentation used by a real session; only the input
 * model differs. This module has no capture, persistence or feedback API. */
export function createGuideExampleRenderer(doc) {
  const get = id => doc.getElementById('example-' + id);
  const query = selector => doc.querySelector(selector.replace(/#([\w-]+)/g, '#example-$1'));
  const node = (tag, text, className = '') => { const el = doc.createElement(tag); el.textContent = text; el.className = className; return el; };
  const titleFor = guideSoundTitle;
  const details = row => practiceResultDetails(row, { node, titleFor });
  const resultDetails = row => sequenceResultDetails(row, { node, titleFor });
  return (frame, guide) => {
    const { state, config, atMs: now } = frame;
    const sequence = guide.kind === 'sequence', review = state?.phase === 'review';
    for (const type of ['practice', 'session']) {
      get(type + 'Run').classList.toggle('hidden', (type === 'session') !== sequence || review);
      get(type + 'Review').classList.toggle('hidden', (type === 'session') !== sequence || !review);
    }
    const common = { state, pending: !state, clock: () => now, microphone: !!state && !review, readConfig: () => config,
      node, titleFor, savedRevision: state?.revision, saveError: null, saving: false, locked: () => false,
      getContext: () => ({ gun: { id: 'guide-example' } }) };
    if (sequence) {
      if (review) {
        renderSequenceReview(toSessionRecord(state), { ...common, $: query, resultDetails, retrySaveButton: doc.createElement('button') });
        query('#sessionReview .session-saved-note').textContent = 'Example only · nothing saved';
      } else renderSequenceRun({ ...common, $: query, resultDetails, announce: value => { get('sessionAnnouncement').textContent = value; } });
    } else if (review) {
      renderPracticeReview(toPracticeRecord(state), { ...common, $: get, details, interruption: false });
      get('practiceSaved').textContent = 'Example only · nothing saved';
    } else renderPracticeRun({ ...common, $: get, mode: guide.id, interruption: false, closing: false, details,
      inputFeedback: frame.beep ? 'Example start signal · silent illustration' : '',
      renderInput: () => {
        const level = state ? frame.pulse ? 72 : 9 : 0;
        get('practiceLevelFill').style.width = `${level}%`;
        get('practiceLevelMeter').setAttribute('aria-valuenow', String(level));
        get('practiceLevelMeter').setAttribute('aria-valuetext', `${level} simulated input level`);
        get('practiceLevelValue').textContent = level;
        get('practiceInputState').textContent = state ? 'Microphone input detected.' : 'Waiting for audio input…';
      } });
    doc.getElementById('practiceGuideExample').dataset.phase = frame.phase;
  };
}
