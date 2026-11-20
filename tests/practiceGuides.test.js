import { getPracticeGuide, guideSoundTitle, isGuideContextCurrent, isPublicGuideContextCurrent } from '../src/practiceGuides.js';
import { GUIDE_MANUALS } from '../src/practiceGuideManuals.js';
import { createScenario } from '../src/practiceGuideExamples.js';
import {loadLocale,translate} from '../apps/web/src/localization/runtime.ts';
const context = (mode, config = {}) => ({ type: 'practice', mode, gunId: 'gun-a', routeKey: 'setup-a', config });

afterEach(async () => { await loadLocale('en'); });

test('guide source records contain structure only; localized catalogs own the manual copy', () => {
  expect(GUIDE_MANUALS).toHaveLength(9);
  expect(GUIDE_MANUALS.every(manual => Object.keys(manual).sort().join(',') === 'id,kind,sequence')).toBe(true);
  const guide = getPracticeGuide(context('single'));
  expect(guide.title).toBe(translate('practice-guide', 'manuals.single.title'));
  expect(guide.steps).toEqual(translate('practice-guide', 'manuals.single.steps').split('\n').filter(Boolean));
});

test.each(['single', 'repeated', 'par', 'control'])('%s has its own short manual and an engine-checked example', mode => {
  const guide = getPracticeGuide(context(mode));
  expect(guide.steps).toHaveLength(3);
  expect(guide.measures.length).toBeGreaterThan(20);
  expect(createScenario(guide).frames.at(-1)).toMatchObject({ phase: 'review', mic: 'Microphone stopped' });
});
test.each([
  ['de', 'single', 'Einzelner Abzugsdruck'],
  ['de', 'repeated', 'Wiederholte Abzugsdrücke'],
  ['de', 'par', 'Training mit Zeitlimit'],
  ['de', 'control', 'Abzugskontrolle'],
  ['nl', 'single', 'Een keer de trekker overhalen'],
  ['nl', 'repeated', 'Herhaald de trekker overhalen'],
  ['nl', 'par', 'Oefenen met een tijdslimiet'],
  ['nl', 'control', 'Trekkercontrole'],
])('%s %s practice guide uses translated manual content', async (locale, mode, expectedTitle) => {
  await loadLocale(locale);
  const guide = getPracticeGuide(context(mode));
  expect(guide.title).toBe(expectedTitle);
  expect(guide.steps).toHaveLength(3);
  expect(guide.steps.join(' ')).not.toMatch(/Choose repetitions|Choose the number|Set a par time|Choose a click target/);
  expect(guide.purpose).not.toMatch(/^⟦/);
  expect(guide.stages).toHaveLength(4);
});
test.each(['de', 'nl'])('%s external-cue and silent guide explanations are translated', async locale => {
  await loadLocale(locale);
  const external = getPracticeGuide(context('single', { startSource: 'external' }));
  expect(external.currentSetup).not.toMatch(/^Your setup/);
  expect(external.steps.join(' ')).not.toMatch(/Choose your|Start and wait|trigger press/);
  expect(external.expect).not.toMatch(/With this external|early-failure example/);
  expect(external.requires).not.toMatch(/Calibrated external-beep/);
  const silent = getPracticeGuide(context('single', { soundAtStart: false }));
  expect(silent.currentSetup).not.toMatch(/^Your setup/);
  expect(silent.currentSetup).not.toMatch(/^⟦/);
});
test.each([
  ['de','ZU FRÜHER ABZUG · fehlgeschlagen','BEISPIEL · 2 VERSUCHE · ZEITRAFFER 1×'],
  ['nl','TE VROEG OVERHALEN · mislukt','VOORBEELD · 2 POGINGEN · TIMING 1×'],
])('%s localizes simulated guide frames, counters and decimal timing',async(locale,early,caption)=>{
 await loadLocale(locale);const guide=getPracticeGuide(context('single')),normal=createScenario(guide),failed=createScenario(guide,{early:true});
 const sequence=getPracticeGuide({type:'sequence',gunId:'gun-a',routeKey:'setup-sequence',drill:{id:'rack-trigger',title:'Rack slide → Trigger pull',steps:['rack','trigger']}}),sequenceExample=createScenario(sequence);
 expect(sequenceExample.frames.find(frame=>frame.phase==='active'&&frame.detail.startsWith(locale==='de'?'Schritt':'Stap')).detail).toBe(`${locale==='de'?'Schritt':'Stap'} 1 / 2: ${translate('common','sound.rack')}`);
 expect(failed.frames.find(frame=>frame.failed).title).toBe(early);
 expect(normal.frames.at(-1).example).toBe(caption);
 expect(normal.frames.some(frame=>/\d[,.]\d{2} s/.test(frame.value))).toBe(true);
 expect(normal.frames.at(-1).title).not.toBe('Practice complete');
});
test.each([
  ['de', 'Ziehen → Magazin → Abzug', 'Abzugsdruck'],
  ['nl', 'Trekken → magazijn → trekker', 'Trekker overhalen'],
])('%s translates built-in sequence manuals and sound labels', async (locale, expectedTitle, expectedTrigger) => {
  await loadLocale(locale);
  const guide = getPracticeGuide({
    type: 'sequence', gunId: 'gun-a', routeKey: 'setup-a',
    drill: { id: 'draw-mag-trigger', title: 'Draw from holster → Magazine change → Trigger pull', steps: ['draw', 'reload', 'trigger'] },
  });
  expect(guide.title).toBe(expectedTitle);
  expect(guide.purpose).not.toMatch(/^⟦/);
  expect(guide.stages[2]).not.toBe('draw → reload → trigger');
  expect(guideSoundTitle('trigger')).toBe(expectedTrigger);
});
test('Single accepts a first half-second click and automatically starts another countdown', () => {
  const example = createScenario(getPracticeGuide(context('single')));
  expect(example.events.filter(e => e.kind === 'outcome')[0]).toMatchObject({ status: 'hit', elapsedMs: 500, shots: 1 });
  expect(example.events.filter(e => e.kind === 'countdown')).toHaveLength(2);
  expect(example.events.some(e => e.kind === 'user-selects-next')).toBe(false);
});
test('early Single fails without a shot or reaction time, then automatically completes the next attempt', () => {
  const example = createScenario(getPracticeGuide(context('single')), { early: true });
  expect(example.events.filter(e => e.kind === 'outcome').map(e => [e.status, e.elapsedMs, e.shots])).toEqual([['miss', null, 0], ['hit', 600, 1]]);
});
test('external-cue instructions do not promise a countdown, app beep or early-trigger failure', () => {
  const guide = getPracticeGuide(context('single', { startSource: 'external' }));
  expect(guide.currentSetup).toMatch(/external/i);
  expect(guide.currentSetup).toMatch(/no app countdown/i);
  expect(guide.expect).toMatch(/not counted/i);
  expect(guide.steps.join(' ')).not.toMatch(/countdown|ready delay/);
});
test('silent setup explanation distinguishes the visual start from the illustrated beep', () => {
  expect(getPracticeGuide(context('single', { soundAtStart: false })).currentSetup).toMatch(/visual|silent/i);
});
test('custom guide retains actual title and ordered steps without implying new custom creation', () => {
  const guide = getPracticeGuide({ type: 'sequence', gunId: 'gun-a', routeKey: 'setup-a', drill: { id: 'mine', title: '<img src=x onerror=alert(1)>', steps: ['reload', 'rack', 'trigger'] } });
  expect(guide.title).toBe('<img src=x onerror=alert(1)>');
  expect(guide.sequence).toEqual(['reload', 'rack', 'trigger']);
  expect(guide.expect).not.toContain('Rack → Trigger → Trigger');
  expect(createScenario(guide).events.filter(e => e.kind === 'recognized-event').slice(0, 3).map(e => e.label)).toEqual(guide.sequence);
});
test('a full 32-step saved preset gets a complete bounded illustration', () => {
  const guide = getPracticeGuide({ type: 'sequence', gunId: 'gun-a', routeKey: 'setup-a', drill: { id: 'long', title: 'Long preset', steps: Array(32).fill('trigger') } });
  const example = createScenario(guide);
  expect(example.events.filter(e => e.kind === 'recognized-event')).toHaveLength(32);
  expect(example.frames.at(-1).phase).toBe('review');
});
test('guide context becomes stale for another gun, setup or missing context', () => {
  const guide = getPracticeGuide(context('single'));
  expect(isGuideContextCurrent(guide, 'gun-a', 'setup-a')).toBe(true);
  expect(isGuideContextCurrent(guide, 'gun-b', 'setup-a')).toBe(false);
  expect(isGuideContextCurrent(guide, 'gun-a', 'setup-b')).toBe(false);
  expect(isGuideContextCurrent(null, 'gun-a', 'setup-a')).toBe(false);
});
test('unknown modes, invalid endpoints and missing ownership do not create guide contexts', () => {
  expect(() => getPracticeGuide(context('missing'))).toThrow();
  expect(() => getPracticeGuide({ ...context('single'), gunId: null })).toThrow();
});

test('a public manual is a read-only current snapshot without a selected gun',()=>{
 const source={...context('single'),gunId:'public-guide',routeKey:'public:single',publicEntry:true};
 const before=structuredClone(source),guide=getPracticeGuide(source);
 expect(guide.publicEntry).toBe(true);expect(guide.currentSetup).toContain('Example settings shown');expect(source).toEqual(before);
 expect(isPublicGuideContextCurrent(guide,null)).toBe(true);
 expect(isPublicGuideContextCurrent(guide,undefined)).toBe(true);
 expect(isPublicGuideContextCurrent(guide,'other')).toBe(false);
 expect(isPublicGuideContextCurrent({...guide,gunId:'gun-a'},'gun-a')).toBe(true);
 expect(isPublicGuideContextCurrent({...guide,sourceKey:'other'},null)).toBe(false);
 expect(isPublicGuideContextCurrent({...guide,publicEntry:false},null)).toBe(false);
 expect(isPublicGuideContextCurrent(null,null)).toBe(false);
});
