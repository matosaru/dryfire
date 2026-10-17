import { practiceResultDetails, renderPracticeRun, renderPracticeReview } from './sessionPresentation.js';
import { startContinuousListening } from './audio.js';
import { recognitionFeatures, recognizeRecording, selectRecognition } from './recognition.js';
import { classify, MIN_EXAMPLES_PER_CLASS, trainingCounts } from './classifier.js';
import { compatibleCalibration, classifyExternalCue } from './calibration.js';
import { practiceDefinition, normalizePracticeConfig, practiceLabels, continuousPractice,
  createPractice, tickPractice, detectPractice, nextPractice, pausePractice, resumePractice, endPractice,
  toPracticeRecord, practiceStatistics, PRACTICE_CUE_GUARD_MS } from './practiceSession.js';
import { getGunSetting, setGunSetting, saveSession } from './storage.js';
import { createStartCuePlayer, requestFeedbackVibration } from './feedback.js';
import { readNumberInput } from './inputLimits.js';

const $ = id => document.getElementById(id);
const node = (tag, text, className = '') => { const element = document.createElement(tag); element.textContent = text; element.className = className; return element; };

/** Six modes share one capture lifecycle, engine, configuration and durable review. */
export function createPracticeController({ getContext, titleFor, ensureSafe, onNavigate, onBack, onChange, onError, onStatus,
  onProcessing, vibrationEnabled, onVibration }) {
  let mode = 'single', state = null, review = null, microphone = null, cue = null, abortCapture = null;
  let pending = false, saving = false, closing = false, saveError = null, savedRevision = null;
  let operation = 0, captureToken = 0, readToken = 0, timer = null, tickQueued = false, interruption = null;
  let inputLevel = 0, inputSeen = false, inputAt = 0, inputStartedAt = 0, holdLevelUntil = 0, inputFeedback = '';
  let clock = () => 0, queue = Promise.resolve(), configQueue = Promise.resolve();
  let routeKey = null;
  const locked = () => pending || saving || closing || !!interruption || !!saveError || !!state && state.phase !== 'review';
  const times = () => ({ monoNow: clock(), epochNow: Date.now(), randomValue: Math.random() });
  const changed = () => { render(); onChange(); };
  const enqueue = action => { const task = queue.then(action); queue = task.catch(fail); return task; };

  function renderInput() {
    const now = performance.now();
    const arriving = inputSeen && now - inputAt <= 1000;
    const level = arriving ? inputLevel : 0;
    $('practiceLevelFill').style.width = `${level}%`;
    $('practiceLevelMeter').setAttribute('aria-valuenow', String(level));
    $('practiceLevelMeter').setAttribute('aria-valuetext', `${level} relative input level`);
    $('practiceLevelValue').textContent = level;
    $('practiceInputState').textContent = arriving ? (level > 0 ? 'Microphone input detected.' : 'Listening · low or quiet input.')
      : now - inputStartedAt > 1000 ? 'No audio input arriving. Check microphone permission.' : 'Waiting for audio input…';
  }
  function resetInput() {
    inputLevel = 0; inputSeen = false; inputAt = 0; holdLevelUntil = 0; inputStartedAt = performance.now();
    renderInput();
  }
  function receiveLevel(level) {
    const now = performance.now(), value = Math.max(0, Math.min(100, Math.round(level)));
    inputSeen = true; inputAt = now;
    if (value >= inputLevel || now >= holdLevelUntil) {
      inputLevel = value;
      if (value > 0) holdLevelUntil = now + 350;
    }
    renderInput();
  }

  function readConfig() {
    const defaults = normalizePracticeConfig();
    const app = $('practiceStartSource').value === 'app';
    const delayMode = $('practiceDelayMode').value;
    const number = (id, key, used = true) => {
      if (!used) return defaults[key];
      const text = $(id).value.trim();
      if (!text) throw new TypeError('Complete the visible practice settings.');
      return readNumberInput($(id));
    };
    return normalizePracticeConfig({
      repetitions: number('practiceRepetitions', 'repetitions', mode !== 'free'),
      durationSeconds: number('practiceDuration', 'durationSeconds', mode === 'free'),
      parSeconds: number('practicePar', 'parSeconds', mode === 'par'),
      delayMode, fixedDelaySeconds: number('practiceFixedDelay', 'fixedDelaySeconds', app && delayMode === 'fixed'),
      randomMinSeconds: number('practiceMinDelay', 'randomMinSeconds', app && delayMode === 'random'),
      randomMaxSeconds: number('practiceMaxDelay', 'randomMaxSeconds', app && delayMode === 'random'),
      startSource: $('practiceStartSource').value, soundAtStart: $('practiceStartSound').checked,
      reloadStart: mode === 'reload' ? $('practiceReloadStart').value : defaults.reloadStart,
      reloadEnd: mode === 'reload' ? $('practiceReloadEnd').value : defaults.reloadEnd,
    });
  }
  function fillConfig(config) {
    const value = normalizePracticeConfig(config);
    for (const [id, key] of [['practiceRepetitions','repetitions'],['practiceDuration','durationSeconds'],['practicePar','parSeconds'],
      ['practiceDelayMode','delayMode'],['practiceFixedDelay','fixedDelaySeconds'],['practiceMinDelay','randomMinSeconds'],['practiceMaxDelay','randomMaxSeconds'],
      ['practiceStartSource','startSource'],['practiceReloadStart','reloadStart'],['practiceReloadEnd','reloadEnd']]) $(id).value = value[key];
    $('practiceStartSound').checked = value.soundAtStart;
  }
  function configure() {
    const external = $('practiceStartSource').value === 'external';
    const visibility = { practiceCountRow: mode !== 'free', practiceDurationRow: mode === 'free', practiceParRow: mode === 'par',
      practiceReloadFields: mode === 'reload', practiceAppTiming: !external,
      practiceFixedRow: !external && $('practiceDelayMode').value === 'fixed', practiceRandomFields: !external && $('practiceDelayMode').value === 'random' };
    for (const [id, visible] of Object.entries(visibility)) {
      $(id).classList.toggle('hidden', !visible);
      $(id).querySelectorAll('input, select').forEach(input => { input.disabled = !visible; });
    }
    $('practiceCountLabel').textContent = continuousPractice(mode) ? 'Click target' : 'Repetitions';
    const context = getContext();
    let message = '', config;
    try { config = readConfig(); } catch (error) { message = error.message; }
    const required = practiceLabels(mode, config || normalizePracticeConfig());
    const counts = trainingCounts(context.examples);
    const missing = required.filter(label => counts[label] < MIN_EXAMPLES_PER_CLASS);
    const missingCue = external && compatibleCalibration(context.calibration || []).filter(row => row.kind === 'cue').length < MIN_EXAMPLES_PER_CLASS;
    if (missing.length) message = `Learn 3 compatible examples of ${missing.map(titleFor).join(', ')}. Other sounds are optional.`;
    else if (missingCue) message = 'Learn 3 external-beep examples under Improve recognition in Learn.';
    else if (!message) message = !$('safetyAck').checked ? 'Sounds ready. Start opens safety confirmation.' : 'Required sounds ready. Start when you are ready.';
    $('practiceReadiness').textContent = message;
    $('practiceLearnBtn').classList.toggle('hidden', !missing.length && !missingCue);
    $('practiceStartBtn').disabled = locked() || context.available === false || missing.length > 0 || missingCue || !config || !context.gun || context.gun.needsDetails;
    $('practiceCueNote').textContent = external ? 'Waiting for your calibrated beep starts the acoustic timer. The app does not play a second cue.'
      : $('practiceStartSound').checked ? `Microphone ready before countdown. ${mode === 'single' ? 'A trigger before the beep fails the attempt. ' : ''}Set your device volume for the start beep. The first 0.08 s after GO is excluded to reject the cue.` : 'Microphone ready before countdown. Silent start uses the on-screen signal; Single triggers before it fail the attempt.';
    $('practiceSteps').replaceChildren(...required.map(label => node('span', titleFor(label), 'preset-chip')));
  }
  const details = row => practiceResultDetails(row, { node, titleFor });
  const renderReview = record => renderPracticeReview(record, { $, node, state, savedRevision, saveError, saving, interruption, locked, getContext, details });
  function render() {
    const record = state?.phase === 'review' ? toPracticeRecord(state) : review;
    const running = pending || state && state.phase !== 'review';
    $('practiceGuideLink').classList.toggle('hidden', !!running || !!record);
    $('practice-title').textContent = practiceDefinition(record?.practiceMode || mode)?.title || 'Practice';
    $('practiceConfigure').classList.toggle('hidden', !!running || !!record);
    $('practiceRun').classList.toggle('hidden', !running); $('practiceReview').classList.toggle('hidden', !!running || !record);
    $('practiceConfigFields').disabled = !!running;
    if (!running && record) {
      $('practiceSteps').replaceChildren(...record.drillSteps.map(label => node('span', titleFor(label), 'preset-chip')));
      renderReview(record); return;
    }
    if (!running) { configure(); return; }
    renderPracticeRun({ $, state, mode, pending, clock, microphone, readConfig, interruption, closing, saving, inputFeedback, renderInput, details, node });
  }
  async function persist() {
    if (!state) return;
    const record = toPracticeRecord(state); saving = true; changed();
    try { await saveSession(record, record.gunId); savedRevision = record.revision; saveError = null; }
    catch (error) { saveError = error; throw error; }
    finally { saving = false; changed(); }
  }
  function vibrate(kind) { if (vibrationEnabled()) onVibration(requestFeedbackVibration(kind)); }
  function stopTimer() { clearInterval(timer); timer = null; }
  async function stopMicrophone() {
    captureToken++; abortCapture?.abort(); abortCapture = null;
    resetInput();
    const old = microphone; microphone = null; await old?.stop();
  }
  async function release() { stopTimer(); await stopMicrophone(); const old = cue; cue = null; await old?.close(); }
  async function fail(error) {
    operation++; pending = false;
    const writeFailed = !!saveError;
    if (state && state.phase !== 'review') state = endPractice(state, { ...times(), reason: 'storage-or-capture-error', interrupted: true });
    if (state && !writeFailed) { try { await persist(); } catch { /* Review retains the unsaved snapshot for Retry. */ } }
    if (!state) saveError = null;
    await release(); closing = false; changed();
    if (saveError) onNavigate('practice');
    onError(error);
  }
  async function apply(next) {
    if (next === state) return;
    const before = state; state = next;
    if (state.phase === 'review') closing = true;
    if (['countdown', 'await-cue'].includes(state.phase) && before?.phase !== state.phase) microphone?.armDetection({ guardMs: 0 });
    else if (state.phase === 'active' && !['active', 'closing'].includes(before?.phase)) {
      inputFeedback = '';
      if (state.config.startSource === 'app') {
        const guardMs = state.config.soundAtStart ? PRACTICE_CUE_GUARD_MS : 0;
        if (before?.phase === 'countdown') microphone?.suppressDetection({ guardMs });
        else microphone?.armDetection({ guardMs });
        render();
        if (state.config.soundAtStart && !cue?.play()) onError(new Error('Start beep unavailable. STOP and the microphone indicator mark the start.'));
      }
      vibrate('go');
    } else if (!['countdown', 'active', 'closing', 'await-cue'].includes(state.phase)) microphone?.disarmDetection();
    changed(); await persist();
    if (state.completed > (before?.completed ?? 0)) vibrate('completion');
    if (state.phase === 'review') { await release(); closing = false; changed(); onStatus('Practice saved'); }
  }
  function startTimer() {
    stopTimer(); timer = setInterval(() => {
      if (tickQueued || pending || !state || ['paused', 'review'].includes(state.phase) || state.phase === 'result' && mode !== 'single') return;
      tickQueued = true;
      enqueue(async () => { if (state && !pending) await apply(tickPractice(state, times())); render(); })
        .catch(() => {}).finally(() => { tickQueued = false; });
    }, 80);
  }
  async function connect(context, token) {
    const capture = ++captureToken; abortCapture = new AbortController();
    const session = await startContinuousListening({ sensitivity: context.sensitivity, audioPreferences: context.audioPreferences, onProcessing,
      onLevel: level => { if (capture === captureToken) receiveLevel(level); },
      signal: abortCapture.signal, detectionEnabled: false,
      onState: status => { if (capture === captureToken) onStatus(status); },
      onError: error => { if (capture === captureToken) interrupt('microphone-failure').then(() => onError(error)).catch(onError); },
      onEvent: (pcm, sampleRate, timing) => {
        enqueue(async () => {
          if (capture !== captureToken || pending || !state || !['countdown', 'active', 'closing', 'await-cue'].includes(state.phase)) return;
          let prediction;
          try {
            if (state.phase === 'await-cue') {
              const cueResult = selectRecognition(recognitionFeatures(pcm, sampleRate).map(features => classifyExternalCue(classify, context.examples, context.calibration, features)));
              prediction = { label: cueResult?.label ? 'cue' : 'unknown', score: cueResult?.score || 0 };
            } else prediction = recognizeRecording(context.examples, pcm, sampleRate, { enabledLabels: state.drillSteps, negativeExamples: compatibleCalibration(context.calibration) });
          } catch { inputFeedback = 'Sound heard, but too quiet or unclear to match. Check your samples in Learn.'; changed(); return; }
          if (!prediction) return;
          inputFeedback = prediction.label ? (prediction.label === 'cue' ? 'Start beep recognized.' : `${titleFor(prediction.label)} recognized.`)
            : prediction.rejectedNegative ? 'Sound heard and excluded by learned profiles. Check Trigger and reset samples in Learn.'
              : 'Sound heard, but no reliable match. Add clear samples in Learn.';
          const next = detectPractice(state, { label: prediction.label, score: prediction.score,
            detectedAtMs: Number.isFinite(timing?.onsetMs) ? timing.onsetMs : clock() }, times());
          if (next !== state && next.repetitions.at(-1)?.reason === 'early') inputFeedback = 'Early trigger · failed attempt. Wait for the next signal.';
          await apply(next);
        }).catch(() => {});
      },
    });
    if (token !== operation || capture !== captureToken) { await session.stop(); return null; }
    microphone = session; clock = session.nowMs;
    await session.waitForInput();
    if (token !== operation || capture !== captureToken) { await session.stop(); return null; }
    return session;
  }
  async function start(resuming = false) {
    if (pending || saving || interruption || closing || saveError || (locked() && !resuming) || !ensureSafe(() => start(resuming))) return;
    const context = structuredClone(getContext()), config = resuming ? state.config : readConfig();
    if (context.available === false) return;
    const counts = trainingCounts(context.examples);
    if (!context.gun || practiceLabels(mode, config).some(label => counts[label] < 3) ||
        (config.startSource === 'external' && context.calibration.filter(row => row.kind === 'cue').length < 3)) { configure(); return; }
    const token = ++operation; pending = true; resetInput(); inputFeedback = ''; changed();
    cue = createStartCuePlayer();
    const preparing = config.startSource === 'app' && config.soundAtStart ? cue.prepare() : Promise.resolve(true);
    try {
      await configQueue;
      if (!await preparing && token === operation) onError(new Error('Start beep unavailable. STOP and the microphone indicator mark the start.'));
      if (token !== operation || !await connect(context, token) || token !== operation) return;
      pending = false;
      startTimer();
      await enqueue(async () => {
        if (token !== operation) return;
        await apply(resuming ? resumePractice(state, times()) : createPractice({ id: crypto.randomUUID(), gun: context.gun, mode, config, ...times() }));
      });
    } catch (error) { if (token === operation) await fail(error); }
    finally { if (token === operation) { pending = false; changed(); } }
  }
  async function pause() {
    if (!state || pending || saving || closing || interruption) return;
    const token = ++operation; pending = true; stopTimer(); changed();
    const capturedTimes = times();
    try { await stopMicrophone(); await enqueue(() => apply(pausePractice(state, capturedTimes))); const old = cue; cue = null; await old?.close(); }
    finally { if (token === operation) { pending = false; changed(); } }
  }
  async function next() {
    if (pending || saving || closing || interruption || saveError || state?.phase !== 'result' || !ensureSafe(() => next())) return;
    const token = ++operation; pending = true; changed();
    const preparing = state.config.soundAtStart && state.config.startSource === 'app' ? cue?.prepare() : Promise.resolve(true);
    try {
      await enqueue(async () => {
        const ready = await preparing;
        if (token !== operation || state?.phase !== 'result') return;
        if (!ready) onError(new Error('Start beep unavailable. STOP and the microphone indicator mark the start.'));
        await apply(nextPractice(state, times()));
      });
      if (token === operation) startTimer();
    } catch (error) { if (token === operation) onError(error); }
    finally { if (token === operation) { pending = false; changed(); } }
  }
  function interrupt(reason = 'ended') {
    if (interruption) return interruption;
    if (!pending && (!state || state.phase === 'review')) return Promise.resolve();
    ++operation; pending = true; stopTimer(); const capturedTimes = times();
    const task = (async () => {
      await stopMicrophone();
      await enqueue(async () => { if (state && state.phase !== 'review') await apply(endPractice(state, { ...capturedTimes, reason, interrupted: reason !== 'ended' })); });
      const old = cue; cue = null; await old?.close();
    })();
    interruption = task.finally(() => { interruption = null; pending = false; changed(); }); changed(); return interruption;
  }
  async function open(id, config = null) {
    if (locked() || getContext().available === false || !practiceDefinition(id)) return;
    const token = ++readToken, owner = getContext().gun?.id;
    await configQueue; const saved = await getGunSetting('practiceConfig', {}, owner);
    if (token !== readToken || owner !== getContext().gun?.id || locked() || getContext().available === false) return;
    routeKey = crypto.randomUUID(); mode = id; state = null; review = null; saveError = null; savedRevision = null;
    try { fillConfig(config || saved[id] || {}); } catch { fillConfig({}); }
    changed(); onNavigate('practice'); $('practice-title').setAttribute('tabindex', '-1'); $('practice-title').focus();
  }
  function showRecord(record) {
    if (locked() || record.gunId !== getContext().gun?.id || record.kind !== 'practice') return;
    routeKey = crypto.randomUUID(); mode = record.practiceMode; state = null; review = structuredClone(record); saveError = null; savedRevision = null;
    fillConfig(record.config); changed(); onNavigate('practice');
  }
  function renderCatalog() {
    for (const button of $('practiceCatalog').querySelectorAll('[data-practice-mode]')) button.disabled = locked();
  }
  // The cards are compiled from the typed component. Bind once to their stable
  // container; refreshing disabled state must never replace nodes/listeners.
  $('practiceCatalog').addEventListener('click', event => {
    const button = event.target.closest?.('button[data-practice-mode]');
    if (button && !button.disabled && !locked()) open(button.dataset.practiceMode).catch(onError);
  });
  $('practiceConfigForm').addEventListener('submit', event => { event.preventDefault(); start().catch(onError); });
  $('practiceConfigForm').addEventListener('input', configure);
  $('practiceConfigForm').addEventListener('change', () => {
    configure(); if (locked() || !getContext().gun) return;
    try {
      const config = readConfig(), owner = getContext().gun.id, id = mode;
      configQueue = configQueue.then(async () => { const previous = await getGunSetting('practiceConfig', {}, owner); await setGunSetting('practiceConfig', { ...previous, [id]: config }, owner); }).catch(onError);
    } catch { /* Keep invalid drafts editable. */ }
  });
  $('practicePauseBtn').addEventListener('click', () => pause().catch(onError));
  $('practiceResumeBtn').addEventListener('click', () => start(true).catch(onError));
  $('practiceNextBtn').addEventListener('click', () => next().catch(onError));
  $('practiceEndBtn').addEventListener('click', () => interrupt().catch(onError));
  $('practiceStopBtn').addEventListener('click', () => interrupt().catch(onError));
  $('practiceBackBtn').addEventListener('click', () => onBack());
  $('practiceDoneBtn').addEventListener('click', () => { if (!locked()) onNavigate('drills'); });
  $('practiceLearnBtn').addEventListener('click', () => onNavigate('learn'));
  $('practiceRepeatBtn').addEventListener('click', () => { const record = state ? toPracticeRecord(state) : review; if (record) open(record.practiceMode, record.config).catch(onError); });
  $('practiceRetryBtn').addEventListener('click', () => { enqueue(persist).then(changed).catch(onError); });
  $('safetyAck').addEventListener('change', () => { if (!state && !review) configure(); });
  function guideContext() {
    if (!routeKey || locked() || state || review) return null;
    return { type: 'practice', gunId: getContext().gun?.id, routeKey, mode,
      config: { reloadStart: $('practiceReloadStart').value, reloadEnd: $('practiceReloadEnd').value,
        startSource: $('practiceStartSource').value, soundAtStart: $('practiceStartSound').checked } };
  }
  return { open, showRecord, guideContext, interrupt, locked, routeKey: () => routeKey, hasUnsavedResults: () => !!saveError, renderCatalog, refresh: render, flush: () => Promise.all([configQueue, queue]),
    reset() { if (!locked()) { readToken++; routeKey = null; state = null; review = null; saveError = null; savedRevision = null; } } };
}
