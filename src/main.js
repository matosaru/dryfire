import { analyzeRecording, recordFeatureVector, startContinuousListening } from './audio.js';
import { DRILLS, advanceDrill, createDrillState, getDrill } from './drills.js';
import { soundCard, drillCard } from './uiComponents.js';
import { ACTUAL_CLASSES, PREDICTED_CLASSES, evaluateEvents } from './evaluation.js';
import { classify, labels, MIN_EXAMPLES_PER_CLASS, RECOMMENDED_EXAMPLES_PER_CLASS, trainingCounts } from './classifier.js';
import {
  addExample, getExamples, getOutdatedExampleCount, clearExamples, clearExamplesForLabel,
  addEvent, getEvents, verifyEvent, clearEvents, trimEvents, getSetting, setSetting, normalizeMaxResults, MAX_EXAMPLES_PER_CLASS, exportBackup, restoreBackup,
} from './storage.js';

const labelMeta = {
  draw: { title: 'Draw from holster', description: 'Holster release and presentation sounds', tone: 'blue', short: 'DR' },
  rack: { title: 'Rack slide', description: 'Slide movement and return', tone: 'green', short: 'RK' },
  trigger: { title: 'Trigger pull', description: 'Dry trigger click', tone: 'orange', short: 'TR' },
  reload: { title: 'Change magazine', description: 'Magazine removal and insertion', tone: 'purple', short: 'MG' },
};
const $ = selector => document.querySelector(selector);
let examples = [];
let busy = false;
let activeView = 'home';
let liveSession = null;
let livePendingStart = false;
let liveToken = 0;
let eventQueue = Promise.resolve();
let sessionEventCount = 0;
let ignoredEventCount = 0;
let latestEventId = null;
let drillState = null;

function titleFor(label) { return labelMeta[label]?.title ?? 'Unknown sound'; }
function setStatus(text) { $('#statusPill').textContent = text; }
function setMessage(text = '') {
  $('#appMessage').textContent = text;
  $('#appMessage').classList.toggle('hidden', !text);
}
function ensureSafe() {
  if ($('#safetyAck').checked) return true;
  setMessage('Complete and acknowledge the safety check before recording.');
  $('.safety-disclosure').open = true;
  $('#safetyAck').focus();
  return false;
}
function setBusy(next) {
  busy = next;
  document.querySelectorAll('.record-example, .reset-class, #singleShotBtn, #resetModelBtn, #clearHistoryBtn').forEach(button => { button.disabled = next; });
}
function getCounts() { return trainingCounts(examples); }

function renderClassCards() {
  const host = $('#classCards');
  host.replaceChildren();
  const counts = getCounts();
  for (const label of labels) {
    const count = counts[label];
    host.append(soundCard({
      label, meta: labelMeta[label], count,
      maxExamples: MAX_EXAMPLES_PER_CLASS,
      minExamples: MIN_EXAMPLES_PER_CLASS,
      recommendedExamples: RECOMMENDED_EXAMPLES_PER_CLASS,
      locked: busy || !!liveSession || livePendingStart,
      onRecord: () => recordExample(label),
      onReset: () => resetSoundProfile(label)
    }));
  }
  const ready = labels.every(label => counts[label] >= MIN_EXAMPLES_PER_CLASS);
  $('#trainingSummary').textContent = ready
    ? `Ready to test · ${labels.map(label => `${titleFor(label)}: ${counts[label]}`).join(' · ')}`
    : `Learn at least ${MIN_EXAMPLES_PER_CLASS} examples of each sound before recognition. ${labels.map(label => `${titleFor(label)}: ${counts[label]}`).join(' · ')}`;
  $('#listenBtn').disabled = busy || livePendingStart || (!ready && !liveSession);
  $('#singleShotBtn').disabled = busy || !!liveSession || livePendingStart || !ready;
  $('#homeExamples').textContent = `${labels.reduce((sum,label) => sum + counts[label], 0)} / ${RECOMMENDED_EXAMPLES_PER_CLASS * labels.length}`;
  $('#homeListenBtn').disabled = busy || !ready;
}

