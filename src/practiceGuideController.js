import { getPracticeGuide, guideSoundTitle } from './practiceGuides.js';
import { createScenario, FRAME_MS, WIDTH, HEIGHT } from './practiceGuideExamples.js';
import { paintGuideFrame } from './practiceGuidePainting.js';

/** A read-only animation/guide; no audio, storage or capture API is used. */
export function createPracticeGuideController({ onBack, document: doc = document }) {
  const $ = id => doc.getElementById(id);
  const canvas = $('practiceGuideCanvas');
  const ratio = Math.max(1, Math.min(3, globalThis.devicePixelRatio || 1));
  canvas.width = WIDTH * ratio; canvas.height = HEIGHT * ratio;
  canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  let guide = null, scenario = null, playing = false, position = 0, startedAt = 0, raf = null;
  let lastPainted = -1, early = false;
  const text = (id, value) => { $(id).textContent = value; };
  function paint(index) {
    index = Math.min(scenario.frames.length - 1, Math.max(0, index));
    if (index === lastPainted) return;
    lastPainted = index; paintGuideFrame($('practiceGuideCanvas'), scenario.frames[index]);
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
    $('practiceGuideCanvas').setAttribute('aria-label', early
      ? 'Example: listening before the beep, early trigger fails with zero shots, then an automatic countdown and a successful trigger.'
      : `${guide.title}. ${guide.stages.join(' → ')}. Synthetic example; no live microphone data.`);
    $('practiceGuideNormalBtn').setAttribute('aria-pressed', String(!early));
    $('practiceGuideEarlyBtn').setAttribute('aria-pressed', String(early));
    text('practiceGuidePlayBtn', 'Play example');
  }
  function open(context) {
    pause(); guide = getPracticeGuide(context);
    text('practiceGuideKind', guide.kind === 'practice' ? 'PRACTICE GUIDE' : 'ORDERED SEQUENCE GUIDE');
    for (const [id, value] of Object.entries({ practiceGuideName: guide.title, practiceGuidePurpose: guide.purpose,
      practiceGuideCurrentSetup: guide.currentSetup, practiceGuideMeasures: guide.measures,
      practiceGuideExpect: guide.expect, practiceGuideRequires: guide.requires,
      practiceGuideExampleNote: `${guide.exampleConfig}. Safety already confirmed; microphone preparation time varies.` })) text(id, value);
    $('practiceGuideSteps').replaceChildren(...guide.steps.map(step => { const li = doc.createElement('li'); li.textContent = step; return li; }));
    const showSteps = guide.kind === 'sequence' || guide.id === 'reload';
    $('practiceGuideSequence').classList.toggle('hidden', !showSteps);
    $('practiceGuideSequence').replaceChildren(...(showSteps ? guide.sequence.flatMap((label, i) => {
      const chip = doc.createElement('span'); chip.className = 'preset-chip'; chip.dataset.sound = label; chip.textContent = guideSoundTitle(label);
      return i ? [doc.createTextNode(' → '), chip] : [chip];
    }) : []));
    $('practiceGuideExamples').classList.toggle('hidden', guide.id !== 'single');
    selectExample(false); return guide;
  }
  $('practiceGuidePlayBtn').addEventListener('click', () => {
    if (!scenario) return;
    if (playing) { pause(); return; }
    if (position >= scenario.durationMs) position = 0;
    playing = true; startedAt = performance.now() - position;
    text('practiceGuidePlayBtn', 'Pause'); $('practiceGuidePlayBtn').setAttribute('aria-pressed', 'true');
    lastPainted = -1; tick(performance.now());
  });
  $('practiceGuideNormalBtn').addEventListener('click', () => { if (guide?.id === 'single') selectExample(false); });
  $('practiceGuideEarlyBtn').addEventListener('click', () => { if (guide?.id === 'single') selectExample(true); });
  for (const id of ['practiceGuideBackBtn', 'practiceGuideReturnBtn']) $(id).addEventListener('click', () => { pause(); onBack(guide?.parent ?? 'drills'); });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) pause(); });
  return { open, pause, current: () => guide };
}
