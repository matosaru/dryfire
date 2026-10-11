import { analyzeRecording, recordFeatureVector, startContinuousListening } from './audio.js';
import { recognizeRecording } from './recognition.js';
import { DRILLS, advanceDrill, createDrillState, getDrill, normalizeCustomDrill } from './drills.js';
import { soundCard, drillCard } from './uiComponents.js';
import { configureNumberInputs, readNumberInput } from './inputLimits.js';
import { createSafetyGate } from './safetyGate.js';
import { createProgressView } from './progressView.js';
import { createScreenNavigation } from './screenNavigation.js';
import { ACTUAL_CLASSES, PREDICTED_CLASSES, evaluateEvents } from './evaluation.js';
import { createSessionController } from './sessionController.js';
import { createPracticeController } from './practiceController.js';
import { normalizeEnabledLabels, initialEnabledLabels, recognitionOptions } from './calibration.js';
import { normalizeAudioPreferences, getAudioCapabilities } from './audioPreferences.js';
import { getVibrationCapability } from './feedback.js';
import { classify, labels, MIN_EXAMPLES_PER_CLASS, RECOMMENDED_EXAMPLES_PER_CLASS, trainingCounts } from './classifier.js';
import {
  addExample, getExamples, getOutdatedExampleCount, clearExamples, clearExamplesForLabel,
  addEvent, getEvents, verifyEvent, clearEvents, trimEvents, normalizeMaxResults, MAX_EXAMPLES_PER_CLASS, exportBackup, restoreBackup,
  getGuns, createGun, updateGun, getActiveGun, setActiveGun, MAX_GUNS, resetLibrary,
  getGunSetting, setGunSetting, getCustomDrills, saveCustomDrill,
  getSetting, setSetting, recoverInterruptedSessions,
  getCalibrationExamples, addCalibrationExample, clearCalibrationExamples,
} from './storage.js';

const labelMeta = {
  draw: { title: 'Draw from holster', description: 'Holster release and presentation sounds', tone: 'blue', short: 'DR' },
  rack: { title: 'Rack slide', description: 'Slide movement and return', tone: 'green', short: 'RK' },
  trigger: { title: 'Trigger pull', description: 'Dry trigger click', tone: 'orange', short: 'TR' },
  reload: { title: 'Change magazine', description: 'Magazine removal and insertion', tone: 'purple', short: 'MG' },
};
const $ = selector => document.querySelector(selector);
const gunTypeImages = { Handguns: 'handgun', 'Rifles and Carbines': 'rifle', Shotguns: 'shotgun' };
function gunImagePath(type) { return `/gun-types/${gunTypeImages[type] || 'unknown'}.svg`; }
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
let guns = [];
let activeGun = null;
let customDrills = [];
let setupGunId = null;
let customEditorId = null;
let customSteps = [];
let profileLoading = false;
let selectedTimedDrillId = '';
let audioPreferences = normalizeAudioPreferences();
let appearance = 'dark';
let vibrationFeedback = false;
let vibrationRejected = false;
let processingReport = null;
let preferencePending = false;
let sessionController = null;
let practiceController = null;
let safetyGate = null;
let progressView = null;
let screenNavigation = null;
let calibration = [];
let enabledSoundLabels = ['trigger'];
const triggerReady = () => getCounts().trigger >= MIN_EXAMPLES_PER_CLASS;
const practiceContext = () => ({ gun: activeGun, examples, calibration, sensitivity: $('#sensitivity').value, audioPreferences,
  available: !busy && !profileLoading && !preferencePending && !liveSession && !livePendingStart && !sessionController?.locked() });

const darkPreference = window.matchMedia?.('(prefers-color-scheme: dark)');
function applyAppearance() {
  const theme = appearance === 'system' ? (darkPreference?.matches ? 'dark' : 'light') : appearance;
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f4f6f8' : '#0b1116');
}
async function loadDevicePreferences() {
  const saved = await getSetting('appearance', 'dark');
  appearance = ['dark', 'light', 'system'].includes(saved) ? saved : 'dark';
  vibrationFeedback = await getSetting('vibrationFeedback', false) === true;
  vibrationRejected = false;
  applyAppearance();
}
function renderPreferences() {
  const capabilities = getAudioCapabilities();
  for (const [key, inputId, statusId] of [['noiseFilter', 'noiseFilter', 'noiseFilterStatus'], ['autoGain', 'autoGainControl', 'autoGainStatus']]) {
    const input = $('#'+inputId);
    input.checked = audioPreferences[key];
    input.disabled = !activeGun || activeGun.needsDetails || profileLocked() || !capabilities[key];
    const report = processingReport?.[key];
    $('#'+statusId).textContent = !capabilities[key] ? 'Unsupported by this browser. Recording remains available.'
      : report?.status === 'confirmed' ? `Last capture: ${report.applied ? 'On' : 'Off'}, confirmed by the audio track.`
      : report?.status === 'not-applied' ? `The last audio track did not apply the requested ${report.requested ? 'On' : 'Off'} setting.`
      : report?.status === 'unconfirmed' ? 'The browser did not confirm this setting on the last audio track.'
      : `Saved ${audioPreferences[key] ? 'On' : 'Off'} · applies to the next capture.`;
  }
  $('#appearance').value = appearance;
  $('#appearance').disabled = busy || profileLoading || preferencePending;
  $('#vibrationFeedback').checked = vibrationFeedback;
  const vibrationSupported = getVibrationCapability();
  $('#vibrationFeedback').disabled = !vibrationSupported || vibrationRejected || profileLocked();
  $('#vibrationStatus').textContent = !vibrationSupported ? 'Vibration is unavailable in this browser.'
    : vibrationRejected ? 'The browser declined vibration. Visual feedback remains available.'
    : `${vibrationFeedback ? 'On' : 'Off'} · requests vibration at GO and repetition completion. Device output is not verified.`;
}
function reportAudioProcessing(report) { processingReport = report; renderPreferences(); }
function reportVibration(result) { if (!result.supported || !result.accepted) { vibrationRejected = true; renderPreferences(); } }

