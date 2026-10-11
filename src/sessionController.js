import { startContinuousListening } from './audio.js';
import { recognizeRecording } from './recognition.js';
import { classify, labels, MIN_EXAMPLES_PER_CLASS, trainingCounts } from './classifier.js';
import {
  DEFAULT_SESSION_CONFIG, normalizeSessionConfig, createSession, tickSession,
  recordSessionDetection, pauseSession, resumeSession, endSession, toSessionRecord,
} from './drillSession.js';
import { getGunSetting, setGunSetting, saveSession, getSessions } from './storage.js';
import { createStartCuePlayer, requestFeedbackVibration } from './feedback.js';

const $ = selector => document.querySelector(selector);
const node = (tag, text, className = '') => {
  const item = document.createElement(tag);
  item.textContent = text;
  item.className = className;
  return item;
};
const seconds = ms => Number.isFinite(ms) ? `${(ms / 1000).toFixed(2)} s` : '—';

/** Dedicated timed sessions; free listening retains its own capture lifecycle. */
export function createSessionController({ getContext, titleFor, ensureSafe, onNavigate,
  onChange, onError, onStatus, onProcessing, vibrationEnabled, onVibration, onPracticeRecord }) {
  let selection = null;
  let state = null;
  let review = null;
  let microphone = null;
  let abortCapture = null;
  let captureToken = 0;
  let pending = false;
  let timer = null;
  let tickQueued = false;
  let queue = Promise.resolve();
  let configQueue = Promise.resolve();
  let clock = () => 0;
  let cue = null;
  let operation = 0;
  let interruption = null;
  let finishing = false;
  let saving = false;
  let savedRevision = null;
  let saveError = null;
  let readToken = 0;
  let lastAnnouncement = '';

  const locked = () => pending || saving || finishing || !!interruption || !!state && state.phase !== 'review';
  const times = () => ({ monoNow: clock(), epochNow: Date.now(), randomValue: Math.random() });
  const changed = () => { render(); onChange(); };
  const enqueue = action => {
    const task = queue.then(action);
    queue = task.catch(error => fail(error));
    return task;
  };

  function readConfig() {
    const numeric = selector => {
      const value = $(selector).value.trim();
      if (!value) throw new TypeError('Enter the repetition count and valid start delays.');
      return Number(value);
    };
    return normalizeSessionConfig({
      repetitions: numeric('#sessionRepetitions'),
      delayMode: $('#sessionDelayMode').value,
      fixedDelaySeconds: numeric('#sessionFixedDelay'),
      randomMinSeconds: numeric('#sessionMinDelay'),
      randomMaxSeconds: numeric('#sessionMaxDelay'),
      soundAtStart: $('#sessionStartSound').checked,
    });
  }

  function fillConfig(config) {
    const value = normalizeSessionConfig(config);
    $('#sessionRepetitions').value = value.repetitions;
    $('#sessionDelayMode').value = value.delayMode;
    $('#sessionFixedDelay').value = value.fixedDelaySeconds;
    $('#sessionMinDelay').value = value.randomMinSeconds;
    $('#sessionMaxDelay').value = value.randomMaxSeconds;
    $('#sessionStartSound').checked = value.soundAtStart;
  }

  function updateReadiness() {
    if (!selection) return;
    const context = getContext();
    const counts = trainingCounts(context.examples);
    const missing = [...new Set(selection.steps)].filter(label => counts[label] < MIN_EXAMPLES_PER_CLASS);
    let invalid = '';
    try { readConfig(); } catch (error) { invalid = error.message; }
    $('#sessionReadiness').textContent = missing.length
      ? `Train at least ${MIN_EXAMPLES_PER_CLASS} examples of ${missing.map(titleFor).join(', ')} for this gun.`
      : invalid || (!$('#safetyAck').checked ? 'Confirm the safety check above before starting.' : 'Sounds trained and safety confirmed. Ready to start.');
    $('#sessionLearnBtn').classList.toggle('hidden', !missing.length);
    $('#sessionStartBtn').disabled = pending || locked() || missing.length > 0 || !!invalid || !$('#safetyAck').checked || !context.gun || context.gun.needsDetails;
    const random = $('#sessionDelayMode').value === 'random';
    $('#fixedDelayFields').classList.toggle('hidden', random);
    $('#randomDelayFields').classList.toggle('hidden', !random);
    $('#sessionCueGuardNote').classList.toggle('hidden', !$('#sessionStartSound').checked);
  }

  function renderSequence(record) {
    const steps = record?.drillSteps || selection?.steps || [];
    const host = $('#sessionSteps');
    host.replaceChildren();
    steps.forEach((label, index) => {
      const item = node('li', titleFor(label), 'drill-step');
      if (state?.phase === 'active') {
        if (index < state.current.stepIndex) item.classList.add('done');
        else if (index === state.current.stepIndex) item.classList.add('current');
      }
      host.append(item);
    });
    $('#sessionPresetName').textContent = `${steps.length} sound action${steps.length === 1 ? '' : 's'} · ${record ? 'Saved session' : 'Session setup'}`;
  }

  function resultDetails(row) {
    const details = node('details', '', 'session-result-card');
    const outcome = row.status === 'completed' ? 'Completed' : `Partial · ${row.reason || 'interrupted'}`;
    details.append(node('summary', `Repetition ${row.ordinal} · ${outcome} · ${seconds(row.elapsedMs)}`));
    const body = node('div', '', 'session-result-body');
    body.append(node('p', `${row.unknown} unknown · ${row.incorrect} out of order`, 'muted small'));
    for (const step of row.stepTimings) {
      body.append(node('p', `${titleFor(step.label)}: ${seconds(step.offsetMs)} from GO · split ${seconds(step.splitMs)}`, 'small'));
    }
    if (row.detections.length) {
      const list = node('ol', '', 'session-detection-list');
      for (const detection of row.detections) {
        list.append(node('li', `${titleFor(detection.label)} · ${seconds(detection.offsetMs)} · ${detection.outcome} · score ${detection.score}/100`));
      }
      body.append(list);
    }
    details.append(body);
    return details;
  }

  function renderReview(record) {
    $('#sessionReviewStatus').dataset.status = record.status;
    $('#sessionReviewStatus').textContent = record.status === 'completed' ? 'Session completed' : `Session ${record.status}`;
    const summary = $('#sessionReviewSummary');
    summary.replaceChildren(node('p', `${record.completed} / ${record.config.repetitions}`, 'session-summary-count'),
      node('p', `${record.completed} completed · ${record.remaining} left`, 'muted small'),
      node('p', `${record.gunName} · ${new Date(record.startedAt).toLocaleString()}`, 'muted small'));
    const host = $('#sessionResultList');
    host.replaceChildren();
    if (!record.repetitions.length) host.append(node('p', 'No repetition was completed before this session ended.', 'empty-state'));
    for (const row of record.repetitions) host.append(resultDetails(row));
    const durable = !state || savedRevision === state.revision;
    $('#sessionReview .session-saved-note').textContent = saveError
      ? 'Results are not saved. Keep this page open and retry saving.'
      : durable ? 'Saved on this device' : 'Saving results on this device…';
    retrySaveButton.classList.toggle('hidden', !saveError);
    retrySaveButton.disabled = saving || pending;
    $('#repeatSessionBtn').disabled = locked() || !!saveError || getContext().gun?.id !== record.gunId;
  }

  function announce(text) {
    if (text !== lastAnnouncement) {
      $('#sessionAnnouncement').textContent = text;
      lastAnnouncement = text;
    }
  }

  function render() {
    const record = state?.phase === 'review' ? toSessionRecord(state) : review;
    const running = pending || !!state && state.phase !== 'review';
    $('#sessionConfigure').classList.toggle('hidden', running || !!record);
    $('#sessionRun').classList.toggle('hidden', !running);
    $('#sessionReview').classList.toggle('hidden', running || !record);
    $('#sessionConfigFields').disabled = running;
    renderSequence(record || state);
    if (record && !running) { renderReview(record); return; }
    updateReadiness();
    if (!running) return;
    const config = state?.config || readConfig();
    $('#sessionCompletedCount').textContent = state?.completed ?? 0;
    $('#sessionLeftCount').textContent = state?.remaining ?? config.repetitions;
    $('#sessionProgressMeter').max = config.repetitions;
    $('#sessionProgressMeter').value = state?.completed ?? 0;
    $('#sessionCountdown').classList.toggle('is-go', state?.phase === 'active' && !pending);
    $('#sessionCountdown').classList.toggle('is-paused', state?.phase === 'paused');
    $('#sessionCountdown').classList.toggle('is-connecting', pending);
    $('#sessionMicrophoneStatus').textContent = microphone ? '● Microphone active' : pending ? 'Connecting microphone…' : 'Microphone inactive';
    $('#sessionMicrophoneStatus').classList.toggle('is-live', !!microphone);
    $('#pauseSessionBtn').classList.toggle('hidden', state?.phase === 'paused');
    $('#pauseSessionBtn').disabled = pending || !state || state.completed === config.repetitions;
    $('#resumeSessionBtn').classList.toggle('hidden', state?.phase !== 'paused');
    $('#resumeSessionBtn').disabled = pending;
    $('#endSessionBtn').disabled = false;
    if (pending) { $('#sessionCountdown').textContent = 'Connecting'; announce('Waiting for microphone permission.'); }
    else if (state.phase === 'countdown') {
      const remaining = Math.max(0, state.countdownEndsAtMs - clock());
      $('#sessionCountdown').textContent = (remaining / 1000).toFixed(1);
      announce(`Get ready · ${Math.ceil(remaining / 1000)} seconds.`);
    } else if (state.phase === 'active') {
      $('#sessionCountdown').textContent = 'GO';
      announce(`GO · awaiting ${titleFor(state.drillSteps[state.current.stepIndex])}.`);
    } else if (state.phase === 'paused') { $('#sessionCountdown').textContent = 'Paused'; announce('Paused. Resume starts a fresh countdown.'); }
    else {
      const durable = savedRevision === state.revision;
      $('#sessionCountdown').textContent = durable ? 'Saved' : 'Saving';
      announce(durable ? 'Repetition completed and saved.' : 'Repetition detected · saving results.');
    }
    const latest = state?.repetitions.filter(row => row.status === 'completed').at(-1);
    $('#sessionLatestResult').replaceChildren(latest ? resultDetails(latest) : node('p', 'Your completed repetition will appear here.', 'muted small'));
  }

  async function persist() {
    if (!state) return;
    const snapshot = toSessionRecord(state);
    saving = true;
    render();
    try {
      await saveSession(snapshot, snapshot.gunId);
      if (state?.id === snapshot.id) { savedRevision = snapshot.revision; saveError = null; }
    } catch (error) { saveError = error; throw error; }
    finally { saving = false; render(); }
  }

  function vibrate(kind) {
    if (vibrationEnabled()) onVibration(requestFeedbackVibration(kind));
  }

  function stopTimer() { clearInterval(timer); timer = null; }
  async function stopMicrophone() {
    captureToken += 1;
    abortCapture?.abort();
    abortCapture = null;
    const previous = microphone;
    microphone = null;
    if (previous) await previous.stop();
  }

  async function release() {
    stopTimer();
    await stopMicrophone();
    if (cue) { await cue.close(); cue = null; }
  }

  async function fail(error) {
    operation += 1;
    pending = false;
    if (state && state.phase !== 'review') {
      state = endSession(state, { ...times(), reason: 'storage-or-capture-error', interrupted: true });
      try { await persist(); } catch { /* Keep the current result in memory for review. */ }
    }
    await release();
    finishing = false;
    changed();
    onError(error);
  }

  async function apply(next) {
    if (next === state) return;
    const before = state;
    state = next;
    const terminalTransition = next.phase === 'review';
    if (terminalTransition) finishing = true;
    if (state.phase === 'active' && before?.phase !== 'active') {
      microphone?.armDetection({ guardMs: state.config.soundAtStart ? 300 : 0 });
      render(); // Display GO when the cue is scheduled, before durable writes.
      if (state.config.soundAtStart && !cue?.play()) onError(new Error('Start beep unavailable. Visual GO remains active.'));
      vibrate('go');
    } else if (state.phase !== 'active') microphone?.disarmDetection();
    changed();
    await persist(); // A result cannot advance to the next countdown before saving.
    if (next.completed > (before?.completed ?? 0)) vibrate('completion');
    if (terminalTransition) { await release(); finishing = false; changed(); onStatus('Session saved'); }
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (tickQueued || pending || !state || ['paused', 'review'].includes(state.phase)) return;
      tickQueued = true;
      enqueue(async () => { if (state && !pending) await apply(tickSession(state, times())); render(); })
        .catch(() => {}).finally(() => { tickQueued = false; });
    }, 80);
  }

  async function connect(context, token) {
    const capture = ++captureToken;
    abortCapture = new AbortController();
    const session = await startContinuousListening({
      sensitivity: context.sensitivity,
      audioPreferences: { ...context.audioPreferences },
      onProcessing,
      signal: abortCapture.signal,
      detectionEnabled: false,
      onState: status => { if (capture === captureToken) onStatus(status); },
      onError: error => { if (capture === captureToken) void interrupt('microphone-failure').then(() => onError(error)); },
      onEvent: (pcm, sampleRate, timing) => {
        const detectedAtMs = timing?.onsetMs;
        enqueue(async () => {
          if (capture !== captureToken || pending || state?.phase !== 'active') return;
          let prediction;
          try { prediction = recognizeRecording(context.examples, pcm, sampleRate, { enabledLabels: [...new Set(state.drillSteps)], negativeExamples: context.calibration || [] }); } catch { return; }
          if (!prediction) throw new Error('No compatible learned sound model is available.');
          await apply(recordSessionDetection(state, { label: prediction.label, score: prediction.score,
            detectedAtMs: Number.isFinite(detectedAtMs) ? detectedAtMs : clock() }, times()));
        }).catch(() => {});
      },
    });
    if (token !== operation || capture !== captureToken) { await session.stop(); return null; }
    microphone = session;
    clock = session.nowMs;
    return session;
  }

  async function start(resuming = false) {
    if (pending || finishing || saving || interruption || (locked() && !resuming) || !ensureSafe()) return;
    const context = getContext();
    if (!context.gun || !selection.steps.every(label => trainingCounts(context.examples)[label] >= MIN_EXAMPLES_PER_CLASS)) { updateReadiness(); return; }
    const config = resuming ? state.config : readConfig();
    const snapshot = { ...context, gun: { ...context.gun }, examples: structuredClone(context.examples), audioPreferences: { ...context.audioPreferences } };
    const token = ++operation;
    pending = true;
    review = null;
    if (!resuming) { state = null; savedRevision = null; saveError = null; }
    cue = createStartCuePlayer();
    const cueReady = config.soundAtStart ? cue.prepare() : Promise.resolve(true); // Explicit Start/Resume gesture.
    changed();
    try {
      if (!await cueReady && token === operation) onError(new Error('Start beep unavailable. The session can still use visual GO.'));
      if (token !== operation) return;
      await configQueue;
      if (token !== operation) return;
      if (!await connect(snapshot, token)) return;
      if (resuming) state = resumeSession(state, times());
      else {
        await setGunSetting('drillConfig', config, snapshot.gun.id);
        if (token !== operation) return;
        state = createSession({ id: crypto.randomUUID(), gun: snapshot.gun, drill: selection, config, ...times() });
      }
      await persist();
      if (token !== operation) return;
      pending = false;
      changed();
      await apply(tickSession(state, times()));
      startTimer();
    } catch (error) { if (token === operation) await fail(error); }
    finally { if (token === operation) { pending = false; changed(); } }
  }

  async function pause() {
    if (!state || pending || ['paused', 'review'].includes(state.phase)) return;
    const token = ++operation;
    const pausedState = state;
    const pausedCue = cue;
    const when = times();
    pending = true;
    stopTimer();
    changed();
    try {
      await stopMicrophone();
      if (token !== operation) return;
      await enqueue(async () => {
        if (token !== operation) return;
        state = pauseSession(pausedState, { ...when, reason: 'paused' });
        await persist();
        await pausedCue?.close();
        if (cue === pausedCue) cue = null;
      });
    } finally { if (token === operation) { pending = false; changed(); } }
  }

  function interrupt(reason = 'ended') {
    if (interruption) return interruption;
    if (!locked()) return Promise.resolve();
    const token = ++operation;
    const interruptedState = state;
    const interruptedCue = cue;
    const when = times();
    stopTimer();
    pending = true;
    const ending = (async () => {
      await stopMicrophone();
      await enqueue(async () => {
        if (token !== operation) return;
        if (interruptedState && interruptedState.phase !== 'review') {
          state = endSession(interruptedState, { ...when, reason, interrupted: reason !== 'ended' });
          await persist();
        }
        await interruptedCue?.close();
        if (cue === interruptedCue) cue = null;
        onStatus(state ? 'Session saved' : 'Session cancelled before starting');
      });
    })();
    interruption = ending.finally(() => {
      interruption = null;
      if (token === operation) pending = false;
      changed();
    });
    changed();
    return interruption;
  }

  async function open(drill, config = null) {
    if (locked()) return;
    const token = ++readToken;
    const gunId = getContext().gun?.id;
    await configQueue;
    const saved = config || await getGunSetting('drillConfig', DEFAULT_SESSION_CONFIG, gunId);
    if (token !== readToken || getContext().gun?.id !== gunId || locked()) return;
    selection = structuredClone(drill);
    state = null;
    review = null;
    savedRevision = null; saveError = null;
    try { fillConfig(saved); } catch { fillConfig(DEFAULT_SESSION_CONFIG); }
    changed();
    onNavigate('session');
    $('#session-title').setAttribute('tabindex', '-1'); $('#session-title').focus();
  }

  function showRecord(record) {
    if (locked() || record.gunId !== getContext().gun?.id) return;
    state = null; review = structuredClone(record); saveError = null; savedRevision = null;
    selection = { id: record.drillId, title: record.drillTitle, steps: [...record.drillSteps] };
    fillConfig(record.config);
    changed(); onNavigate('session');
  }

  async function renderSavedSessions(gunId) {
    const records = gunId ? await getSessions(gunId) : [];
    if (gunId !== getContext().gun?.id) return;
    const host = $('#savedSessions');
    host.replaceChildren();
    if (!records.length) host.append(node('p', 'No saved drill sessions for this gun yet.', 'empty-state'));
    for (const record of records) {
      const card = node('article', '', 'saved-session-card');
      const count = record.kind === 'practice' ? `${record.shots} shots · ${record.completed} attempts` : `${record.completed}/${record.config.repetitions}`;
      const button = node('button', `${new Date(record.startedAt).toLocaleString()} · ${count} · ${record.status}`, 'button secondary wide-action');
      button.type = 'button';
      button.addEventListener('click', () => record.kind === 'practice' ? onPracticeRecord(record) : showRecord(record));
      card.append(node('strong', record.drillTitle), button); host.append(card);
    }
  }

  const retrySaveButton = node('button', 'Retry saving results', 'button secondary wide-action hidden');
  retrySaveButton.type = 'button';
  retrySaveButton.addEventListener('click', () => { enqueue(persist).then(changed).catch(onError); });
  $('#sessionReview .session-review-card').append(retrySaveButton);
  $('#sessionConfigForm').addEventListener('submit', event => { event.preventDefault(); start().catch(onError); });
  $('#sessionConfigForm').addEventListener('input', updateReadiness);
  $('#sessionConfigForm').addEventListener('change', () => {
    updateReadiness();
    if (!locked() && getContext().gun) {
      try {
        const config = readConfig();
        const gunId = getContext().gun.id;
        configQueue = configQueue.then(() => setGunSetting('drillConfig', config, gunId));
        // Handle the failure visibly while retaining an ordered queue for later edits.
        configQueue = configQueue.catch(onError);
      } catch { /* Invalid draft remains editable. */ }
    }
  });
  $('#pauseSessionBtn').addEventListener('click', () => pause().catch(onError));
  $('#resumeSessionBtn').addEventListener('click', () => start(true).catch(onError));
  $('#endSessionBtn').addEventListener('click', () => interrupt().catch(onError));
  $('#sessionBackBtn').addEventListener('click', () => { interrupt('navigation').then(() => onNavigate('drills')).catch(onError); });
  $('#backToDrillsBtn').addEventListener('click', () => onNavigate('drills'));
  $('#sessionLearnBtn').addEventListener('click', () => onNavigate('learn'));
  $('#repeatSessionBtn').addEventListener('click', () => {
    const record = state ? toSessionRecord(state) : review;
    if (record) open({ id: record.drillId, title: record.drillTitle, steps: record.drillSteps }, record.config).catch(onError);
  });
  $('#safetyAck').addEventListener('change', updateReadiness);

  return { open, showRecord, interrupt, renderSavedSessions, refresh: render, locked, flush: () => configQueue,
    reset() { if (!locked()) { readToken += 1; selection = null; state = null; review = null; saveError = null; savedRevision = null; } } };
}
