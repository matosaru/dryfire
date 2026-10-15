import { startContinuousListening } from './audio.js';
import { recognitionFeatures, recognizeRecording, selectRecognition } from './recognition.js';
import { classify, MIN_EXAMPLES_PER_CLASS, trainingCounts } from './classifier.js';
import { compatibleCalibration, classifyExternalCue } from './calibration.js';
import { PRACTICE_MODES, practiceMode, normalizePracticeConfig, practiceLabels, continuousPractice, practiceElapsed,
  createPractice, tickPractice, detectPractice, nextPractice, pausePractice, resumePractice, endPractice,
  toPracticeRecord, practiceStatistics, PRACTICE_CUE_GUARD_MS } from './practiceSession.js';
import { getGunSetting, setGunSetting, saveSession } from './storage.js';
import { createStartCuePlayer, requestFeedbackVibration } from './feedback.js';
import { readNumberInput } from './inputLimits.js';

const $ = id => document.getElementById(id);
const node = (tag, text, className = '') => { const element = document.createElement(tag); element.textContent = text; element.className = className; return element; };
const seconds = value => Number.isFinite(value) ? `${(value / 1000).toFixed(2)} s` : '—';

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
  function details(row) {
    const card = node('details', '', 'session-result-card');
    const status = row.status === 'hit' ? 'Recognized' : row.status === 'miss' ? (row.reason === 'early' ? 'Miss · early trigger' : row.reason === 'late' ? 'Miss · late click' : 'Miss · no click') : `Partial · ${row.reason}`;
    card.append(node('summary', `${row.ordinal} · ${status} · ${seconds(row.elapsedMs)}`));
    const body = node('div', '', 'session-result-body');
    if (row.intervalMs !== null) body.append(node('p', `Interval since previous click: ${seconds(row.intervalMs)}`, 'small'));
    for (const step of row.stepTimings) body.append(node('p', `${titleFor(step.label)} · ${seconds(step.offsetMs)} · split ${seconds(step.splitMs)}`, 'small'));
    if (row.detections.length) {
      const list = node('ol', '', 'session-detection-list');
      for (const event of row.detections) list.append(node('li', `${titleFor(event.label)} · ${seconds(event.offsetMs)} · ${event.outcome} · score ${event.score}/100`));
      body.append(list);
    }
    card.append(body); return card;
  }
  function renderReview(record) {
    $('practiceReviewStatus').textContent = `Practice ${record.status}`;
    $('practiceReviewStatus').dataset.status = record.status;
    const stats = practiceStatistics(record);
    const started = record.repetitions.some(row => row.goAt !== null);
    $('practiceSummary').replaceChildren(node('p', `${record.shots} accepted shots`, 'session-summary-count'),
      node('p', `${stats.hits} recognized attempts · ${stats.misses} misses`, 'muted small'), node('p', `${record.gunName} · active ${seconds(record.elapsedMs)}`, 'muted small'),
      node('p', `${new Date(record.startedAt).toLocaleString()} · ${!started ? 'No GO signal' : record.config.startSource === 'external' ? 'External cue onset timing' : 'Scheduled GO timing'}`, 'muted small'));
    if (continuousPractice(record.practiceMode) && stats.intervalMeanMs !== null) {
      $('practiceSummary').append(node('p', `Click intervals · mean ${seconds(stats.intervalMeanMs)} · min ${seconds(stats.intervalMinMs)} · max ${seconds(stats.intervalMaxMs)} · spread ${seconds(stats.intervalSpreadMs)}`, 'muted small'));
    }
    if (record.practiceMode === 'par') $('practiceSummary').append(node('p', `Par ${record.config.parSeconds.toFixed(1)} s · onset at the deadline is in time`, 'muted small'));
    if (record.config.startSource === 'app' && record.config.soundAtStart && started) $('practiceSummary').append(node('p', 'Beep mode excluded the first 0.08 s after start. Audible speaker latency varies by device.', 'muted small'));
    $('practiceSaved').textContent = saveError ? 'Not saved. Keep this page open and retry saving.' : state && savedRevision !== state.revision ? 'Saving on this device…' : 'Saved on this device';
    $('practiceRetryBtn').classList.toggle('hidden', !saveError); $('practiceRetryBtn').disabled = saving || !!interruption;
    $('practiceResults').replaceChildren(...record.repetitions.map(details));
    if (!record.repetitions.length) $('practiceResults').append(node('p', 'No attempt completed.', 'empty-state'));
    $('practiceRepeatBtn').disabled = locked() || record.gunId !== getContext().gun?.id;
  }
  function render() {
    const record = state?.phase === 'review' ? toPracticeRecord(state) : review;
    const running = pending || state && state.phase !== 'review';
    $('practiceGuideLink').classList.toggle('hidden', !!running || !!record);
    $('practice-title').textContent = practiceMode(record?.practiceMode || mode)?.title || 'Practice';
    $('practiceConfigure').classList.toggle('hidden', !!running || !!record);
    $('practiceRun').classList.toggle('hidden', !running); $('practiceReview').classList.toggle('hidden', !!running || !record);
    $('practiceConfigFields').disabled = !!running;
    if (!running && record) {
      $('practiceSteps').replaceChildren(...record.drillSteps.map(label => node('span', titleFor(label), 'preset-chip')));
      renderReview(record); return;
    }
    if (!running) { configure(); return; }
    const elapsed = state ? practiceElapsed(state, clock()) : 0;
    const continuous = continuousPractice(mode), free = mode === 'free';
    $('practiceCompletedLabel').textContent = continuous ? 'Clicks' : 'Attempts';
    $('practiceCompleted').textContent = state?.completed ?? 0; $('practiceShots').textContent = state?.shots ?? 0;
    $('practiceRemainingLabel').textContent = free ? 'Seconds left' : 'Left';
    $('practiceRemaining').textContent = free ? Math.ceil(Math.max(0, (state?.config.durationSeconds ?? 60) - elapsed / 1000)) : state?.remaining ?? readConfig().repetitions;
    $('practiceElapsed').textContent = seconds(elapsed);
    const phase = pending ? 'connecting' : state?.phase;
    $('practiceRun').dataset.phase = phase || 'idle';
    const showInput = ['countdown', 'active', 'await-cue'].includes(phase);
    const showStop = showInput || phase === 'countdown';
    $('practiceStopBtn').classList.toggle('hidden', !showStop);
    $('practiceStopBtn').disabled = !!interruption || closing;
    $('practiceLevelPanel').classList.toggle('hidden', !showInput);
    $('practiceSignal').classList.toggle('hidden', phase === 'active' || phase === 'await-cue');
    const signal = phase === 'countdown' ? String(Math.max(0, Math.ceil((state.countdownEndsAtMs - clock()) / 1000)))
      : ({ connecting: '…', 'await-cue': 'WAIT', result: 'NEXT', paused: 'PAUSED', closing: 'TIME' }[phase] || '—');
    $('practiceSignal').textContent = signal;
    $('practiceSignal').classList.toggle('is-paused', phase === 'paused');
    const countdownText = phase === 'countdown' ? `Next signal in ${Math.max(0, (state.countdownEndsAtMs - clock()) / 1000).toFixed(1)} s. Get ready.` : '';
    $('practiceAnnouncement').textContent = ({ connecting: 'Preparing microphone. Waiting for audio input before countdown…', countdown: countdownText, active: mode === 'reload' ? 'Practice started. Follow the selected events in order.' : 'Practice started. Listening for trigger clicks.',
      'await-cue': 'Listening for your calibrated external beep.', result: mode === 'single' ? (state?.repetitions.at(-1)?.reason === 'early' ? 'Early trigger saved as a miss. Preparing the next signal automatically.' : 'Click saved. Preparing the next signal automatically.') : 'Reset when ready, then choose Next repetition.', paused: 'Microphone released. Resume starts with a fresh signal.', closing: 'Time limit reached. Finishing audio captured before the deadline.' }[phase] || '');
    $('practiceMicrophone').textContent = microphone ? '● Microphone connected' : 'Microphone inactive';
    $('practiceInputFeedback').textContent = inputFeedback;
    renderInput();
    $('practicePauseBtn').classList.toggle('hidden', phase === 'paused'); $('practicePauseBtn').disabled = pending || saving || !!interruption;
    $('practiceResumeBtn').classList.toggle('hidden', phase !== 'paused'); $('practiceResumeBtn').disabled = pending || saving || !!interruption;
    $('practiceNextBtn').classList.toggle('hidden', phase !== 'result' || mode === 'single'); $('practiceNextBtn').disabled = pending || saving || !!interruption;
    $('practiceEndBtn').classList.toggle('hidden', showStop);
    $('practiceEndBtn').disabled = !!interruption || closing;
    const latest = state?.repetitions.filter(row => row.status !== 'partial').at(-1);
    $('practiceLatest').replaceChildren(latest ? details(latest) : node('p', 'Recognized clicks and repetition outcomes appear here.', 'muted small'));
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
    if (locked() || getContext().available === false || !practiceMode(id)) return;
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
    const cards = PRACTICE_MODES.map(definition => {
      const card = node('article', '', 'preset-card');
      card.append(node('h3', definition.title), node('p', definition.description, 'muted small'));
      const button = node('button', 'Configure practice', 'button primary wide-action'); button.type = 'button';
      button.dataset.practiceMode = definition.id; button.disabled = locked();
      button.addEventListener('click', () => { if (!locked()) open(definition.id).catch(onError); }); card.append(button); return card;
    }); $('practiceCatalog').replaceChildren(...cards);
  }
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