function ownerId() {
  if (!activeGun || activeGun.needsDetails) throw new Error('Add your gun name and type before training.');
  return activeGun.id;
}
function profileLocked() { return busy || profileLoading || preferencePending || !!liveSession || livePendingStart || !!sessionController?.locked() || !!practiceController?.locked(); }
function currentDrill(id) { return getDrill(id, customDrills); }
function renderGunControls() {
  $('#gunSwitcherBtn').disabled = profileLocked();
  $('#gunSwitcherBtn').classList.toggle('hidden', !activeGun || activeGun.needsDetails);
  $('#gunSwitcherBtn').title = profileLocked() ? 'Finish recording or stop listening before switching guns.' : 'Choose another gun';
  $('#gunSwitcherBtn').setAttribute('aria-label', activeGun?.name ? `Switch gun. Selected: ${activeGun.name}, ${activeGun.type || 'type not set'}` : 'Choose a gun');
  $('#activeGunName').textContent = activeGun?.name || 'Your gun';
  $('#activeGunType').textContent = activeGun?.type || 'Add profile details';
  $('#activeGunImage').src = gunImagePath(activeGun?.type);
  $('#soundResetSummary').textContent = activeGun && !activeGun.needsDetails
    ? `${examples.length} learned samples · ${calibration.length} calibration samples for ${activeGun.name}`
    : 'Choose a gun before resetting its learned sounds.';
  $('#resetLibraryBtn').disabled = profileLocked();
  document.querySelectorAll('.gun-context-name').forEach(span => { span.textContent = activeGun?.name || 'No gun selected'; });
  document.querySelectorAll('.gun-context').forEach(row => { row.classList.toggle('hidden', !activeGun || activeGun.needsDetails); });
  if (!activeGun || activeGun.needsDetails) document.querySelectorAll('#resetModelBtn, #clearHistoryBtn, #verifyLatestBtn').forEach(button => { button.disabled = true; });
  $('#exportBtn').disabled = profileLocked();
  $('#importBtn').disabled = profileLocked();
  $('#verifyLatestBtn').disabled = !latestEventId || profileLocked();
}

async function loadActiveGun() {
  sessionController?.reset();
  practiceController?.reset();
  activeGun = await getActiveGun();
  guns = await getGuns();
  const id = activeGun?.id;
  examples = id ? await getExamples(id) : [];
  customDrills = id ? await getCustomDrills(id) : [];
  const legacy = id ? await getOutdatedExampleCount(id) : 0;
  $('#modelNotice').textContent = `${legacy} older training sample(s) use an incompatible feature format and are ignored. Reset this gun's sounds and record new samples for the updated model.`;
  $('#modelNotice').classList.toggle('hidden', legacy === 0);
  $('#maxResults').value = id ? normalizeMaxResults(await getGunSetting('maxResults', 50, id)) : 50;
  $('#sensitivity').value = id ? await getGunSetting('sensitivity', 'normal', id) : 'normal';
  if (!$('#sensitivity').value) $('#sensitivity').value = 'normal';
  const savedDrill = id ? await getGunSetting('selectedDrill', '', id) : '';
  selectedTimedDrillId = currentDrill(savedDrill) ? savedDrill : '';
  audioPreferences = normalizeAudioPreferences(id ? await getGunSetting('audioPreferences', {}, id) : {});
  calibration = id ? await getCalibrationExamples(id) : [];
  const storedLabels = id ? await getGunSetting('enabledSoundLabels', null, id) : null;
  enabledSoundLabels = storedLabels ? normalizeEnabledLabels(storedLabels) : initialEnabledLabels(examples);
  processingReport = null;
  await loadDevicePreferences();
  const select = $('#drillSelect');
  select.replaceChildren(new Option('Free listening (no sequence)', ''));
  for (const drill of [...DRILLS, ...customDrills]) select.add(new Option(drill.title, drill.id));
  select.value = ''; // Free listening and the saved timed preset have separate state.
  latestEventId = null;
  $('#predictionCard').classList.add('hidden');
  $('#predictionEmpty').classList.remove('hidden');
  $('#sessionTimeline').replaceChildren();
  $('#eventCounter').textContent = '0 detected · 0 discarded';
  customEditorId = null;
  customSteps = [];
  $('#customDrillForm').reset();
  $('#customDrillSteps').replaceChildren();
  selectDrillCollection(false);
  renderGunControls();
  renderClassCards();
  renderDrillCatalog();
  renderCustomCatalog();
  resetDrill();
  renderPreferences();
  await renderHome();
}

function openGunSetup(gun = null) {
  if (profileLocked()) return;
  setupGunId = gun?.id ?? null;
  $('#gunForm').reset();
  $('#gunName').value = gun?.name ?? '';
  $('#gunType').value = gun?.type ?? '';
  document.querySelectorAll('[name="gunTypeChoice"]').forEach(input => { input.checked = input.value === gun?.type; });
  $('#gunSetupTitle').textContent = gun?.needsDetails ? 'Name your existing gun' : gun ? 'Edit gun' : guns.length ? 'Add your gun' : 'Add your first gun';
  $('#gunSetupDescription').textContent = gun?.needsDetails
    ? 'Your learned sounds and recognition history have been preserved together. Add the name and type of the gun they belong to.'
    : gun ? 'Update the name or type. This gun’s learned sounds, presets and history stay saved.'
    : 'Give this gun a name and type. Its learned sounds, presets and history will be saved separately on this device.';
  $('#saveGunBtn').textContent = gun ? 'Save Changes' : 'Save Gun & Continue';
  $('#cancelGunSetupBtn').classList.toggle('hidden', !activeGun || activeGun.needsDetails);
  switchView('gunSetup');
  $('#gunName').focus();
}

