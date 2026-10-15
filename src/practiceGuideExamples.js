// Design fixtures use the actual pure session engines with synthetic accepted
// detections. Hardware, classification and storage latency are not simulated.
import { createPractice, tickPractice, detectPractice, nextPractice, practiceElapsed } from './practiceSession.js';
import { createSession, tickSession, recordSessionDetection } from './drillSession.js';

export const FRAME_MS = 100;
export const WIDTH = 344;
export const HEIGHT = 244;
const READY_AT_MS = 1000; // Example preparation time; actual readiness varies.
const gun = { id: 'guide-example', name: 'Example gun', type: 'Handguns' };
const clock = monoNow => ({ monoNow, epochNow: 1800000000000 + monoNow, randomValue: monoNow <= READY_AT_MS ? .13 : .4 });
const shotOffsets = { repeated: [500, 1300, 2100], control: [500, 1300, 2100], free: [500, 2000, 4800] };
const names = { draw: 'Draw', rack: 'Rack', reload: 'Magazine', trigger: 'Trigger' };
const seconds = ms => `${(ms / 1000).toFixed(2)} s`;
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function createScenario(manual, { early = false } = {}) {
  const id = manual.id + (early ? '-early' : '');
  const sequence = manual.kind === 'sequence';
  const config = {
    repetitions: sequence && manual.sequence.length > 3 ? 1 : ['repeated', 'control'].includes(id) ? 3 : 2,
    delayMode: 'random', randomMinSeconds: 2, randomMaxSeconds: 5,
    soundAtStart: true, startSource: 'app', parSeconds: 1.5,
    durationSeconds: 6, reloadStart: manual.id === 'reload' ? manual.sequence[0] : 'rack', reloadEnd: manual.id === 'reload' ? manual.sequence[1] : 'reload',
  };
  const frames = [], events = [], fired = new Set();
  let state = null, terminalAt = null, resultAt = null, latest = null;
  let lastEventAt = -10000, lastNextAt = -10000, beepAt = -10000, posterIndex = null;
  const record = (atMs, kind, extra = {}) => events.push({ atMs, kind, ...extra });
  const apply = (next, t) => {
    if (next === state) return;
    const previous = state; state = next;
    if (state.phase === 'active' && previous?.phase === 'countdown') {
      beepAt = t; record(t, 'app-beep', { attempt: state.current?.ordinal, goAtMs: state.goAtMs });
    }
    if (state.phase === 'countdown' && previous?.phase !== 'countdown') record(t, 'countdown', { endsAtMs: state.countdownEndsAtMs });
    if (state.repetitions.length > (previous?.repetitions.length ?? 0)) {
      latest = state.repetitions.at(-1);
      record(t, 'outcome', { status: latest.status, reason: latest.reason, elapsedMs: latest.elapsedMs, intervalMs: latest.intervalMs ?? null, completed: state.completed, shots: state.shots ?? null });
      if (state.phase === 'result') resultAt = t;
    }
    if (state.phase === 'closing' && previous?.phase !== 'closing') record(t, 'finish-captured-audio');
    if (state.phase === 'review' && terminalAt === null) { terminalAt = t; record(t, 'review', { completed: state.completed, shots: state.shots ?? null }); }
  };

  for (let t = 0; t < 120000; t += FRAME_MS) {
    if (t === READY_AT_MS) {
      record(t, sequence ? 'microphone-connected' : 'microphone-input-ready');
      apply(sequence
        ? createSession({ id, gun, drill: manual.id === 'sequence-custom' ? { id: 'guide-custom', title: 'Example preset', steps: manual.sequence } : { id: manual.id.slice('sequence-'.length) }, config, ...clock(t) })
        : createPractice({ id, gun, mode: manual.id, config, ...clock(t) }), t);
    } else if (state && terminalAt === null) apply(sequence ? tickSession(state, clock(t)) : tickPractice(state, clock(t)), t);

    if (state && terminalAt === null) {
      if (!sequence && early && state.completed === 0 && state.phase === 'countdown' && t === state.countdownEndsAtMs - 500) {
        record(t, 'recognized-trigger-before-signal', { offsetMs: -500 }); lastEventAt = t;
        apply(detectPractice(state, { label: 'trigger', score: 95, detectedAtMs: t }, clock(t)), t);
      }
      if (!sequence && ['par', 'reload'].includes(id) && state.phase === 'result' && t === resultAt + 1200) {
        lastNextAt = t; record(t, 'user-selects-next'); apply(nextPractice(state, clock(t)), t);
      }
      if (state.phase === 'active') {
        const offset = t - state.goAtMs;
        let scheduled = [];
        if (sequence) scheduled = manual.sequence.map((label, i) => ({ label, at: 500 + i * 800 }));
        else if (id === 'reload') scheduled = [{ label: state.drillSteps[0], at: 400 }, { label: state.drillSteps[1], at: 1600 }];
        else if (shotOffsets[id]) scheduled = shotOffsets[id].map(at => ({ label: 'trigger', at }));
        else if (id === 'par') scheduled = state.completed === 0 ? [{ label: 'trigger', at: 600 }] : []; // Then demonstrate a miss.
        else scheduled = [{ label: 'trigger', at: state.completed === 0 ? 500 : 600 }];
        for (const event of scheduled) {
          const key = `${state.goAtMs}-${event.at}-${event.label}`;
          if (offset !== event.at || fired.has(key)) continue;
          fired.add(key); lastEventAt = t;
          record(t, 'recognized-event', { label: event.label, offsetMs: offset });
          apply(sequence
            ? recordSessionDetection(state, { label: event.label, score: 95, detectedAtMs: t }, clock(t))
            : detectPractice(state, { label: event.label, score: 95, detectedAtMs: t }, clock(t)), t);
        }
      }
    }

    const phase = state?.phase ?? 'connecting';
    let mic = 'Preparing microphone', micTone = 'amber', title = 'Preparing microphone', value = '—';
    let detail = sequence ? 'Connect microphone before countdown' : 'Waiting for incoming audio before countdown';
    let elapsedMs = 0;
    if (state) {
      mic = phase === 'review' ? 'Microphone stopped' : phase === 'closing' ? 'Finishing earlier audio' : sequence && phase === 'countdown' ? 'Mic connected · detection starts at GO' : phase === 'result' ? 'Mic on · recognition paused' : phase === 'countdown' ? 'Listening before the signal' : 'Microphone listening';
      micTone = phase === 'review' ? 'muted' : ['result', 'closing'].includes(phase) || (sequence && phase === 'countdown') ? 'amber' : 'green';
      elapsedMs = sequence ? (state.goAtMs === null ? 0 : t - state.goAtMs) : practiceElapsed(state, t);
      if (phase === 'countdown') {
        title = state.completed ? 'Next countdown · automatic' : 'Get ready';
        if (['par', 'reload'].includes(id) && state.completed) title = 'Next countdown · after Next';
        value = `${((state.countdownEndsAtMs - t) / 1000).toFixed(1)} s`;
        detail = t - lastNextAt < 500 ? 'You selected Next repetition' : 'Wait for the start signal';
      } else if (phase === 'active') {
        title = t - beepAt < 300 ? 'BEEP · timer starts' : sequence ? 'Follow the selected order' : id === 'reload' ? 'Listening for the two events' : 'Listening for trigger clicks';
        value = seconds(t - state.goAtMs);
        if (sequence) detail = `Step ${Math.min(state.current.stepIndex + 1, manual.sequence.length)} / ${manual.sequence.length}: ${names[manual.sequence[state.current.stepIndex]]}`;
        else if (id === 'reload') detail = state.current.stepTimings.length ? `${names[state.drillSteps[0]]} recognized → waiting for ${names[state.drillSteps[1]]}` : `${names[state.drillSteps[0]]} → ${names[state.drillSteps[1]]}`;
        else if (id === 'par') detail = `Par limit ${seconds(config.parSeconds * 1000)}`;
        else if (id === 'free') detail = `Example duration ${config.durationSeconds} s · continuous listening`;
        else if (['repeated', 'control'].includes(id)) detail = 'One start beep · separate recognized clicks';
        else detail = 'First recognized trigger ends this attempt';
      } else if (phase === 'result') {
        title = latest?.reason === 'early' ? 'EARLY TRIGGER · failed' : sequence ? 'Sequence completed' : 'Result · select Next repetition';
        value = latest?.reason === 'early' ? 'No shot' : seconds(latest?.elapsedMs ?? 0);
        if (id === 'reload') { title = 'Event interval · select Next'; value = seconds(latest.stepTimings[1].splitMs); }
        detail = sequence ? 'Next countdown follows the result' : latest?.reason === 'early' ? 'The next countdown starts automatically' : 'Reset when ready, then select Next';
      } else if (phase === 'closing') {
        title = 'Time limit reached'; value = seconds(id === 'free' ? config.durationSeconds * 1000 : config.parSeconds * 1000);
        detail = 'Finishing audio captured before the deadline';
      } else if (phase === 'review') {
        title = 'Practice complete'; value = id === 'free' ? `${state.shots} clicks` : `${state.completed} / ${config.repetitions}`;
        detail = id === 'free' ? `${seconds(state.elapsedMs)} active · review results` : 'Target reached · review the recorded outcomes';
      }
    }
    const last = id === 'free' && phase === 'review' ? `${state.shots} accepted clicks in ${seconds(state.elapsedMs)} active`
      : latest?.reason === 'early' ? 'Last attempt: failed before the beep · 0 shots'
      : latest?.status === 'miss' ? 'Last attempt: miss · no click within the par time'
      : latest ? (id === 'reload' ? `Last event interval: ${seconds(latest.stepTimings[1].splitMs)}`
        : ['repeated', 'control'].includes(id) && latest.intervalMs != null ? `Last click interval: ${seconds(latest.intervalMs)}`
        : `Last result: ${seconds(latest.elapsedMs)}`) : 'No result yet';
    const counter = !state ? 'Example · preparing' : id === 'free' ? `${state.shots} clicks · ${seconds(elapsedMs)} active`
      : ['repeated', 'control'].includes(id) ? `Clicks ${state.completed} / ${config.repetitions}`
      : `Attempts ${state.completed} / ${config.repetitions}${sequence ? '' : ` · Shots ${state.shots}`}`;
    frames.push({ atMs: t, phase, mic, micTone, title, value, detail, last, counter,
      pulse: t - lastEventAt < 300, failed: latest?.reason === 'early', beep: t - beepAt < 300,
      example: id === 'free' ? 'EXAMPLE · 6 S SESSION · 1× TIMING' : ['repeated', 'control'].includes(id) ? 'EXAMPLE · 3 CLICKS · 1× TIMING' : `EXAMPLE · ${config.repetitions} ATTEMPTS · 1× TIMING` });
    if (posterIndex === null && ((early && latest?.reason === 'early')
      || (id === 'single' && state?.completed === 1 && phase === 'countdown')
      || (['par', 'reload'].includes(id) && state?.completed === 1 && phase === 'result')
      || (['repeated', 'control'].includes(id) && state?.completed === 2)
      || (sequence && state?.completed === 1 && phase === 'result'))) posterIndex = frames.length - 1;
    if (terminalAt !== null && t >= terminalAt + 1200) break;
  }
  assert(terminalAt !== null, `${id}: scenario did not finish`);
  if (posterIndex === null) posterIndex = frames.length - 5;
  const beeps = events.filter(e => e.kind === 'app-beep');
  const outcomes = events.filter(e => e.kind === 'outcome');
  const countdowns = events.filter(e => e.kind === 'countdown');
  const automatic = sequence || ['single', 'single-early'].includes(id);
  assert(beeps.length === (early ? 1 : automatic || ['par', 'reload'].includes(id) ? config.repetitions : 1), `${id}: unexpected beep count`);
  assert(events.filter(e => e.kind === 'user-selects-next').length === (['par', 'reload'].includes(id) ? 1 : 0), `${id}: wrong Next behavior`);
  assert(beeps.every(e => e.atMs >= READY_AT_MS + 2400), `${id}: signal before microphone/delay`);
  assert(countdowns.every((e, i) => e.endsAtMs - e.atMs === (i === 0 ? 2400 : 3200)), `${id}: countdown does not match the example delays`);
  assert(frames.filter(f => f.atMs < READY_AT_MS).every(f => f.phase === 'connecting' && f.value === '—'), `${id}: countdown started before microphone setup`);
  assert(id === 'free' ? state.elapsedMs === 6000 && state.shots === 3 : state.completed === config.repetitions, `${id}: wrong completion`);
  if (early) {
    assert(outcomes[0].reason === 'early' && outcomes[0].shots === 0 && outcomes[0].elapsedMs === null, 'Early trigger must fail with no successful timing/shot');
    assert(state.shots === 1 && beeps[0].atMs > outcomes[0].atMs, 'Early trigger advances automatically without an initial beep');
  }
  if (id === 'par') assert(outcomes.map(e => e.status).join(',') === 'hit,miss', 'Par example must show hit and miss');
  if (id === 'single') assert(outcomes[0].elapsedMs === 500 && outcomes[0].shots === 1, 'Single must accept the first 0.50 s trigger');
  if (['repeated', 'control'].includes(id)) assert(outcomes.slice(1).every(e => e.intervalMs === 800), 'Consecutive click intervals must match 0.80 s');
  if (id === 'reload') assert(state.shots === (manual.sequence.includes('trigger') ? config.repetitions : 0) && state.repetitions.every(r => r.stepTimings[1].splitMs === 1200), 'Reload measures 1.20 s without counting handling as shots');
  return { id, config: state.config, durationMs: frames.length * FRAME_MS, readyAtMs: READY_AT_MS, frames, events, posterIndex };
}

export function createScenarios(manuals) {
  return [...manuals.map(m => createScenario(m)), createScenario(manuals.find(m => m.id === 'single'), { early: true })];
}