async function resetSoundProfile(label) {
  if (busy || liveSession || livePendingStart || !labels.includes(label)) return;
  if (!confirm(`Reset learned ${titleFor(label)} sounds only? Other sounds and recognition history will be kept.`)) return;
  setBusy(true);
  try {
    await clearExamplesForLabel(label);
    examples = await getExamples();
    setStatus(`${titleFor(label)} reset`);
    setMessage(`${titleFor(label)} examples removed. Other profiles and history were kept.`);
  } catch(error) {showError(error);}
  finally {setBusy(false);renderClassCards();}
}

function renderDrillCatalog() {
  const host = $('#drillCatalog');
  host.replaceChildren();
  for (const [index, item] of DRILLS.entries()) {
    host.append(drillCard({
      drill: item, index, titleFor,
      onChoose: () => {
        if (busy) return;
        $('#drillSelect').value = item.id;
        resetDrill();
        switchView('recognize');
      }
    }));
  }
}

function switchView(name) {
  if (busy || !['home','learn','drills','recognize','history','settings'].includes(name)) return;
  if (liveSession || livePendingStart) void stopLive();
  activeView=name;
  document.body.dataset.view = name;
  window.scrollTo({top:0,behavior:'instant'});
  document.querySelectorAll('.tab').forEach(tab=>{
    const selected=tab.dataset.view===name;
    tab.classList.toggle('active',selected);
    if(selected)tab.setAttribute('aria-current','page');
    else tab.removeAttribute('aria-current');
  });
  for(const view of ['home','learn','drills','recognize','history','settings']) $('#'+view+'View').classList.toggle('hidden',view!==name);
  $('#settingsShortcut').classList.toggle('active',name==='settings');
  if(name==='settings')$('#settingsShortcut').setAttribute('aria-current','page');
  else $('#settingsShortcut').removeAttribute('aria-current');
  setMessage();
  if(name==='history')renderHistory().catch(showError);
  if(name==='home')renderHome().catch(showError);
}

function renderDistances(distances) {
  const host = $('#distanceBars');
  host.replaceChildren();
  const finite = Object.values(distances).filter(Number.isFinite);
  const max = Math.max(...finite, 1);
  for (const label of labels) {
    const distance = distances[label];
    const row = document.createElement('div');
    row.className = 'distance-row';
    const line = document.createElement('div');
    line.className = 'distance-label';
    const name = document.createElement('span');
    name.textContent = titleFor(label);
    const value = document.createElement('span');
    value.textContent = Number.isFinite(distance) ? distance.toFixed(2) : 'not learned';
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('span');
    const similarity = Number.isFinite(distance) ? Math.max(0, 100 - distance / max * 85) : 0;
    fill.style.width = `${similarity}%`;
    bar.append(fill);
    line.append(name, value);
    row.append(line, bar);
    host.append(row);
  }
}

function renderDrill() {
  const drill = getDrill($('#drillSelect').value);
  const steps = $('#drillSteps');
  steps.replaceChildren();
  $('#drillStats').classList.toggle('hidden', !drill);
  $('#resetDrillBtn').classList.toggle('hidden', !drill);
  if (!drill) {
    $('#drillProgressBadge').textContent = 'Free listen';
    $('#drill-heading').textContent = 'Free listening';
    $('#drillExplanation').textContent = 'Select a preset to track its ordered sound detections while the microphone stays active.';
    $('#drillFeedback').textContent = '';
    return;
  }
  const state = drillState;
  $('#drill-heading').textContent = drill.title;
  $('#drillProgressBadge').textContent = `Step ${(state?.stepIndex ?? 0) + 1} / ${drill.steps.length}`;
  $('#drillExplanation').textContent = drill.title;
  $('#drillCompleted').textContent = String(state?.completed ?? 0);
  $('#drillIncorrect').textContent = String(state?.incorrect ?? 0);
  $('#drillUnknown').textContent = String(state?.unknown ?? 0);
  for (const [index, label] of drill.steps.entries()) {
    const item = document.createElement('li');
    if (index < (state?.stepIndex ?? 0)) item.className = 'drill-step done';
    else if (index === (state?.stepIndex ?? 0)) item.className = 'drill-step current';
    else item.className = 'drill-step';
    const number = document.createElement('span');
    number.className = 'step-number';
    number.textContent = index < (state?.stepIndex ?? 0) ? '✓' : String(index + 1);
    const name = document.createElement('span');
    name.textContent = titleFor(label);
    item.append(number, name);
    steps.append(item);
  }
  const outcomes = {
    ready: `Ready · awaiting ${titleFor(drill.steps[0])}.`,
    matched: `Recognized · next: ${titleFor(drill.steps[state.stepIndex])}.`,
    completed: `Sequence recognized (${state.completed} completed). Listening for the next attempt.`,
    incorrect: `Unexpected action · restarted. Awaiting ${titleFor(drill.steps[state.stepIndex])}.`,
    unknown: `Unknown sound · keep listening for ${titleFor(drill.steps[state.stepIndex])}.`,
  };
  $('#drillFeedback').textContent = outcomes[state?.lastOutcome ?? 'ready'];
}