async function renderGunLibrary() {
  guns = await getGuns();
  $('#gunCapacity').textContent = `${guns.length} of ${MAX_GUNS} guns saved · Saved on this device`;
  $('#addGunBtn').disabled = guns.length >= MAX_GUNS;
  $('#addGunBtn').textContent = guns.length >= MAX_GUNS ? '5 of 5 guns saved' : '+ Add gun';
  const host = $('#gunList');
  host.replaceChildren();
  for (const gun of guns) {
    const samples = await getExamples(gun.id);
    const presets = await getCustomDrills(gun.id);
    const readySounds = Object.values(trainingCounts(samples)).filter(count => count >= MIN_EXAMPLES_PER_CLASS).length;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'gun-card';
    card.dataset.gunId = gun.id;
    card.setAttribute('aria-pressed', String(gun.id === activeGun?.id));
    const name = document.createElement('strong'); name.className = 'gun-card-name'; name.textContent = gun.name || 'Existing gun — add details';
    const type = document.createElement('span'); type.className = 'gun-card-type'; type.textContent = gun.type || 'Choose gun type';
    const triggerTrained = trainingCounts(samples).trigger >= MIN_EXAMPLES_PER_CLASS;
    const state = document.createElement('span'); state.className = `gun-readiness${triggerTrained ? ' ready' : ''}`; state.textContent = `${triggerTrained ? 'Trigger ready' : 'Learn trigger'} · ${readySounds - (triggerTrained ? 1 : 0)} optional sounds ready · ${samples.length} samples`;
    const presetCount = document.createElement('span'); presetCount.className = 'gun-preset-count'; presetCount.textContent = `${presets.length} custom presets`;
    const heading = document.createElement('span'); heading.className = 'gun-card-head';
    const image = document.createElement('img'); image.className = 'gun-type-image'; image.src = gunImagePath(gun.type); image.width = 96; image.height = 56; image.alt = '';
    const details = document.createElement('span'); details.className = 'gun-card-details'; details.append(name, type); heading.append(image, details);
    if (gun.id === activeGun?.id) { const selected = document.createElement('span'); selected.className = 'gun-selected'; selected.textContent = 'Selected'; heading.append(selected); }
    const status = document.createElement('span'); status.className = 'gun-card-status'; status.append(state, presetCount);
    card.append(heading, status);
    card.addEventListener('click', () => selectGunProfile(gun.id).catch(showError));
    const profile = document.createElement('article'); profile.className = 'gun-profile';
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'text-button edit-gun'; edit.textContent = 'Edit gun'; edit.dataset.editGunId = gun.id;
    edit.setAttribute('aria-label', `Edit ${gun.name || 'existing gun'}`);
    edit.disabled = profileLocked();
    edit.addEventListener('click', () => openGunSetup(gun));
    profile.append(card, edit); host.append(profile);
  }
}

async function selectGunProfile(id) {
  if (profileLocked()) return;
  profileLoading = true;
  renderLiveButton();
  try {
    await eventQueue;
    await sessionController.flush();
    await practiceController.flush();
    await setActiveGun(id);
    await loadActiveGun();
    $('#safetyAck').checked = false;
    $('#safetyAck').dispatchEvent(new Event('change'));
  } finally { profileLoading = false; renderClassCards(); renderLiveButton(); }
  if (activeGun?.needsDetails) openGunSetup(activeGun);
  else switchView('home');
}

async function submitGun(event) {
  event.preventDefault();
  if (profileLocked()) return;
  const name = $('#gunName').value.trim();
  const type = $('#gunType').value;
  if (!name) { setMessage('Enter a gun name.'); $('#gunName').focus(); return; }
  setBusy(true);
  $('#saveGunBtn').disabled = true;
  try {
    const editing = !!setupGunId;
    const completingLegacy = editing && activeGun?.id === setupGunId && activeGun.needsDetails;
    if (editing) await updateGun(setupGunId, {name, type});
    else await createGun({name, type});
    await loadActiveGun();
    setBusy(false);
    switchView(editing && !completingLegacy ? 'guns' : 'home');
    setStatus('Gun saved');
  } catch (error) { showError(error); }
  finally { setBusy(false); $('#saveGunBtn').disabled = false; }
}

function selectDrillCollection(custom) {
  $('#builtInDrillsTab').setAttribute('aria-pressed', String(!custom));
  $('#customDrillsTab').setAttribute('aria-pressed', String(custom));
  $('#drillCatalog').classList.toggle('hidden', custom);
  $('#newCustomDrillBtn').classList.toggle('hidden', !custom);
  $('#customDrillCatalog').classList.toggle('hidden', !custom);
  $('#customDrillForm').classList.add('hidden');
}
async function chooseDrill(id) {
  if (profileLocked() || !activeGun || activeGun.needsDetails) return;
  const drill = currentDrill(id);
  if (!drill) return;
  preferencePending = true;
  renderLiveButton(); renderClassCards();
  try {
    await setGunSetting('selectedDrill', id, activeGun.id);
    selectedTimedDrillId = id;
  } catch (error) { showError(error); return; }
  finally { preferencePending = false; renderLiveButton(); renderClassCards(); }
  sessionController.open(drill).catch(showError);
}
function renderCustomCatalog() {
  const host = $('#customDrillCatalog');
  host.replaceChildren();
  if (!customDrills.length) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = 'No custom drills for this gun yet. Choose Create Custom Drill to add a sequence.'; host.append(empty); }
  for (const [index, drill] of customDrills.entries()) {
    const card = drillCard({drill, index, titleFor, onChoose: () => chooseDrill(drill.id)});
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'button secondary'; edit.textContent = 'Edit sequence'; edit.addEventListener('click', () => openCustomEditor(drill)); card.append(edit); host.append(card);
  }
}
function openCustomEditor(drill = null) {
  if (profileLocked() || !activeGun || activeGun.needsDetails) return;
  customEditorId = drill?.id ?? null;
  customSteps = [...(drill?.steps ?? [])];
  $('#customDrillName').value = drill?.title ?? '';
  $('#customDrillEditorTitle').textContent = drill ? 'Edit drill' : 'Create a drill';
  $('#customDrillForm').classList.remove('hidden');
  renderCustomSteps();
  $('#customDrillName').focus();
}
function renderCustomSteps() {
  const host = $('#customDrillSteps'); host.replaceChildren();
  customSteps.forEach((label, index) => {
    const item = document.createElement('li'); item.className = 'custom-step';
    const name = document.createElement('span'); name.className = 'custom-step-name'; name.textContent = `${index + 1}. ${titleFor(label)}`;
    const controls = document.createElement('span'); controls.className = 'custom-step-controls';
    for (const [action, text, disabled] of [['up', '↑', index === 0], ['down', '↓', index === customSteps.length - 1], ['remove', '×', false]]) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.disabled = disabled; button.dataset.stepAction = action;
      button.setAttribute('aria-label', `${action === 'remove' ? 'Remove' : 'Move ' + action} action ${index + 1}`);
      button.addEventListener('click', () => { if (profileLocked()) return; if (action === 'remove') customSteps.splice(index, 1); else { const to = index + (action === 'up' ? -1 : 1); [customSteps[index], customSteps[to]] = [customSteps[to], customSteps[index]]; } renderCustomSteps(); });
      controls.append(button);
    }
    item.append(name, controls); host.append(item);
  });
  $('#addCustomActionBtn').disabled = customSteps.length >= 32;
  $('#saveCustomDrillBtn').disabled = customSteps.length === 0;
}
async function submitCustomDrill(event) {
  event.preventDefault();
  if (profileLocked()) return;
  const gunId = ownerId();
  setBusy(true);
  try {
    const drill = normalizeCustomDrill({id: customEditorId || `custom-${crypto.randomUUID()}`, title: $('#customDrillName').value, steps: customSteps});
    await saveCustomDrill(drill, gunId);
    customDrills = await getCustomDrills(gunId);
    const selected = $('#drillSelect').value;
    const select = $('#drillSelect'); select.replaceChildren(new Option('Free listening (no sequence)', ''));
    for (const definition of [...DRILLS, ...customDrills]) select.add(new Option(definition.title, definition.id));
    select.value = selected;
    renderCustomCatalog();
    resetDrill();
    $('#customDrillForm').classList.add('hidden');
    setMessage(`Custom drill saved for ${activeGun.name}.`);
  } catch (error) { showError(error); }
  finally { setBusy(false); }
}

