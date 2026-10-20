import { getPracticeGuide, guideSoundTitle } from './practiceGuides.js';
import { createScenario, FRAME_MS } from './practiceGuideExamples.js';
import { createGuideExampleRenderer } from './practiceGuideRendering.js';

/** A read-only animation/guide; no audio, storage or capture API is used. */
export function createPracticeGuideController({ onBack, document: doc = document }) {
  const $ = id => doc.getElementById(id);
  const renderExample = createGuideExampleRenderer(doc);
  let page=null;
  const parentActions=new Map();
  const bindParent=(id,handler)=>{parentActions.set(id,handler);$(id).addEventListener('click',handler);};
  const actions=new Map();
  const bind=(id,handler)=>{actions.set(id,handler);$('example-'+id).addEventListener('click',handler);};
  // Demo statuses are read on demand; repeated animation frames must not flood
  // screen readers. Only the real session keeps live announcements.
  $('practiceGuideExample').querySelectorAll('[role="status"], [aria-live]').forEach(el => el.setAttribute('aria-live', 'off'));
  $('example-practiceStopBtn').setAttribute('aria-label', 'Stop example');
  let guide = null, scenario = null, playing = false, position = 0, startedAt = 0, raf = null;
  let lastPainted = -1, early = false;
  const text = (id, value) => { $(id).textContent = value; };
  function paint(index) {
    index = Math.min(scenario.frames.length - 1, Math.max(0, index));
    if (index === lastPainted) return;
    lastPainted = index; renderExample(scenario.frames[index], guide);
  }
  function pause() {
    if (playing) position = Math.min(scenario.durationMs, performance.now() - startedAt);
    playing = false; if (raf !== null) cancelAnimationFrame(raf); raf = null;
    $('practiceGuidePlayBtn').setAttribute('aria-pressed', 'false');
    text('practiceGuidePlayBtn', scenario && position >= scenario.durationMs ? 'Replay example' : position ? 'Resume example' : 'Play example');
  }
  function tick(now) {
    if (!playing) return;
    position = Math.min(scenario.durationMs, now - startedAt);
    paint(Math.floor(position / FRAME_MS));
    if (position >= scenario.durationMs) { pause(); return; }
    raf = requestAnimationFrame(tick);
  }
  function selectExample(isEarly) {
    pause(); early = isEarly;
    scenario = createScenario(guide.exampleSequence ? { ...guide, sequence: guide.exampleSequence } : guide, { early });
    position = 0; lastPainted = -1; paint(scenario.posterIndex);
    $('practiceGuideExample').setAttribute('aria-label', early
      ? 'Example: listening before the beep, early trigger fails with zero shots, then an automatic countdown and a successful trigger.'
      : `${guide.title}. ${guide.stages.join(' → ')}. Synthetic example; no live microphone data.`);
    if(page)page.update({early});else{$('practiceGuideNormalBtn').setAttribute('aria-pressed',String(!early));$('practiceGuideEarlyBtn').setAttribute('aria-pressed',String(early));}
    text('practiceGuidePlayBtn', 'Play example');
  }
  function open(context) {
    pause(); guide = getPracticeGuide(context);
    const showSteps=guide.kind==='sequence'||guide.id==='reload';
    const manual={texts:{practiceGuideKind:guide.kind==='practice'?'PRACTICE GUIDE':'ORDERED SEQUENCE GUIDE',practiceGuideName:guide.title,practiceGuidePurpose:guide.purpose,practiceGuideCurrentSetup:guide.currentSetup,practiceGuideMeasures:guide.measures,practiceGuideExpect:guide.expect,practiceGuideRequires:guide.requires,practiceGuideExampleNote:`${guide.exampleConfig}. Safety already confirmed; microphone preparation time varies.`},steps:guide.steps,sequenceHidden:!showSteps,examplesHidden:guide.id!=='single',sequence:(showSteps?guide.sequence:[]).map(label=>({label,text:guideSoundTitle(label)}))};
    if(page)page.update(manual);else{
      for(const[id,value]of Object.entries(manual.texts))text(id,value);
      $('practiceGuideSteps').replaceChildren(...manual.steps.map(step=>{const li=doc.createElement('li');li.textContent=step;return li;}));
      $('practiceGuideSequence').classList.toggle('hidden',manual.sequenceHidden);
      $('practiceGuideSequence').replaceChildren(...manual.sequence.flatMap((step,index)=>{const chip=doc.createElement('span');chip.className='preset-chip';chip.dataset.sound=step.label;chip.textContent=step.text;return index?[doc.createTextNode(' → '),chip]:[chip];}));
      $('practiceGuideExamples').classList.toggle('hidden',manual.examplesHidden);
    }
    selectExample(false); return guide;
  }
  function togglePlay() {
    if (!scenario) return;
    if (playing) { pause(); return; }
    if (position >= scenario.durationMs) position = 0;
    playing = true; startedAt = performance.now() - position;
    text('practiceGuidePlayBtn', 'Pause'); $('practiceGuidePlayBtn').setAttribute('aria-pressed', 'true');
    lastPainted = -1; tick(performance.now());
  }
  $('practiceGuidePlayBtn').addEventListener('click', togglePlay);
  for (const id of ['practiceStopBtn', 'practicePauseBtn', 'practiceEndBtn', 'pauseSessionBtn', 'endSessionBtn'])
    bind(id, pause);
  for (const id of ['practiceResumeBtn', 'resumeSessionBtn']) bind(id, togglePlay);
  for (const id of ['practiceRepeatBtn', 'repeatSessionBtn']) bind(id, () => { selectExample(early); togglePlay(); });
  for (const id of ['practiceDoneBtn', 'backToDrillsBtn']) bind(id, () => { pause(); onBack(guide?.parent ?? 'drills'); });
  bind('practiceNextBtn', () => {
    const next = scenario.events.find(e => e.kind === 'user-selects-next' && e.atMs > position);
    if (next) { pause(); position = next.atMs; paint(Math.floor(position / FRAME_MS)); }
  });
  bindParent('practiceGuideNormalBtn', () => { if (guide?.id === 'single') selectExample(false); });
  bindParent('practiceGuideEarlyBtn', () => { if (guide?.id === 'single') selectExample(true); });
  for (const id of ['practiceGuideBackBtn', 'practiceGuideReturnBtn']) bindParent(id, () => { pause(); onBack(guide?.parent ?? 'drills'); });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) pause(); });
  function connectPage(mount){if(page||playing||!guide)return false;page=mount($('practiceGuideView'),{onBack:()=>parentActions.get('practiceGuideBackBtn')?.(),onAction:id=>parentActions.get(id)?.()});return true;}
  return { connectPage,open, pause, current: () => guide,connectView(mount){if(playing||!guide)return false;return renderExample.connectView(mount,id=>actions.get(id)?.());} };
}
