import { GUIDE_MANUALS } from './practiceGuideManuals.js';
import { normalizeCustomDrill, getDrill } from './drills.js';

const labels = { draw: 'Draw from holster', rack: 'Rack slide', trigger: 'Trigger pull', reload: 'Change magazine' };

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
  const guide = { ...structuredClone(source), gunId: context.gunId, sourceKey: context.routeKey,
    parent: context.type === 'practice' ? 'practice' : 'session', contextKey: `${context.type}:${context.routeKey}` };
  if (drill) {
    guide.title = drill.title; guide.sequence = [...drill.steps];
    guide.stages = ['Microphone connected', 'Countdown and app signal', drill.steps.map(s => labels[s]).join(' → '), 'Result and next repetition'];
  }
  if (id === 'sequence-custom') {
    guide.expect = 'The displayed steps belong to this saved preset. Only recognized sounds in that order complete a repetition.';
    guide.requires = 'Learn each distinct sound shown in this preset. A sound can appear more than once.';
    guide.exampleConfig = `${drill.steps.length > 3 ? 1 : 2} example attempts · random 2–5 s delay · app beep on`;
  }
  if (id === 'reload') {
    const sequence = [config.reloadStart ?? 'rack', config.reloadEnd ?? 'reload'];
    if (sequence.some(s => !labels[s])) throw new TypeError('Choose known endpoints.');
    guide.sequence = sequence;
    guide.stages = ['Microphone ready', 'Countdown and app signal', sequence.map(s => labels[s]).join(' → '), 'Event interval and Next repetition'];
    guide.steps[0] = `Your selected endpoints are ${labels[sequence[0]]} and ${labels[sequence[1]]}. Learn both sounds.`;
    guide.steps[1] = `After the signal, complete ${labels[sequence[0]]}, then ${labels[sequence[1]]}.`;
    guide.requires = `Learn ${sequence.map(s => labels[s]).join(' and ')}. Only a selected Trigger endpoint can add a shot.`;
    if (sequence[0] === sequence[1]) {
      guide.exampleSequence = ['rack', 'reload'];
      guide.requires = 'Choose two different endpoints before starting. The illustration uses Rack slide → Change magazine.';
    }
  }
  if (context.type === 'practice' && config.startSource === 'external') {
    guide.currentSetup = 'Your setup uses a calibrated external beep: no app countdown or app beep. The illustration below demonstrates the app-signal option.';
    guide.steps = guide.steps.map(s => s.replace(/ready delay/g, 'start signal').replace(/countdown/g, 'external-cue wait'));
    if (id === 'single') {
      guide.steps[0] = 'Choose your repetition target and Calibrated external beep.';
      guide.steps[1] = 'Start and wait for the external beep before one trigger press.';
      guide.expect = 'In this external-cue setup, trigger clicks before the calibrated cue are not counted as attempts. The early-failure example below demonstrates App signal mode.';
    }
    guide.requires += ' Calibrated external-beep start needs three compatible cue examples.';
  } else if (config.soundAtStart === false) {
    guide.currentSetup = 'Your setup uses a silent visual start. Wait for the on-screen signal; the illustration demonstrates the optional app beep.';
  } else guide.currentSetup = 'App-signal example. Your chosen counts and timing stay unchanged when you return to setup.';
  return guide;
}

export function isGuideContextCurrent(guide, gunId, sourceKey) {
  return !!guide && guide.gunId === gunId && !!sourceKey && guide.sourceKey === sourceKey;
}

export function guideSoundTitle(label) { return labels[label]; }