function titleFor(label) { return labelMeta[label]?.title ?? 'Unknown sound'; }
function setStatus(text) { $('#statusPill').textContent = text; }
function setMessage(text = '') {
  $('#appMessage').textContent = text;
  $('#appMessage').classList.toggle('hidden', !text);
}
function ensureSafe(action) { return safetyGate.ensure(action); }
function setBusy(next) {
  busy = next;
  document.querySelectorAll('#singleShotBtn, #resetModelBtn, #clearHistoryBtn').forEach(button => { button.disabled = next; });
  renderLearningLocks();
  renderGunControls();
  renderPreferences();
}
function getCounts() { return trainingCounts(examples); }

function renderLearningLocks() {
  const counts = getCounts(), locked = profileLocked() || !activeGun || activeGun.needsDetails;
  document.querySelectorAll('.class-card[data-sound-label]').forEach(card => {
    const count = counts[card.getAttribute('data-sound-label')] || 0;
    card.querySelector('.record-example').disabled = locked || count >= MAX_EXAMPLES_PER_CLASS;
    card.querySelector('.reset-class').disabled = locked || !count;
  });
}

function renderClassCards() {
  const host = $('#classCards');
  host.replaceChildren();
  const optionalHost = $('#optionalClassCards');
  optionalHost.replaceChildren();
  const counts = getCounts();
  for (const label of ['trigger', ...labels.filter(label => label !== 'trigger')]) {
    const count = counts[label];
    (label === 'trigger' ? host : optionalHost).append(soundCard({
      label, meta: labelMeta[label], count,
      maxExamples: MAX_EXAMPLES_PER_CLASS,
      minExamples: MIN_EXAMPLES_PER_CLASS,
      recommendedExamples: RECOMMENDED_EXAMPLES_PER_CLASS,
      locked: profileLocked(),
      onRecord: () => recordExample(label),
      onReset: () => resetSoundProfile(label), optional: label !== 'trigger', enabled: enabledSoundLabels.includes(label),
      onToggle: enabled => toggleOptionalSound(label, enabled)
    }));
  }
  const ready = !!activeGun && !activeGun.needsDetails && triggerReady();
  $('#trainingSummary').textContent = ready
    ? `Ready to test · ${labels.map(label => `${titleFor(label)}: ${counts[label]}`).join(' · ')}`
    : `Learn at least ${MIN_EXAMPLES_PER_CLASS} trigger examples before trigger practice. Other sound types are optional.`;
  $('#listenBtn').disabled = busy || livePendingStart || !!sessionController?.locked() || !!practiceController?.locked() || (!ready && !liveSession);
  $('#singleShotBtn').disabled = profileLocked() || !ready;
  $('#homeExamples').textContent = `${counts.trigger} / ${RECOMMENDED_EXAMPLES_PER_CLASS} trigger`;
  $('#homeListenBtn').disabled = busy || !ready;
  renderCalibrationCards();
}