function resetDrill() {
  const id = $('#drillSelect').value;
  drillState = id ? createDrillState(id) : null;
  renderDrill();
}

function recordDrillPrediction(result) {
  if (!drillState) return null;
  const before = drillState;
  const after = advanceDrill(before, result.label);
  return {
    before,
    after,
    id: after.drillId,
    outcome: after.lastOutcome,
    position: before.stepIndex,
    completed: after.lastOutcome === 'completed',
  };
}

function showError(error) {
  console.error(error);
  setStatus('Attention needed');
  setMessage(error?.message || String(error));
}

async function capture(action) {
  if (busy || liveSession || livePendingStart || !ensureSafe()) return;
  setMessage();
  setBusy(true);
  try { await action(); }
  catch (error) { showError(error); }
  finally { setBusy(false); renderClassCards(); }
}

async function recordExample(label) {
  await capture(async () => {
    const features = await recordFeatureVector(setStatus);
    await addExample(label, features);
    examples = await getExamples();
    setStatus(`${titleFor(label)} saved`);
  });
}

function showRecognition(result, event) {
  latestEventId = event.id;
  $('#predictionEmpty').classList.add('hidden');
  $('#predictionCard').classList.remove('hidden');
  $('#predictionLabel').textContent = result.label ? titleFor(result.label) : 'Unknown / unclear';
  $('#predictionConfidence').textContent = result.label
    ? 'Closest learned profile; check the match yourself.'
    : 'No reliable match. Try another event or add labeled examples.';
  $('#predictionScore').textContent = `${result.score}/100`;
  $('#latestActual').value = '';
  renderDistances(result.distances);
}

async function savePrediction(features, token = null) {
  const result = classify(examples, features);
  if (!result) throw new Error('No valid training data found.');
  if (token !== null && token !== liveToken) return;
  const drillMatch = token !== null ? recordDrillPrediction(result) : null;
  const event = await addEvent({
    label: result.label, score: result.score,
    ...(drillMatch ? { drillId: drillMatch.id, drillOutcome: drillMatch.outcome,
      drillPosition: drillMatch.position, drillCompleted: drillMatch.completed } : {}),
  });
  if (token !== null && token !== liveToken) return;
  if (drillMatch) { drillState = drillMatch.after; renderDrill(); }
  showRecognition(result, event);
  setStatus(token !== null ? 'Listening · microphone active' : (result.label ? `Matched ${titleFor(result.label)}` : 'Unknown / unclear'));
  if (token !== null) {
    sessionEventCount += 1;
    $('#eventCounter').textContent = `${sessionEventCount} detected · ${ignoredEventCount} discarded`;
    const list = $('#sessionTimeline');
    const row = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = result.label ? titleFor(result.label) : 'Unknown / unclear';
    const detail = document.createElement('span');
    detail.textContent = `#${sessionEventCount} · ${result.score}/100 · ${new Date(event.createdAt).toLocaleTimeString()}`;
    if (drillMatch) {
      detail.textContent += drillMatch.completed ? ' · ✓ drill completed' : ` · ${drillMatch.outcome.replace('incorrect', 'out of order')}`;
    }
    row.append(name, detail);
    list.prepend(row);
    while (list.children.length > 12) list.lastElementChild.remove();
  }
}

async function recognize() {
  if (!labels.every(label => getCounts()[label] >= MIN_EXAMPLES_PER_CLASS)) {
    switchView('learn');
    setMessage(`Record at least ${MIN_EXAMPLES_PER_CLASS} examples for all four sounds before trying recognition.`);
    return;
  }
  await capture(async () => {
    const features = await recordFeatureVector(setStatus);
    await savePrediction(features);
  });
}

