import { getPracticeGuide, isGuideContextCurrent, isPublicGuideContextCurrent } from '../src/practiceGuides.js';
import { createScenario } from '../src/practiceGuideExamples.js';
const context = (mode, config = {}) => ({ type: 'practice', mode, gunId: 'gun-a', routeKey: 'setup-a', config });

test.each(['single', 'repeated', 'par', 'control'])('%s has its own short manual and an engine-checked example', mode => {
  const guide = getPracticeGuide(context(mode));
  expect(guide.steps).toHaveLength(3);
  expect(guide.measures.length).toBeGreaterThan(20);
  expect(createScenario(guide).frames.at(-1)).toMatchObject({ phase: 'review', mic: 'Microphone stopped' });
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
