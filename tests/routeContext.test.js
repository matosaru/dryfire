import { isGuideContextCurrent } from '../src/practiceGuides.js';
import { resolveRouteView } from '../apps/web/src/app/routeContext.ts';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { PAGE_IDS } from '../src/pageDefinitions.js';

// The same characterization cases passed against the released main.js functions
// before moving implementation. They now exercise the extracted public seam.
function setup() {
  const state = { activeGun: { id: 7 }, practiceController: null, sessionController: null, practiceGuideController: null };
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const source = main.slice(main.indexOf('function routeFor('), main.indexOf('function switchView('));
  const routes = runInNewContext(`${source}\n({routeFor, resolveRoute})`, { ...state,
    get activeGun() { return state.activeGun; }, get practiceController() { return state.practiceController; },
    get sessionController() { return state.sessionController; }, get practiceGuideController() { return state.practiceGuideController; },
    PAGE_IDS, resolveRouteView, isGuideContextCurrent });
  const route = (view, context = null, gunId = 7) => ({ view, gunId, context });
  return { state, ...routes, route };
}

test('all ordinary routes retain the active gun and never manufacture a session context', () => {
  const s = setup();
  for (const view of PAGE_IDS.filter(id => !['practice', 'session', 'practiceGuide'].includes(id))) {
    expect(s.routeFor(view)).toEqual(s.route(view));
    expect(s.resolveRoute(s.route(view))).toEqual(s.route(view));
  }
  expect(s.resolveRoute(s.route('unknown'))).toEqual(s.route('home'));
});

test.each([null, { id: 7, needsDetails: true }])('first use and legacy incomplete guns allow only setup/library/information/settings: %p', gun => {
  const s = setup(); s.state.activeGun = gun;
  const allowed = ['gunSetup', 'guns', 'settings', 'about', 'contact'];
  for (const view of [...PAGE_IDS, 'unknown']) {
    expect(s.resolveRoute(s.route(view))).toEqual(s.route(allowed.includes(view) ? view : 'gunSetup', null, gun?.id ?? null));
  }
});

test('gun changes replace stale ordinary routes with Home and stale guides with Drills', () => {
  const s = setup();
  for (const view of PAGE_IDS) expect(s.resolveRoute(s.route(view, 'old-context', 8)))
    .toEqual(s.route(view === 'practiceGuide' ? 'drills' : 'home'));
  s.state.activeGun = { id: 9 };
  expect(s.routeFor('home')).toEqual(s.route('home', null, 9));
});

test.each(['practice', 'session'])('%s routes require a live, matching controller context', view => {
  const s = setup();
  expect(s.routeFor(view)).toEqual({ ...s.route(view), context: undefined });
  expect(s.resolveRoute(s.route(view, 'key'))).toEqual(s.route('drills'));
  s.state[`${view}Controller`] = { routeKey: () => null };
  expect(s.resolveRoute(s.route(view, 'key'))).toEqual(s.route('drills'));
  let key = 'current'; s.state[`${view}Controller`] = { routeKey: () => key };
  expect(s.routeFor(view)).toEqual(s.route(view, key));
  expect(s.resolveRoute(s.route(view, key))).toEqual(s.route(view, key));
  key = 'new';
  expect(s.resolveRoute(s.route(view, 'current'))).toEqual(s.route('drills'));
});

test.each(['practice', 'session'])('guide validates the %s owner, snapshot, gun and history context', parent => {
  const s = setup();
  expect(s.routeFor('practiceGuide')).toEqual({ ...s.route('practiceGuide'), context: undefined });
  expect(s.resolveRoute(s.route('practiceGuide', 'guide-key'))).toEqual(s.route('drills'));
  let guide = { gunId: 7, parent, sourceKey: 'source', contextKey: 'guide-key' };
  s.state.practiceGuideController = { current: () => guide };
  expect(s.resolveRoute(s.route('practiceGuide', 'guide-key'))).toEqual(s.route('drills'));
  let source = 'source', available = true;
  s.state[`${parent}Controller`] = { routeKey: () => source, guideContext: () => available ? {} : null };
  expect(s.routeFor('practiceGuide')).toEqual(s.route('practiceGuide', 'guide-key'));
  expect(s.resolveRoute(s.route('practiceGuide', 'guide-key'))).toEqual(s.route('practiceGuide', 'guide-key'));
  expect(s.resolveRoute(s.route('practiceGuide', 'stale-history'))).toEqual(s.route('drills'));
  available = false;
  expect(s.resolveRoute(s.route('practiceGuide', 'guide-key'))).toEqual(s.route('drills'));
  available = true; source = 'changed';
  expect(s.resolveRoute(s.route('practiceGuide', 'guide-key'))).toEqual(s.route('drills'));
  source = null;
  expect(s.resolveRoute(s.route('practiceGuide', 'guide-key'))).toEqual(s.route('drills'));
  source = 'source'; guide = { ...guide, gunId: 8 };
  expect(s.resolveRoute(s.route('practiceGuide', 'guide-key'))).toEqual(s.route('drills'));
  guide = null;
  expect(s.routeFor('practiceGuide')).toEqual({ ...s.route('practiceGuide'), context: undefined });
});