function renderLiveButton() {
  const listening = !!liveSession;
  $('#listenBtn').textContent = listening ? 'Stop listening' : 'Start continuous listening';
  $('#listeningIndicator').textContent = listening ? '● Microphone active — listening for the next sound' : (livePendingStart ? 'Connecting microphone…' : 'Microphone inactive');
  $('#listeningIndicator').classList.toggle('is-live', listening);
  $('#listenBtn').classList.toggle('listening', listening);
  $('#sensitivity').disabled = listening || livePendingStart;
  $('#drillSelect').disabled = listening || livePendingStart;
  $('#resetDrillBtn').disabled = listening || livePendingStart;
  const ready = labels.every(label => getCounts()[label] >= MIN_EXAMPLES_PER_CLASS);
  $('#listenBtn').disabled = busy || livePendingStart || (!ready && !listening);
  $('#singleShotBtn').disabled = listening || busy || livePendingStart || !ready;
  document.querySelectorAll('.record-example, .reset-class, #resetModelBtn, #clearHistoryBtn').forEach(button => {
    button.disabled = busy || listening || livePendingStart;
  });
}

async function stopLive() {
  liveToken += 1;
  const running = liveSession;
  liveSession = null;
  livePendingStart = false;
  renderLiveButton();
  $('#meterFill').style.width = '0%';
  $('#listenNote').textContent = 'Microphone stopped. This session has ended; start again for another sequence.';
  if (running) await running.stop();
  setStatus('Ready');
  renderClassCards();
}

async function toggleLive() {
  if (liveSession) { await stopLive(); return; }
  if (livePendingStart || busy || !ensureSafe()) return;
  if (!labels.every(label => getCounts()[label] >= MIN_EXAMPLES_PER_CLASS)) {
    switchView('learn');
    setMessage(`Learn at least ${MIN_EXAMPLES_PER_CLASS} examples of all four sounds first.`);
    return;
  }
  const token = ++liveToken;
  livePendingStart = true;
  sessionEventCount = 0;
  ignoredEventCount = 0;
  resetDrill();
  $('#sessionTimeline').replaceChildren();
  $('#eventCounter').textContent = '0 detected · 0 discarded';
  setMessage();
  renderLiveButton();
  try {
    const session = await startContinuousListening({
      sensitivity: $('#sensitivity').value,
      onState: status => { if (token === liveToken) setStatus(status); },
      onLevel: level => { if (token === liveToken) $('#meterFill').style.width = `${level}%`; },
      onError: error => {
        if (token !== liveToken) return;
        void stopLive().then(() => showError(error));
      },
      onEvent: (pcm, sampleRate) => {
        // Serialize classification/database writes while audio capture continues.
        eventQueue = eventQueue.then(async () => {
          if (token !== liveToken) return;
          let analyzed;
          try { analyzed = analyzeRecording(pcm, sampleRate); }
          catch (error) {
            ignoredEventCount += 1;
            $('#eventCounter').textContent = `${sessionEventCount} detected · ${ignoredEventCount} discarded`;
            return;
          } // Ignore clipped/unclear candidate transients without stopping.
          await savePrediction(analyzed.features, token);
        }).catch(error => {
          if (token === liveToken) showError(error);
        });
      },
    });
    if (token !== liveToken) { await session.stop(); return; }
    liveSession = session;
    $('#listenNote').textContent = 'Still listening after every detection. Separate actions with a brief quiet gap; overlapping sounds may merge. Tap Stop when finished.';
    setStatus('Listening · microphone active');
  } catch (error) {
    if (token === liveToken) showError(error);
  } finally {
    if (token === liveToken) livePendingStart = false;
    renderLiveButton();
    renderClassCards();
  }
}

