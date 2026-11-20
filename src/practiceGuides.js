import { GUIDE_MANUALS } from './practiceGuideManuals.js';
import { normalizeCustomDrill, getDrill } from './drills.js';
import {translate} from '../apps/web/src/localization/runtime.ts';

export const PUBLIC_GUIDE_GUN = 'public-guide';
export function isPublicGuideContextCurrent(guide, gunId) {
  return !!guide?.publicEntry && guide.gunId === (gunId ?? PUBLIC_GUIDE_GUN) && guide.sourceKey === `public:${guide.id}`;
}

const soundMessageKeys = { draw: 'draw', rack: 'rack', trigger: 'trigger', reload: 'reload' };
const localizedText = (source, field) => translate('practice-guide', `manuals.${source.id}.${field}`);
const localizedList = (source, field) => localizedText(source, field).split('\n').filter(Boolean);
const localizedManual = source => ({
  ...source,
  title: localizedText(source, 'title'),
  purpose: localizedText(source, 'purpose'),
  measures: localizedText(source, 'measures'),
  steps: localizedList(source, 'steps'),
  expect: localizedText(source, 'expect'),
  requires: localizedText(source, 'requires'),
  stages: localizedList(source, 'stages'),
  exampleConfig: localizedText(source, 'exampleConfig'),
});

/** Read-only guide snapshot. Never validates or writes the original form draft. */
export function getPracticeGuide(context) {
  if (!context?.gunId || !context.routeKey) throw new TypeError('A current gun and setup are required.');
  const config = context.config ?? {};
  let id, drill;
  if (context.type === 'practice') id = context.mode;
  else if (context.type === 'sequence') {
    drill = getDrill(context.drill?.id) ?? normalizeCustomDrill(context.drill);
    id = getDrill(drill.id) ? `sequence-${drill.id}` : 'sequence-custom';
  } else throw new TypeError('Unknown guide context.');
  const source = GUIDE_MANUALS.find(m => m.id === id);
  if (!source) throw new TypeError('Unknown practice guide.');
  const guide = { ...structuredClone(localizedManual(source)), ...(context.publicEntry ? { publicEntry: true } : {}), gunId: context.gunId, sourceKey: context.routeKey,
    parent: context.type === 'practice' ? 'practice' : 'session', contextKey: `${context.type}:${context.routeKey}` };
  if (drill) {
    const builtIn = getDrill(drill.id);
    guide.title = builtIn ? translate('public-site', `routes.${id}.heading`) : drill.title;
    guide.sequence = [...drill.steps];
  }
  if (id === 'sequence-custom') {
    guide.exampleConfig = translate('practice-guide', 'runtime.customExampleConfig', { attempts: drill.steps.length > 3 ? 1 : 2 });
  }
  if (context.type === 'practice' && config.startSource === 'external') {
    guide.currentSetup = translate('practice-guide', 'runtime.setup.externalCue');
    guide.steps = translate('practice-guide', `runtime.externalCue.${id}Steps`).split('\n').filter(Boolean);
    if (id === 'single') {
      guide.expect = translate('practice-guide', 'runtime.externalCue.singleExpect');
    }
    guide.requires += translate('practice-guide', 'runtime.externalCue.requirementSuffix');
  } else if (config.soundAtStart === false) {
    guide.currentSetup = translate('practice-guide', 'runtime.setup.silentStart');
  } else guide.currentSetup = translate('practice-guide', 'runtime.setup.appSignal');
  if (context.publicEntry) guide.currentSetup = translate('practice-guide', 'runtime.setup.publicEntry');
  return guide;
}

export function isGuideContextCurrent(guide, gunId, sourceKey) {
  return !!guide && guide.gunId === gunId && !!sourceKey && guide.sourceKey === sourceKey;
}

export function guideSoundTitle(label) {
  const key = soundMessageKeys[label];
  return key ? translate('common', `sound.${key}`) : label;
}