async function toggleOptionalSound(label, enabled) {
  if (profileLocked() || label === 'trigger') return;
  preferencePending = true;
  const previous = enabledSoundLabels;
  try {
    enabledSoundLabels = normalizeEnabledLabels(enabled ? [...new Set([...enabledSoundLabels, label])] : enabledSoundLabels.filter(item => item !== label));
    renderLiveButton(); renderClassCards();
    await setGunSetting('enabledSoundLabels', enabledSoundLabels, ownerId());
  } catch (error) { enabledSoundLabels = previous; showError(error); }
  finally { preferencePending = false; renderLiveButton(); renderClassCards(); }
}
function renderCalibrationCards() {
  const host = $('#calibrationCards'); host.replaceChildren();
  const definitions = [['reset','Trigger reset clicks','Examples of clicks that must not count as a shot.'],['noise','Other noise / handling','Background and handling sounds to reject.'],['cue','External start beep','Required only for the External beep start option.']];
  for (const [kind, title, description] of definitions) {
    const count = calibration.filter(row => row.kind === kind).length;
    const card = document.createElement('article'); card.className = 'calibration-card';
    const heading = document.createElement('h3'); heading.textContent = title;
    const text = document.createElement('p'); text.className = 'muted small'; text.textContent = `${description} ${count} / ${MAX_EXAMPLES_PER_CLASS} samples.${count >= MAX_EXAMPLES_PER_CLASS ? ' Recording limit reached; existing samples are kept.' : ''}`;
    const actions = document.createElement('div'); actions.className = 'class-actions';
    const record = document.createElement('button'); record.type = 'button'; record.className = 'button primary'; record.textContent = 'Train'; record.disabled = profileLocked() || count >= MAX_EXAMPLES_PER_CLASS;
    record.dataset.calibrationKind = kind;
    record.addEventListener('click', () => recordCalibration(kind));
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'button secondary'; reset.textContent = 'Reset'; reset.disabled = profileLocked() || !count;
    reset.addEventListener('click', async () => {
      if (profileLocked() || !confirm(`Remove ${title} calibration for this gun? Learned action sounds and all history stay saved.`)) return;
      setBusy(true);
      try { await clearCalibrationExamples(kind, ownerId()); calibration = await getCalibrationExamples(ownerId()); }
      catch (error) { showError(error); } finally { setBusy(false); renderClassCards(); }
    });
    actions.append(record, reset); card.append(heading, text, actions); host.append(card);
  }
}
async function recordCalibration(kind) {
  const gunId = ownerId();
  await capture(async () => {
    const features = await recordFeatureVector(setStatus, { audioPreferences, onProcessing: reportAudioProcessing });
    await addCalibrationExample(kind, features, gunId); calibration = await getCalibrationExamples(gunId);
    setStatus('Calibration saved'); renderClassCards();
  });
}

async function resetSoundProfile(label) {
  if (profileLocked() || !labels.includes(label)) return;
  if (!confirm(`Reset learned ${titleFor(label)} sounds only? Other sounds and recognition history will be kept.`)) return;
  setBusy(true);
  try {
    const gunId = ownerId();
    await clearExamplesForLabel(label, gunId);
    examples = await getExamples(gunId);
    setStatus(`${titleFor(label)} reset`);
    setMessage(`${titleFor(label)} examples removed for ${activeGun.name}. Other sounds, guns and history were kept.`);
  } catch(error) {showError(error);}
  finally {setBusy(false);renderClassCards();}
}

function renderDrillCatalog() {
  const host = $('#drillCatalog');
  host.replaceChildren();
  for (const [index, item] of DRILLS.entries()) {
    host.append(drillCard({
      drill: item, index, titleFor,
      onChoose: () => chooseDrill(item.id)
    }));
  }
}

function routeFor(name) { return { view: name, gunId: activeGun?.id || null,
  context: name === 'practice' ? practiceController?.routeKey() : name === 'session' ? sessionController?.routeKey() : null }; }
function resolveRoute(route) {
  if (!activeGun || activeGun.needsDetails) return routeFor(['gunSetup', 'guns', 'settings'].includes(route.view) ? route.view : 'gunSetup');
  if (route.gunId !== activeGun.id) return routeFor('home');
  if (route.view === 'practice' && (!practiceController?.routeKey() || route.context !== practiceController.routeKey())) return routeFor('drills');
  if (route.view === 'session' && (!sessionController?.routeKey() || route.context !== sessionController.routeKey())) return routeFor('drills');
  return routeFor(['home','learn','drills','session','practice','recognize','history','settings','guns','gunSetup'].includes(route.view) ? route.view : 'home');
}
function switchView(name) { return screenNavigation ? screenNavigation.navigate(routeFor(name)) : displayView(name); }
function goBack(fallback = 'home') { return screenNavigation ? screenNavigation.back(routeFor(fallback)) : switchView(fallback); }
function displayView(name) {
  if (busy || profileLoading || !['home','learn','drills','session','practice','recognize','history','settings','guns','gunSetup'].includes(name)) return;
  if (name !== 'practice' && practiceController?.hasUnsavedResults()) {
    showError(new Error('Practice results are not saved. Keep this review open and retry saving.'));
    return;
  }
  if ((!activeGun || activeGun.needsDetails) && !['gunSetup','guns','settings'].includes(name)) { openGunSetup(activeGun); return; }
  if (name === 'recognize') { $('#drillSelect').value = ''; resetDrill(); }
  activeView=name;
  document.body.dataset.view = name;
  const heading = document.querySelector(`#${name}View .section-head`);
  if (heading && !['home','guns','gunSetup'].includes(name)) {
    heading.classList.add('has-settings'); heading.append($('#settingsShortcut'));
  } else document.querySelector('.header-actions').append($('#settingsShortcut'));
  window.scrollTo({top:0,behavior:'instant'});
  document.querySelectorAll('.tab').forEach(tab=>{
    const selected=tab.dataset.view===(['session','practice'].includes(name)?'drills':name);
    tab.classList.toggle('active',selected);
    if(selected)tab.setAttribute('aria-current','page');
    else tab.removeAttribute('aria-current');
  });
  for(const view of ['home','learn','drills','session','practice','recognize','history','settings','guns','gunSetup']) $('#'+view+'View').classList.toggle('hidden',view!==name);
  $('#settingsShortcut').classList.toggle('active',name==='settings');
  if(name==='settings')$('#settingsShortcut').setAttribute('aria-current','page');
  else $('#settingsShortcut').removeAttribute('aria-current');
  setMessage();
  if(name==='history')renderHistory().catch(showError);
  if(name==='home')renderHome().catch(showError);
  if(name==='guns')renderGunLibrary().catch(showError);
  if(name==='settings')renderPreferences();
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
  const drill = currentDrill($('#drillSelect').value);
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
  $('#drill-heading').textContent = 'Drill Session';
  $('#drillProgressBadge').textContent = `Step ${(state?.stepIndex ?? 0) + 1} / ${drill.steps.length}`;
  $('#drillExplanation').textContent = 'Detect the ordered sound sequence below. Counts reflect acoustic recognition, not verified physical actions.';
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
  drillState = id ? createDrillState(id, customDrills) : null;
  renderDrill();
}

