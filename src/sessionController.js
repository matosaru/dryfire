import {DRILLS} from './drills.js';
import {guidePathFor} from './appPaths.js';
import { textElement as node } from './textElement.js';
import { startContinuousListening } from './audio.js';
import { recognizeRecording } from './recognition.js';
import { MIN_EXAMPLES_PER_CLASS, trainingCounts } from './classifier.js';
import {
  DEFAULT_SESSION_CONFIG, normalizeSessionConfig, createSession, tickSession,
  recordSessionDetection, pauseSession, resumeSession, endSession, toSessionRecord,
} from './drillSession.js';
import { getGunSetting, setGunSetting, saveSession, getSessions } from './storage/library.js';
import { requestFeedbackVibration } from './feedback.js';
import { readNumberInput } from './inputLimits.js';

const $ = selector => document.querySelector(selector);


/** Dedicated timed sessions; free listening retains its own capture lifecycle. */
export function createSessionController({ getContext, titleFor, ensureSafe, onNavigate, onBack,
  onChange, onError, onStatus, onProcessing, vibrationEnabled, onVibration, onPracticeRecord, loadPresentation = () => import('./sessionPresentation.js') }) {
  let presentation;
  const preparePresentation = async () => presentation ??= await loadPresentation();
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
  let routeKey = null, view = null, page = null, runModel, reviewModel;
  const actions = new Map();
  const bind = (id, handler) => { actions.set(id,handler); $('#'+id).addEventListener('click',handler); };
  const presentRun = model => { runModel=model; if(!view)return false; view.setRun(model); return true; };
  const presentReview = model => { reviewModel=model; if(!view)return false; view.setReview(model); return true; };

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
      return readNumberInput($(selector));
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
      : invalid || (!$('#safetyAck').checked ? 'Sounds ready. Start opens safety confirmation.' : 'Sounds trained and safety confirmed. Ready to start.');
    $('#sessionLearnBtn').classList.toggle('hidden', !missing.length);
    $('#sessionStartBtn').disabled = pending || locked() || missing.length > 0 || !!invalid || !context.gun || context.gun.needsDetails;
    const random = $('#sessionDelayMode').value === 'random';
    $('#fixedDelayFields').classList.toggle('hidden', random);
    $('#randomDelayFields').classList.toggle('hidden', !random);
    $('#sessionCueGuardNote').classList.toggle('hidden', !$('#sessionStartSound').checked);
  }

  function renderSequence(record) {
    const steps = record?.drillSteps || selection?.steps || [];
    const rows=steps.map((label,index)=>({text:titleFor(label),className:'drill-step'+(state?.phase==='active'?(index<state.current.stepIndex?' done':index===state.current.stepIndex?' current':''):'')}));
    const presetName=`${steps.length} sound action${steps.length===1?'':'s'} · ${record?'Saved session':'Session setup'}`;
    if(page)page.update({steps:rows,presetName});else{const host=$('#sessionSteps');host.replaceChildren(...rows.map(row=>node('li',row.text,row.className)));$('#sessionPresetName').textContent=presetName;}
  }

  const resultDetails = row => presentation.sequenceResultDetails(row, { node, titleFor });
  const renderReview = record => presentation.renderSequenceReview(record, { $, node, state, savedRevision, saveError, saving, pending, retrySaveButton, locked, getContext, resultDetails, present:presentReview });

  function announce(text) {
    if (text !== lastAnnouncement) {
      $('#sessionAnnouncement').textContent = text;
      lastAnnouncement = text;
    }
  }

  function render() {
    const record = state?.phase === 'review' ? toSessionRecord(state) : review;
    const running = pending || !!state && state.phase !== 'review';
    const guideHref=guidePathFor(DRILLS.some(drill=>drill.id===selection?.id)?'sequence-'+selection.id:'sequence-custom');
    if(page)page.update({guideHidden:!!running||!!record,guideHref});else{$('#sessionGuideLink').classList.toggle('hidden',!!running||!!record);$('#sessionGuideLink').setAttribute('href',guideHref);}
    $('#sessionConfigure').classList.toggle('hidden', running || !!record);
    $('#sessionRun').classList.toggle('hidden', !running);
    $('#sessionReview').classList.toggle('hidden', running || !record);
    $('#sessionConfigFields').disabled = running;
    renderSequence(record || state);
    if (record && !running) { renderReview(record); return; }
    updateReadiness();
    if (!running) return;
    presentation.renderSequenceRun({ $, state, pending, clock, microphone, readConfig, savedRevision, titleFor, resultDetails, announce, node, present:presentRun });
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
    await session.waitForInput();
    if (token !== operation || capture !== captureToken) { await session.stop(); return null; }
    return session;
  }

  async function start(resuming = false) {
    if (pending || finishing || saving || interruption || (locked() && !resuming) || !ensureSafe(() => start(resuming))) return;
    const context = getContext();
    if (!context.gun || !selection.steps.every(label => trainingCounts(context.examples)[label] >= MIN_EXAMPLES_PER_CLASS)) { updateReadiness(); return; }
    const config = resuming ? state.config : readConfig();
    const snapshot = { ...context, gun: { ...context.gun }, examples: structuredClone(context.examples), audioPreferences: { ...context.audioPreferences } };
    const token = ++operation;
    pending = true;
    review = null;
    if (!resuming) { state = null; savedRevision = null; saveError = null; }
    cue = presentation.createStartCuePlayer();
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
    ++readToken; // Navigation cancels pending configuration/review imports as well as capture.
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
    const [saved] = await Promise.all([config || getGunSetting('drillConfig', DEFAULT_SESSION_CONFIG, gunId), preparePresentation()]);
    if (token !== readToken || getContext().gun?.id !== gunId || locked()) return;
    selection = structuredClone(drill);
    state = null;
    review = null;
    savedRevision = null; saveError = null;
    try { fillConfig(saved); } catch { fillConfig(DEFAULT_SESSION_CONFIG); }
    changed();
    routeKey = crypto.randomUUID(); onNavigate('session');
    $('#session-title').setAttribute('tabindex', '-1'); $('#session-title').focus();
  }

  async function showRecord(record) {
    if (locked() || record.gunId !== getContext().gun?.id) return;
    const token = ++readToken;
    try { await preparePresentation(); } catch (error) { if (token === readToken) onError(error); return; }
    if (token !== readToken || locked() || record.gunId !== getContext().gun?.id) return;
    state = null; review = structuredClone(record); saveError = null; savedRevision = null;
    selection = { id: record.drillId, title: record.drillTitle, steps: [...record.drillSteps] };
    fillConfig(record.config);
    routeKey = crypto.randomUUID(); changed(); onNavigate('session');
  }

  function openSavedRecord(record){return record.kind === 'practice' ? onPracticeRecord(record) : showRecord(record);}

  async function renderSavedSessions(gunId, isCurrent = () => true, paint = true) {
    const records = gunId ? await getSessions(gunId) : [];
    if (gunId !== getContext().gun?.id || !isCurrent()) return;
    if(!paint)return records;
    const host = $('#savedSessions');
    host.replaceChildren();
    if (!records.length) host.append(node('p', 'No saved drill sessions for this gun yet.', 'empty-state'));
    for (const record of records) {
      const card = node('article', '', 'saved-session-card');
      const count = record.kind === 'practice' ? `${record.shots} shots · ${record.completed} attempts` : `${record.completed}/${record.config.repetitions}`;
      const button = node('button', `${new Date(record.startedAt).toLocaleString()} · ${count} · ${record.status}`, 'button secondary wide-action');
      button.type = 'button';
      button.addEventListener('click', () => openSavedRecord(record));
      card.append(node('strong', record.drillTitle), button); host.append(card);
    }
    return records;
  }

  const retrySaveButton = node('button', 'Retry saving results', 'button secondary wide-action hidden');
  retrySaveButton.type = 'button';
  const retrySave = () => { enqueue(persist).then(changed).catch(onError); };
  actions.set('retrySessionSave',retrySave);retrySaveButton.addEventListener('click',retrySave);
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
  bind('pauseSessionBtn', () => pause().catch(onError));
  bind('resumeSessionBtn', () => start(true).catch(onError));
  bind('endSessionBtn', () => interrupt().catch(onError));
  $('#sessionBackBtn').addEventListener('click', () => onBack());
  bind('backToDrillsBtn', () => onNavigate('drills'));
  $('#sessionLearnBtn').addEventListener('click', () => onNavigate('learn'));
  bind('sessionTestStartSound', async () => { if (!await presentation.playStartCuePreview()) onError(new Error('Start sound unavailable. Check browser audio permission and media volume.')); });
  bind('repeatSessionBtn', () => {
    const record = state ? toSessionRecord(state) : review;
    if (record) open({ id: record.drillId, title: record.drillTitle, steps: record.drillSteps }, record.config).catch(onError);
  });
  $('#safetyAck').addEventListener('change', updateReadiness);

  function guideContext() {
    if (!routeKey || !selection || locked() || saveError || state || review) return null;
    return { type: 'sequence', gunId: getContext().gun?.id, routeKey, drill: structuredClone(selection),
      config: { soundAtStart: $('#sessionStartSound').checked } };
  }
  function connectView(mount) {
    if(view||locked()||saveError)return false;
    view=mount($('#sessionRun'),$('#sessionReview'),{runModel,reviewModel,titleFor,onAction:id=>actions.get(id)?.()});
    return true;
  }
  function connectPage(mount,onGuide){if(page||locked()||saveError)return false;page=mount($('#sessionView'),{onBack,onGuide});return true;}
  return { connectPage,hasPage:()=>!!page,updateContext:props=>page?.update(props),connectView, open, showRecord, guideContext, interrupt, openSavedRecord, renderSavedSessions, refresh: render, locked, routeKey: () => routeKey, selectionId: () => selection?.id ?? null, hasUnsavedResults: () => !!saveError, flush: () => Promise.all([configQueue, queue]),
    reset() { if (!locked()) { readToken += 1; routeKey = null; selection = null; state = null; review = null; saveError = null; savedRevision = null; } } };
}
