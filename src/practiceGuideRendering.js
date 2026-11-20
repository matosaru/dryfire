import { textElement } from './textElement.js';
import { renderPracticeRun, renderPracticeReview, practiceResultDetails, renderSequenceRun, renderSequenceReview, sequenceResultDetails } from './sessionPresentation.js';
import { toPracticeRecord } from './practiceSession.js';
import { toSessionRecord } from './drillSession.js';
import { guideSoundTitle } from './practiceGuides.js';
import {translate} from '../apps/web/src/localization/runtime.ts';
const tr=(key,parameters={})=>translate('practice-guide',`example.${key}`,parameters);

/** The same templates and presentation used by a real session; only the input
 * model differs. This module has no capture, persistence or feedback API. */
export function createGuideExampleRenderer(doc) {
  const get = id => doc.getElementById('example-' + id);
  const query = selector => doc.querySelector(selector.replace(/#([\w-]+)/g, '#example-$1'));
  const node = (tag, text, className = '') => textElement(tag, text, className, doc);
  const titleFor = guideSoundTitle;
  const details = row => practiceResultDetails(row, { node, titleFor });
  const resultDetails = row => sequenceResultDetails(row, { node, titleFor });
  let view=null;
  const models={};
  const present=key=>model=>{models[key]=model;if(!view)return false;view[key](model);return true;};
  const render = (frame, guide) => {
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
        renderSequenceReview(toSessionRecord(state), { ...common, $: query, resultDetails, retrySaveButton: doc.createElement('button'), reviewNote:tr('nothingSaved'),noRepetition:translate('common','sessionUi.noRepetition'),retryLabel:translate('common','sessionUi.retrySaving'),present:present('setSequenceReview') });
      } else renderSequenceRun({ ...common, $: query, resultDetails, latestEmpty:translate('common','sessionUi.latestEmpty'),present:present('setSequenceRun'), announce: value => { get('sessionAnnouncement').textContent = value; } });
    } else if (review) {
      renderPracticeReview(toPracticeRecord(state), { ...common, $: get, details, interruption: false,reviewNote:tr('nothingSaved'),noAttempt:translate('common','sessionUi.noAttempt'),present:present('setPracticeReview') });
    } else renderPracticeRun({ ...common, $: get, mode: guide.id, interruption: false, closing: false, details,latestEmpty:translate('common','sessionUi.practiceLatestEmpty'),present:present('setPracticeRun'),
      inputFeedback: frame.beep ? tr('startSignalSilentIllustration') : '',
      renderInput: () => {
        const level = state ? frame.pulse ? 72 : 9 : 0;
        get('practiceLevelFill').style.width = `${level}%`;
        get('practiceLevelMeter').setAttribute('aria-valuenow', String(level));
        get('practiceLevelMeter').setAttribute('aria-valuetext', tr('simulatedInputLevel',{level}));
        get('practiceLevelValue').textContent = level;
        get('practiceInputState').textContent = state ? tr('microphoneInputDetected') : tr('waitingForAudio');
      } });
    doc.getElementById('practiceGuideExample').dataset.phase = frame.phase;
  };
  render.connectView=(mount,onAction)=>{if(view)return false;view=mount(doc,{models,titleFor,onAction});return true;};
  return render;
}