function renderEvaluation(events) {
  const stats = evaluateEvents(events);
  $('#verifiedCount').textContent = stats.verified;
  $('#accuracyPct').textContent = stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`;
  $('#falsePositivePct').textContent = stats.otherFalsePositiveRate === null ? '—' : `${Math.round(stats.otherFalsePositiveRate * 100)}%`;
  const host = $('#confusionTable');
  host.replaceChildren();
  if (!stats.verified) {
    const p = document.createElement('p');
    p.className = 'muted small';
    p.textContent = 'Verify at least one event below to see the confusion matrix.';
    host.append(p);
    return;
  }
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.textContent = 'Actual sound by predicted label (counts)';
  table.append(caption);
  const head = document.createElement('tr');
  for (const name of ['Actual ↓ / Predicted →', ...PREDICTED_CLASSES]) {
    const th = document.createElement('th');
    th.scope = 'col'; th.textContent = name; head.append(th);
  }
  const thead = document.createElement('thead'); thead.append(head); table.append(thead);
  const tbody = document.createElement('tbody');
  for (const actual of ACTUAL_CLASSES) {
    const tr = document.createElement('tr');
    const th = document.createElement('th'); th.scope = 'row'; th.textContent = actual;
    tr.append(th);
    for (const predicted of PREDICTED_CLASSES) {
      const td = document.createElement('td');
      td.textContent = stats.matrix[actual][predicted];
      if (predicted === actual || (actual === 'other' && predicted === 'unknown')) td.className = 'correct';
      tr.append(td);
    }
    tbody.append(tr);
  }
  table.append(tbody);
  host.append(table);
}

async function renderHome() {
  const rows = await getEvents();
  const stats = evaluateEvents(rows);
  $('#homeEvents').textContent = String(rows.length);
  $('#homeAccuracy').textContent = stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`;
}

async function renderHistory() {
  const rows = await getEvents();
  renderEvaluation(rows);
  $('#homeEvents').textContent = String(rows.length);
  const host = $('#historyList');
  host.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No recognition events yet.';
    host.append(empty);
    return;
  }
  for (const row of rows) {
    const item = document.createElement('article');
    item.className = 'history-item';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = titleFor(row.label);
    const date = document.createElement('p');
    date.textContent = new Date(row.createdAt).toLocaleString();
    const score = document.createElement('span');
    const value = Number.isFinite(row.score) ? row.score : Math.round((row.confidence || 0) * 100);
    score.textContent = `${Math.round(value)}/100`;
    if (row.drillId && getDrill(row.drillId)) {
      const drillDescription = document.createElement('p');
      drillDescription.textContent = `${getDrill(row.drillId).title} · ${row.drillCompleted ? 'Sequence recognized ✓' : row.drillOutcome === 'incorrect' ? 'Out of order' : row.drillOutcome === 'unknown' ? 'Unknown sound' : 'Step detected'}`;
      copy.append(drillDescription);
    }
    copy.append(title, date);
    const controls = document.createElement('div');
    controls.className = 'history-controls';
    const actualLabel = document.createElement('label');
    actualLabel.textContent = 'Actual:';
    const actual = document.createElement('select');
    actual.setAttribute('aria-label', `Actual sound for ${new Date(row.createdAt).toLocaleString()}`);
    for (const [value, label] of [['', 'Not verified'], ...labels.map(key => [key, titleFor(key)]), ['other', 'Other / noise']]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      actual.append(option);
    }
    actual.value = row.actualLabel ?? '';
    actual.addEventListener('change', async () => {
      try { await verifyEvent(row.id, actual.value || null); await renderHistory(); }
      catch (error) { showError(error); }
    });
    controls.append(actualLabel, actual, score);
    item.append(copy, controls);
    host.append(item);
  }
}