function recordDrillPrediction(result) {
  if (!drillState) return null;
  const before = drillState;
  const after = advanceDrill(before, result.label, customDrills);
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
  if (profileLocked() || !activeGun || activeGun.needsDetails || !ensureSafe(() => capture(action))) return;
  setMessage();
  setBusy(true);
  try { await action(); }
  catch (error) { showError(error); }
  finally { setBusy(false); renderClassCards(); }
}

async function recordExample(label) {
  const gunId = ownerId();
  await capture(async () => {
    const features = await recordFeatureVector(setStatus, { audioPreferences, onProcessing: reportAudioProcessing });
    await addExample(label, features, gunId);
    examples = await getExamples(gunId);
    setStatus(`${titleFor(label)} saved`);
  });
}

function showRecognition(result, event) {
  latestEventId = event?.id ?? null;
  $('#verifyLatestBtn').disabled = !event;
  $('#latestActual').disabled = !event;
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

async function savePrediction(features, token = null, gunId = ownerId(), prediction = undefined) {
  const result = prediction === undefined ? classify(examples, features, recognitionOptions(calibration, enabledSoundLabels)) : prediction;
  if (!result) throw new Error('No valid training data found.');
  if (token !== null && token !== liveToken) return;
  const drillMatch = token !== null ? recordDrillPrediction(result) : null;
  const event = await addEvent({
    label: result.label, score: result.score,
    ...(drillMatch ? { drillId: drillMatch.id, drillOutcome: drillMatch.outcome,
      drillPosition: drillMatch.position, drillCompleted: drillMatch.completed } : {}),
  }, gunId);
  if (token !== null && token !== liveToken) return;
  if (drillMatch) { drillState = drillMatch.after; renderDrill(); }
  showRecognition(result, event);
  setStatus(token !== null ? 'Listening · microphone active' : (result.label ? `Matched ${titleFor(result.label)}` : 'Unknown / unclear'));
  if (token !== null) {
    if (!event) {
      ignoredEventCount += 1;
      $('#eventCounter').textContent = `${sessionEventCount} detected · ${ignoredEventCount} discarded`;
      return;
    }
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
  if (!triggerReady()) {
    switchView('learn');
    setMessage(`Record at least ${MIN_EXAMPLES_PER_CLASS} trigger examples before trying recognition. Other sound types are optional.`);
    return;
  }
  const gunId = ownerId();
  await capture(async () => {
    const features = await recordFeatureVector(setStatus, { audioPreferences, onProcessing: reportAudioProcessing });
    await savePrediction(features, null, gunId);
  });
}

function renderLiveButton() {
  const listening = !!liveSession;
  const timed = !!sessionController?.locked() || !!practiceController?.locked();
  $('#listenBtn').textContent = listening ? 'Stop listening' : 'Start continuous listening';
  $('#listeningIndicator').textContent = listening ? '● Microphone active — listening for the next sound' : (livePendingStart ? 'Connecting microphone…' : 'Microphone inactive');
  $('#listeningIndicator').classList.toggle('is-live', listening);
  $('#listenBtn').classList.toggle('listening', listening);
  $('#sensitivity').disabled = listening || livePendingStart || profileLoading || timed;
  $('#drillSelect').disabled = listening || livePendingStart || profileLoading || timed;
  $('#resetDrillBtn').disabled = listening || livePendingStart;
  const ready = triggerReady();
  $('#listenBtn').disabled = busy || profileLoading || livePendingStart || timed || (!ready && !listening);
  $('#singleShotBtn').disabled = listening || busy || profileLoading || livePendingStart || timed || !ready;
  document.querySelectorAll('#resetModelBtn, #clearHistoryBtn').forEach(button => {
    button.disabled = busy || profileLoading || listening || livePendingStart || timed;
  });
  renderLearningLocks();
  renderGunControls();
  renderPreferences();
  practiceController?.refresh();
  document.querySelectorAll('#practiceCatalog button').forEach(button => { button.disabled = profileLocked(); });
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
  if (profileLocked() || !activeGun || activeGun.needsDetails || !ensureSafe(() => toggleLive())) return;
  if (!triggerReady()) {
    switchView('learn');
    setMessage(`Learn at least ${MIN_EXAMPLES_PER_CLASS} trigger examples first. Other sounds are optional.`);
    return;
  }
  const token = ++liveToken;
  const gunId = ownerId();
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
      audioPreferences,
      onProcessing: reportAudioProcessing,
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
          let prediction;
          try { prediction = recognizeRecording(examples, pcm, sampleRate, recognitionOptions(calibration, enabledSoundLabels)); }
          catch (error) {
            ignoredEventCount += 1;
            $('#eventCounter').textContent = `${sessionEventCount} detected · ${ignoredEventCount} discarded`;
            return;
          } // Ignore clipped/unclear candidate transients without stopping.
          await savePrediction(null, token, gunId, prediction);
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
  const gunId = activeGun?.id;
  const rows = gunId ? await getEvents(gunId) : [];
  if (gunId !== activeGun?.id) return;
  const stats = evaluateEvents(rows);
  $('#homeEvents').textContent = String(rows.length);
  $('#homeAccuracy').textContent = stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`;
}

async function renderHistory() {
  const gunId = activeGun?.id;
  const rows = gunId ? await getEvents(gunId) : [];
  if (gunId !== activeGun?.id) return;
  const sessions = await sessionController.renderSavedSessions(gunId);
  if (gunId !== activeGun?.id) return;
  progressView.render(sessions || [], gunId);
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
    const historicalDrillTitle = row.drillTitle || currentDrill(row.drillId)?.title;
    if (row.drillId && historicalDrillTitle) {
      const drillDescription = document.createElement('p');
      drillDescription.textContent = `${historicalDrillTitle} · ${row.drillCompleted ? 'Sequence recognized ✓' : row.drillOutcome === 'incorrect' ? 'Out of order' : row.drillOutcome === 'unknown' ? 'Unknown sound' : 'Step detected'}`;
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
      try { await verifyEvent(row.id, actual.value || null, gunId); await renderHistory(); }
      catch (error) { showError(error); }
    });
    controls.append(actualLabel, actual, score);
    item.append(copy, controls);
    host.append(item);
  }
}

async function init() {
  configureNumberInputs(document);
  progressView = createProgressView(document);
  screenNavigation = createScreenNavigation({ history: window.history, events: window, initial: routeFor('home'), resolve: resolveRoute,
    show: route => displayView(route.view), canLeave: () => !busy && !profileLoading && !preferencePending && !practiceController?.hasUnsavedResults() && !sessionController?.hasUnsavedResults(),
    beforeLeave: async () => { safetyGate?.cancel(); if (liveSession || livePendingStart) await stopLive();
      if (sessionController?.locked()) await sessionController.interrupt('navigation');
      if (practiceController?.locked()) await practiceController.interrupt('navigation'); }, onError: showError });
  safetyGate = createSafetyGate({ dialog: $('#safetyModal'), checkbox: $('#safetyModalAck'), confirmButton: $('#safetyConfirmBtn'), cancelButton: $('#safetyCancelBtn'),
    isConfirmed: () => $('#safetyAck').checked, confirmState: () => { $('#safetyAck').checked = true; $('#safetyAck').dispatchEvent(new Event('change')); },
    identity: () => `${activeGun?.id}|${activeView}`, onError: showError });
  practiceController = createPracticeController({ getContext: practiceContext, titleFor, ensureSafe, onNavigate: switchView, onBack: () => goBack('drills'),
    onError: showError, onStatus: setStatus, onChange: () => { renderLiveButton(); renderClassCards(); }, onProcessing: reportAudioProcessing,
    vibrationEnabled: () => vibrationFeedback && !vibrationRejected, onVibration: reportVibration });
  practiceController.renderCatalog();
  sessionController = createSessionController({
    getContext: practiceContext,
    titleFor, ensureSafe, onNavigate: switchView, onBack: () => goBack('drills'), onError: showError, onStatus: setStatus,
    onChange: () => { renderLiveButton(); renderClassCards(); },
    onProcessing: reportAudioProcessing, vibrationEnabled: () => vibrationFeedback && !vibrationRejected,
    onVibration: reportVibration,
    onPracticeRecord: record => practiceController.showRecord(record),
  });
  darkPreference?.addEventListener?.('change', () => { if (appearance === 'system') applyAppearance(); });
  $('#appearance').addEventListener('change', async () => {
    const value = $('#appearance').value;
    if (!['dark', 'light', 'system'].includes(value)) return;
    try { await setSetting('appearance', value); appearance = value; applyAppearance(); } catch (error) { showError(error); renderPreferences(); }
  });
  $('#vibrationFeedback').addEventListener('change', async () => {
    if (profileLocked()) { renderPreferences(); return; }
    try { vibrationFeedback = $('#vibrationFeedback').checked; await setSetting('vibrationFeedback', vibrationFeedback); renderPreferences(); }
    catch (error) { showError(error); await loadDevicePreferences(); renderPreferences(); }
  });
  for (const [id, key] of [['noiseFilter', 'noiseFilter'], ['autoGainControl', 'autoGain']]) {
    $('#'+id).addEventListener('change', async () => {
      if (profileLocked()) { renderPreferences(); return; }
      const previous = audioPreferences;
      try {
        const gunId = ownerId();
        const next = normalizeAudioPreferences({ ...audioPreferences, [key]: $('#'+id).checked });
        preferencePending = true;
        audioPreferences = next;
        renderLiveButton(); renderClassCards();
        await setGunSetting('audioPreferences', next, gunId);
        if (gunId !== activeGun?.id) return;
        audioPreferences = next; processingReport = null; renderPreferences();
        setMessage('Saved for the next capture. Audio processing can affect recognition; collect fresh examples if needed. Existing samples were kept.');
      } catch (error) { audioPreferences = previous; showError(error); }
      finally { preferencePending = false; renderLiveButton(); renderClassCards(); }
    });
  }
  $('#gunForm').addEventListener('submit', event => { submitGun(event).catch(showError); });
  document.querySelectorAll('[name="gunTypeChoice"]').forEach(input => input.addEventListener('change', () => { if (input.checked) $('#gunType').value = input.value; }));
  $('#gunSwitcherBtn').addEventListener('click', () => { if (!profileLocked()) switchView('guns'); });
  $('#addGunBtn').addEventListener('click', () => openGunSetup());
  $('#cancelGunSetupBtn').addEventListener('click', () => switchView('guns'));
  for (const id of ['restoreGunBackupBtn', 'gunLibraryBackupBtn']) $('#'+id).addEventListener('click', () => switchView('settings'));
  $('#builtInDrillsTab').addEventListener('click', () => selectDrillCollection(false));
  $('#customDrillsTab').addEventListener('click', () => selectDrillCollection(true));
  $('#newCustomDrillBtn').addEventListener('click', () => openCustomEditor());
  $('#addCustomActionBtn').addEventListener('click', () => { if (profileLocked()) return; if (customSteps.length < 32) customSteps.push($('#customAction').value); renderCustomSteps(); });
  $('#cancelCustomDrillBtn').addEventListener('click', () => $('#customDrillForm').classList.add('hidden'));
  $('#customDrillForm').addEventListener('submit', event => { submitCustomDrill(event).catch(showError); });
  document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => switchView(tab.dataset.view)));
  document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => goBack()));
  $('#homeHistoryBtn').addEventListener('click', () => switchView('history'));
  $('#settingsShortcut').addEventListener('click', () => switchView('settings'));
  $('#changeDrillBtn').addEventListener('click', () => switchView('drills'));
  $('#freeListenBtn').addEventListener('click', () => { if (!profileLocked()) switchView('recognize'); });
  renderDrillCatalog();
  $('#listenBtn').addEventListener('click', toggleLive);
  $('#drillSelect').addEventListener('change', () => { if (profileLocked()) return; resetDrill(); setGunSetting('selectedDrill', $('#drillSelect').value, ownerId()).catch(showError); });
  $('#sensitivity').addEventListener('change', () => { if (profileLocked()) return; setGunSetting('sensitivity', $('#sensitivity').value, ownerId()).catch(showError); });
  $('#resetDrillBtn').addEventListener('click', resetDrill);
  resetDrill();
  $('#homeLearnBtn').addEventListener('click', () => switchView('learn'));
  $('#homeDrillsBtn').addEventListener('click', () => switchView('drills'));
  $('#homeListenBtn').addEventListener('click', () => switchView('recognize'));
  $('#importBtn').addEventListener('click', () => $('#importFile').click());
  $('#exportBtn').addEventListener('click', async () => {
    try {
      await sessionController.flush();
      await practiceController.flush();
      const data = JSON.stringify(await exportBackup(), null, 2);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `dry-fire-with-ease-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
    if (profileLocked()) { setMessage('Finish recording or stop listening before importing a backup.'); return; }
    if (file.size > 10 * 1024 * 1024) { setMessage('Backup is too large (maximum 10 MB).'); return; }
    if (!confirm('Replace the complete gun library, learned sounds, custom presets, preferences, recognition history and saved drill sessions with this backup? Older backups contain no sessions and will remove current saved sessions.')) return;
    setBusy(true);
    try {
      await eventQueue;
      await sessionController.flush();
      await practiceController.flush();
      const result = await restoreBackup(JSON.parse(await file.text()));
      await loadActiveGun();
      await renderHistory();
      setBusy(false);
      if (!activeGun || activeGun.needsDetails) openGunSetup(activeGun);
      else switchView('home');
      setMessage(`Restored ${result.guns} gun profiles, ${result.examples} sound examples, ${result.events} recognition results and ${result.sessions} saved drill sessions.`);
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
      await verifyEvent(latestEventId, actual, ownerId());
      setMessage('Verification saved. See History for accuracy statistics.');
    } catch (error) { showError(error); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (liveSession || livePendingStart)) void stopLive();
    if (document.hidden && sessionController.locked()) sessionController.interrupt('background').catch(showError);
    if (document.hidden && practiceController.locked()) practiceController.interrupt('background').catch(showError);
  });
  window.addEventListener('pagehide', () => {
    if (liveSession || livePendingStart) void stopLive();
    if (sessionController.locked()) sessionController.interrupt('pagehide').catch(() => {});
    if (practiceController.locked()) practiceController.interrupt('pagehide').catch(() => {});
  });
  $('#safetyAck').addEventListener('change', () => {
    $('#safetySummaryState').textContent = $('#safetyAck').checked ? 'Confirmed for this session' : 'Required before recording';
    if (!$('#safetyAck').checked && (liveSession || livePendingStart)) void stopLive();
    if (!$('#safetyAck').checked && sessionController.locked()) sessionController.interrupt('safety-check').catch(showError);
    if (!$('#safetyAck').checked && practiceController.locked()) practiceController.interrupt('safety-check').catch(showError);
  });
  $('#resetModelBtn').addEventListener('click', async () => {
    if (profileLocked() || !activeGun || activeGun.needsDetails || !confirm(`Reset all learned sounds and reset/noise/beep calibration for ${activeGun.name}? Gun profiles, presets, saved sessions, recognition history and other guns will be kept.`)) return;
    setBusy(true);
    try {
      await clearExamples(ownerId());
      examples = [];
      calibration = [];
      $('#modelNotice').classList.add('hidden');
      setStatus('All learned sounds reset');
      setMessage(`All learned sounds for ${activeGun.name} were reset. Other guns and recognition history were kept.`);
      $('#soundResetOutcome').textContent = `All learned sounds and calibration for ${activeGun.name} were reset. Saved guns, presets and history were kept.`;
      renderDrillCatalog();
      renderCustomCatalog();
      await renderHome();
    } catch (error) { showError(error); }
    finally { setBusy(false); renderClassCards(); }
  });
  $('#resetLibraryBtn').addEventListener('click', async () => {
    if (profileLocked() || !confirm('Delete ALL guns and app data from this browser? This removes every gun, learned sound, calibration, preset, setting, recognition result and saved session. Export a backup first. This cannot be undone without a backup.')) return;
    setBusy(true);
    try {
      await eventQueue;
      await sessionController.flush();
      await practiceController.flush();
      await resetLibrary();
      window.location.reload();
    } catch (error) { showError(error); setBusy(false); }
  });
  $('#clearHistoryBtn').addEventListener('click', async () => {
    if (profileLocked() || !activeGun || activeGun.needsDetails || !confirm(`Delete recognition history for ${activeGun.name}? Other guns and learned sounds will be kept.`)) return;
    setBusy(true);
    try {
      await clearEvents(ownerId());
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
    if (profileLocked()) return;
    try { const max = readNumberInput(event.target); const gunId = ownerId(); await setGunSetting('maxResults', max, gunId); await trimEvents(max, gunId); await renderHistory(); }
    catch (error) { showError(error); }
  });
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
  $('#installStatus').textContent = standalone
    ? 'Installed: you are using the Home Screen app.'
    : 'Not yet installed. Follow these steps to put it on your Home Screen.';
  $('#deviceCheck').textContent = `${window.isSecureContext ? 'Secure connection' : 'Insecure connection — microphone may be blocked'} · ${navigator.mediaDevices?.getUserMedia ? 'Microphone API available' : 'Microphone API unavailable'} · Local storage only`;
  const recovered = [];
  for (const gun of await getGuns()) recovered.push(...await recoverInterruptedSessions(gun.id));
  await loadActiveGun();
  renderLiveButton();
  if (!activeGun || activeGun.needsDetails) openGunSetup(activeGun);
  else switchView('home');
  const recoveredForGun = recovered.find(record => record.gunId === activeGun?.id);
  if (recoveredForGun && !activeGun?.needsDetails) {
    if (recoveredForGun.kind === 'practice') practiceController.showRecord(recoveredForGun);
    else sessionController.showRecord(recoveredForGun);
  }
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