async function init() {
  examples = await getExamples();
  const legacy = await getOutdatedExampleCount();
  if (legacy > 0) {
    const notice = $('#modelNotice');
    notice.textContent = `${legacy} older training sample(s) use an incompatible feature format and are ignored. Reset learned sounds and record new samples for the updated model.`;
    notice.classList.remove('hidden');
  }
  $('#maxResults').value = normalizeMaxResults(await getSetting('maxResults', 50));
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchView(tab.dataset.view)));
  document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => switchView('home')));
  $('#homeHistoryBtn').addEventListener('click', () => switchView('history'));
  $('#settingsShortcut').addEventListener('click', () => switchView('settings'));
  $('#changeDrillBtn').addEventListener('click', () => switchView('drills'));
  $('#freeListenBtn').addEventListener('click', () => { $('#drillSelect').value = ''; resetDrill(); switchView('recognize'); });
  renderDrillCatalog();
  $('#listenBtn').addEventListener('click', toggleLive);
  $('#drillSelect').addEventListener('change', resetDrill);
  $('#resetDrillBtn').addEventListener('click', resetDrill);
  resetDrill();
  $('#homeLearnBtn').addEventListener('click', () => switchView('learn'));
  $('#homeDrillsBtn').addEventListener('click', () => switchView('drills'));
  $('#homeListenBtn').addEventListener('click', () => switchView('recognize'));
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#exportBtn').addEventListener('click', async () => {
    try {
      const data = JSON.stringify(await exportBackup(), null, 2);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `sound-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setMessage('Backup prepared. Keep the downloaded JSON file private.');
    } catch (error) { showError(error); }
  });
  $('#importFile').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 1000000) { setMessage('Backup is too large (maximum 1 MB).'); return; }
    if (!confirm('Replace learned sounds and recognition history on this device with this backup?')) return;
    setBusy(true);
    try {
      const result = await restoreBackup(JSON.parse(await file.text()));
      examples = await getExamples();
      $('#maxResults').value = result.maxResults;
      latestEventId = null;
      $('#predictionCard').classList.add('hidden');
      $('#predictionEmpty').classList.remove('hidden');
      renderClassCards();
      await renderHistory();
      setMessage(`Restored ${result.examples} sound examples and ${result.events} recognition results.`);
    } catch (error) { showError(error); }
    finally { setBusy(false); renderClassCards(); }
  });
  $('#singleShotBtn').addEventListener('click', recognize);
  $('#verifyLatestBtn').addEventListener('click', async () => {
    const actual = $('#latestActual').value;
    if (!latestEventId || !ACTUAL_CLASSES.includes(actual)) {
      setMessage('Select what actually happened before verifying.');
      return;
    }
    try {
      await verifyEvent(latestEventId, actual);
      setMessage('Verification saved. See History for accuracy statistics.');
    } catch (error) { showError(error); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (liveSession || livePendingStart)) void stopLive();
  });
  window.addEventListener('pagehide', () => { if (liveSession || livePendingStart) void stopLive(); });
  $('#safetyAck').addEventListener('change', () => { if (!$('#safetyAck').checked && (liveSession || livePendingStart)) void stopLive(); });
  $('#resetModelBtn').addEventListener('click', async () => {
    if (busy || liveSession || livePendingStart || !confirm('Delete ALL learned sound profiles on this device? Recognition history will be kept.')) return;
    setBusy(true);
    try {
      await clearExamples();
      examples = [];
      $('#modelNotice').classList.add('hidden');
      setStatus('All learned sounds reset');
      setMessage('All four sound profiles were reset. Recognition history was kept.');
    } catch (error) { showError(error); }
    finally { setBusy(false); renderClassCards(); }
  });
  $('#clearHistoryBtn').addEventListener('click', async () => {
    if (busy || !confirm('Delete the recognition history on this device?')) return;
    setBusy(true);
    try {
      await clearEvents();
      latestEventId = null;
      $('#predictionCard').classList.add('hidden');
      $('#predictionEmpty').classList.remove('hidden');
      await renderHistory();
      setStatus('History cleared');
    }
    catch (error) { showError(error); }
    finally { setBusy(false); }
  });
  $('#maxResults').addEventListener('change', async event => {
    const max = normalizeMaxResults(event.target.value);
    event.target.value = max;
    try { await setSetting('maxResults', max); await trimEvents(max); await renderHistory(); }
    catch (error) { showError(error); }
  });
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  $('#installStatus').textContent = standalone
    ? 'Installed: you are using the Home Screen app.'
    : 'Not yet installed. Follow these steps to put it on your Home Screen.';
  $('#deviceCheck').textContent = `${window.isSecureContext ? 'Secure connection' : 'Insecure connection — microphone may be blocked'} · ${navigator.mediaDevices?.getUserMedia ? 'Microphone API available' : 'Microphone API unavailable'} · Local storage only`;
  renderClassCards();
  renderLiveButton();
  await renderHome();
  setStatus('Ready');
}

init().catch(showError);

// HTTPS-hosted web builds can reopen offline after an initial successful load.
// Capacitor packages the web bundle itself, so don't register a worker there.
const isNative = typeof globalThis.Capacitor?.isNativePlatform === 'function' && globalThis.Capacitor.isNativePlatform();
if (!import.meta.env.DEV && !isNative && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('/sw.js').catch(error => {
    console.warn('Offline caching unavailable:', error);
  });
}
