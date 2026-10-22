import { recognitionRows, evaluationPresentation } from '../apps/web/src/features/history/presentation.ts';
import { afterPaint } from './afterPaint.js';
import { createModulePreparation } from './modulePreparation.js';
import {distancePresentation,liveDrillPresentation} from '../apps/web/src/features/live-listen/presentation.ts';
import { preferencePresentation } from '../apps/web/src/features/settings/preferencePresentation.ts';
import { resolveRouteView } from '@dryfire/web/route-context';
import { createInformationBridge } from '@dryfire/web/information-bridge';
import { PAGE_IDS } from './pageDefinitions.js';
import { createPracticeGuideBridge } from './practiceGuideBridge.js';
import { recordFeatureVector, startContinuousListening } from './audio.js';
import { recognizeRecording } from './recognition.js';
import { DRILLS, SEQUENCE_DRILLS, advanceDrill, createDrillState, getDrill } from './drills.js';
import { calibrationProgress } from '@dryfire/ui/calibration-copy';
import { soundCard, drillCard } from './uiComponents.js';
import { readNumberInput } from './inputLimits.js';
import { createSafetyGate } from './safetyGate.js';
import { CAPABILITIES as BUILD_CAPABILITIES } from './buildEdition.js';
import { createCustomDrillEditor } from './optional/customDrillEditor.js';
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
  getGuns, createGun, updateGun, deleteGun, getActiveGun, setActiveGun, resetLibrary, clearSessions,
  getGunSetting, setGunSetting, getCustomDrills, saveCustomDrill,
  getSetting, setSetting, recoverInterruptedSessions,
  getCalibrationExamples, addCalibrationExample, clearCalibrationExamples,
} from './storage.js';
import {materializeStaticCatalog} from './staticCatalog.js';

const labelMeta = {
  draw: { title: 'Draw from holster', description: 'Holster release and presentation sounds', tone: 'blue' },
  rack: { title: 'Rack slide', description: 'Slide movement and return', tone: 'green' },
  trigger: { title: 'Trigger pull', description: 'Dry trigger click', tone: 'orange' },
  reload: { title: 'Change magazine', description: 'Magazine removal and insertion', tone: 'purple' },
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
let customEditor = null;
let profileLoading = false;
let audioPreferences = normalizeAudioPreferences();
let appearance = 'dark';
let vibrationFeedback = false;
let vibrationRejected = false;
let processingReport = null;
let preferencePending = false;
let sessionController = null;
let practiceController = null;
let practiceGuideController = null;
let safetyGate = null;
let progressView = null;
let CAPABILITIES = BUILD_CAPABILITIES;
let previewTesting = null;
let screenNavigation = null;
let historyRenderToken = 0;
let homeRenderToken = 0;
let homePage, homePagePending, profilePages, gunSetupPage;
let settingsPage;
let learnPage;
let livePage;
let drillsPage;
let historyPage, historyOwner, historyRows=[], historySessions=[];
const preparePageModule=createModulePreparation(showError);
const guideHandlers=new Map();
const historyHandlers=new Map();
function historyDisabled(id,disabled){if(historyPage)historyPage.update({disabled:{[id]:disabled}});else $('#'+id).disabled=disabled;}
function historyText(id,text){if(historyPage)historyPage.update({texts:{[id]:text}});else $('#'+id).textContent=text;}
function bindHistory(id,handler){historyHandlers.set(id,handler);$('#'+id).addEventListener('click',handler);}
const liveHandlers=new Map();
const settingsHandlers = new Map();
function liveText(id,text){if(livePage)livePage.update({texts:{[id]:text}});else $('#'+id).textContent=text;}
function liveDisabled(id,disabled){if(livePage)livePage.update({disabled:{[id]:disabled}});else $('#'+id).disabled=disabled;}
function liveValue(id,value){if(livePage)livePage.update({selects:{[id]:value}});else $('#'+id).value=value;}
function liveHidden(id,hidden){if(livePage)livePage.update({hidden:{[id]:hidden}});else $('#'+id).classList.toggle('hidden',hidden);}
function liveClass(id,name,enabled){if(livePage)livePage.update({listening:enabled});else $('#'+id).classList.toggle(name,enabled);}
function liveLevel(width){if(livePage)livePage.setLevel(width);else $('#meterFill').style.width=width;}
function clearLiveTimeline(){if(livePage)livePage.update({timeline:[]});else $('#sessionTimeline').replaceChildren();}
function renderLiveOptions(selected=''){
 const options=[{value:'',title:'Free listening (no sequence)'},...[...DRILLS,...customDrills].map(drill=>({value:drill.id,title:drill.title}))];
 if(livePage){livePage.update({options,selects:{drillSelect:selected}});return;}
 const select=$('#drillSelect');select.replaceChildren(...options.map(option=>new Option(option.title,option.value)));select.value=selected;
}
function bindLive(id,type,handler){liveHandlers.set(id,handler);$('#'+id).addEventListener(type,handler);}
function bindSettings(id,type,handler){settingsHandlers.set(id,handler);$('#'+id).addEventListener(type,handler);}
function settingsText(id,text){if(settingsPage)settingsPage.update({texts:{[id]:text}});else $('#'+id).textContent=text;}
function settingsDisabled(id,disabled){if(settingsPage)settingsPage.update({disabled:{[id]:disabled}});else $('#'+id).disabled=disabled;}
let gunLibraryPage;
let gunLibraryToken = 0;
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
  const [saved, vibration] = await Promise.all([getSetting('appearance', 'dark'), getSetting('vibrationFeedback', false)]);
  appearance = ['dark', 'light', 'system'].includes(saved) ? saved : 'dark';
  vibrationFeedback = vibration === true;
  vibrationRejected = false;
  applyAppearance();
}
function renderPreferences() {
  previewTesting?.render();
  const view=preferencePresentation({capabilities:getAudioCapabilities(),audioPreferences,processingReport,appearance,
    gunAvailable:!!activeGun && !activeGun.needsDetails,locked:profileLocked(),deviceLocked:busy || profileLoading || preferencePending,
    vibrationFeedback,vibrationSupported:getVibrationCapability(),vibrationRejected});
  if(settingsPage){settingsPage.update({preferences:view});return;}
  for(const item of view.audio){
    const input=$('#'+item.inputId);input.checked=item.checked;input.disabled=item.disabled;$('#'+item.statusId).textContent=item.status;
  }
  $('#appearance').value=view.appearance.value;$('#appearance').disabled=view.appearance.disabled;
  $('#vibrationFeedback').checked=view.vibration.checked;$('#vibrationFeedback').disabled=view.vibration.disabled;
  $('#vibrationStatus').textContent=view.vibration.status;
}
function reportAudioProcessing(report) { processingReport = report; renderPreferences(); }
function reportVibration(result) { if (!result.supported || !result.accepted) { vibrationRejected = true; renderPreferences(); } }

function ownerId() {
  if (!activeGun || activeGun.needsDetails) throw new Error('Add your gun name and type before training.');
  return activeGun.id;
}
function profileLocked() { return busy || profileLoading || preferencePending || !!liveSession || livePendingStart || !!sessionController?.locked() || !!sessionController?.hasUnsavedResults() || !!practiceController?.locked(); }
function currentDrill(id) { return getDrill(id, customDrills); }
function renderGunControls() {
  informationPages.setNavigationDisabled(!activeGun || activeGun.needsDetails || profileLoading);
  homePage?.update({gunName:activeGun?.name || 'No gun selected',contextHidden:!activeGun || !!activeGun.needsDetails});
  $('#gunSwitcherBtn').disabled = profileLocked();
  $('#gunSwitcherBtn').classList.toggle('hidden', !activeGun || activeGun.needsDetails);
  $('#gunSwitcherBtn').title = profileLocked() ? 'Finish recording or stop listening before switching guns.' : 'Choose another gun';
  $('#gunSwitcherBtn').setAttribute('aria-label', activeGun?.name ? `Switch gun. Selected: ${activeGun.name}, ${activeGun.type || 'type not set'}` : 'Choose a gun');
  $('#activeGunName').textContent = activeGun?.name || 'Your gun';
  $('#activeGunType').textContent = activeGun?.type || 'Add profile details';
  $('#activeGunImage').src = gunImagePath(activeGun?.type);
  settingsText('soundResetSummary',activeGun && !activeGun.needsDetails
    ? `${examples.length} learned samples · ${calibration.length} calibration samples for ${activeGun.name}`
    : 'Choose a gun before resetting its learned sounds.');
  settingsDisabled('resetLibraryBtn',profileLocked());
  if (gunLibraryPage) gunLibraryPage.setLocked(profileLocked());
  else {
    $('#addGunBtn').disabled = profileLocked() || guns.length >= CAPABILITIES.gunCreationLimit;
    $('#addGunBtn').classList.toggle('hidden', CAPABILITIES.edition === 'public' && guns.length >= CAPABILITIES.gunCreationLimit);
  }
  for (const id of ['clearHistoryBtn', 'clearSessionsBtn']) historyDisabled(id,profileLocked() || !activeGun || activeGun.needsDetails);
  document.querySelectorAll((homePage ? '.view:not(#homeView)' : '.view')+(settingsPage ? ':not(#settingsView)' : '')+(learnPage ? ':not(#learnView)' : '')+(livePage ? ':not(#recognizeView)' : '')+(drillsPage ? ':not(#drillsView)' : '')+(historyPage ? ':not(#historyView)' : '')+(practiceController?.hasPage() ? ':not(#practiceView)' : '')+(sessionController?.hasPage() ? ':not(#sessionView)' : '')+' .gun-context-name').forEach(span => { span.textContent = activeGun?.name || 'No gun selected'; });
  document.querySelectorAll((homePage ? '.view:not(#homeView)' : '.view')+(settingsPage ? ':not(#settingsView)' : '')+(learnPage ? ':not(#learnView)' : '')+(historyPage ? ':not(#historyView)' : '')+(practiceController?.hasPage() ? ':not(#practiceView)' : '')+(sessionController?.hasPage() ? ':not(#sessionView)' : '')+' .gun-context').forEach(row => { row.classList.toggle('hidden', !activeGun || activeGun.needsDetails); });
  sessionController?.updateContext({gunName:activeGun?.name || 'No gun selected',contextHidden:!activeGun || !!activeGun.needsDetails});
  practiceController?.updateContext({gunName:activeGun?.name || 'No gun selected',contextHidden:!activeGun || !!activeGun.needsDetails});
  settingsPage?.update({gunName:activeGun?.name || 'No gun selected',contextHidden:!activeGun || !!activeGun.needsDetails});
  learnPage?.update({gunName:activeGun?.name || 'No gun selected',contextHidden:!activeGun || !!activeGun.needsDetails});
  livePage?.update({gunName:activeGun?.name || 'No gun selected',contextHidden:!activeGun || !!activeGun.needsDetails});
  historyPage?.update({gunName:activeGun?.name || 'No gun selected',contextHidden:!activeGun || !!activeGun.needsDetails});
  drillsPage?.update({gunName:activeGun?.name || 'No gun selected',contextHidden:!activeGun || !!activeGun.needsDetails});
  if (!activeGun || activeGun.needsDetails) {settingsDisabled('resetModelBtn',true);liveDisabled('verifyLatestBtn',true);historyDisabled('clearHistoryBtn',true);}
  settingsDisabled('exportBtn',profileLocked());
  settingsDisabled('importBtn',profileLocked());
  liveDisabled("verifyLatestBtn",!latestEventId || profileLocked());
}

async function loadActiveGun() {
  historyRenderToken += 1;
  homeRenderToken += 1;
  gunLibraryToken += 1;
  sessionController?.reset();
  practiceController?.reset();
  // Independent reads share the wait; profile content renders only after loading.
  [activeGun, guns] = await Promise.all([getActiveGun(), getGuns(), loadDevicePreferences()]);
  const id = activeGun?.id;
  examples = id ? await getExamples(id) : [];
  customDrills = id ? await getCustomDrills(id) : [];
  const legacy = id ? await getOutdatedExampleCount(id) : 0;
  renderModelNotice(`${legacy} older training sample(s) use an incompatible feature format and are ignored. Reset this gun's sounds and record new samples for the updated model.`,legacy===0);
  $('#maxResults').value = id ? normalizeMaxResults(await getGunSetting('maxResults', 50, id)) : 50;
  liveValue("sensitivity",id ? await getGunSetting('sensitivity', 'normal', id) : 'normal');
  if (!$('#sensitivity').value) liveValue("sensitivity",'normal');
  const savedDrill = id ? await getGunSetting('selectedDrill', '', id) : '';
  // Preserve saved-preset validation and its read/error ordering; selection lives in the session controller.
  currentDrill(savedDrill);
  audioPreferences = normalizeAudioPreferences(id ? await getGunSetting('audioPreferences', {}, id) : {});
  calibration = id ? await getCalibrationExamples(id) : [];
  const storedLabels = id ? await getGunSetting('enabledSoundLabels', null, id) : null;
  enabledSoundLabels = storedLabels ? normalizeEnabledLabels(storedLabels) : initialEnabledLabels(examples);
  processingReport = null;
  renderLiveOptions(); // Free listening and the saved timed preset have separate state.
  latestEventId = null;
  liveHidden("predictionCard",true);
  liveHidden("predictionEmpty",false);
  clearLiveTimeline();
  liveText("eventCounter",'0 detected · 0 discarded');
  sessionEventCount = 0;
  ignoredEventCount = 0;
  historyText('historyClearOutcome','');
  historyText('sessionsClearOutcome','');
  customEditor?.reset();
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
  if (!gun && guns.length >= CAPABILITIES.gunCreationLimit) { setMessage('This version cannot create another gun. Existing saved guns remain available.'); return; }
  setupGunId = gun?.id ?? null;
  const props = {name:gun?.name ?? '',type:gun?.type ?? '',
    title:gun?.needsDetails ? 'Name your existing gun' : gun ? 'Edit gun' : guns.length ? 'Add your gun' : 'Add your first gun',
    description:gun?.needsDetails ? 'Your learned sounds and recognition history have been preserved together. Add the name and type of the gun they belong to.'
      : gun ? 'Update the name or type. This gun’s learned sounds, presets and history stay saved.'
      : 'Give this gun a name and type. Its learned sounds, presets and history will be saved separately on this device.',
    submitLabel:gun ? 'Save Changes' : 'Save Gun & Continue',cancelHidden:!activeGun || !!activeGun.needsDetails};
  if (profilePages) {
    if(gunSetupPage)gunSetupPage.reset(props);
    else gunSetupPage=profilePages.mountGunSetupPage(document,{...props,onSubmit:event=>{submitGun(event).catch(showError);},onCancel:()=>switchView('guns'),onRestore:()=>switchView('settings')});
  } else {
    $('#gunForm').reset(); $('#gunName').value=props.name; $('#gunType').value=props.type;
    document.querySelectorAll('[name="gunTypeChoice"]').forEach(input=>{input.checked=input.value===props.type;});
    $('#gunSetupTitle').textContent=props.title; $('#gunSetupDescription').textContent=props.description;
    $('#saveGunBtn').textContent=props.submitLabel; $('#cancelGunSetupBtn').classList.toggle('hidden',props.cancelHidden);
  }
  switchView('gunSetup');
  $('#gunName').focus();
}

async function loadProfilePages() { return profilePages ||= await import('../apps/web/src/app/profilePages/index.ts'); }

async function renderGunLibrary() {
  const token = ++gunLibraryToken;
  const library = await getGuns();
  if (token !== gunLibraryToken) return;
  guns = library;
  const rows = [];
  for (const gun of guns) {
    const samples = await getExamples(gun.id);
    const presets = await getCustomDrills(gun.id);
    if (token !== gunLibraryToken) return;
    const counts = trainingCounts(samples);
    const triggerTrained = counts.trigger >= MIN_EXAMPLES_PER_CLASS;
    rows.push({ gun, image: gunImagePath(gun.type), triggerReady: triggerTrained,
      optionalReady: Object.values(counts).filter(count => count >= MIN_EXAMPLES_PER_CLASS).length - (triggerTrained ? 1 : 0),
      samples: samples.length, presets: presets.length });
  }
  const pages = await loadProfilePages();
  if (token !== gunLibraryToken) return;
  const props = { rows, selectedId: activeGun?.id, locked: profileLocked(), full: CAPABILITIES.edition !== 'public', limit: CAPABILITIES.gunCreationLimit, loaded: true,
    onSelect: id => { selectGunProfile(id).catch(showError); }, onEdit: gun => openGunSetup(gun),
    onDelete: gun => { deleteGunProfile(gun).catch(showError); }, onAdd: () => openGunSetup(), onBackup: () => switchView('settings') };
  if (gunLibraryPage) gunLibraryPage.update(props);
  else gunLibraryPage = pages.mountGunsPage(document, props);
}

async function flushLibraryWork() {
  await eventQueue;
  await sessionController.flush();
  await practiceController.flush();
  if (sessionController.hasUnsavedResults() || practiceController.hasUnsavedResults()) {
    throw new Error('Session results are not saved. Retry saving before deleting data.');
  }
}

async function deleteGunProfile(gun) {
  if (profileLocked() || !confirm(`Delete ${gun.name || 'this gun'} and ALL its data? This removes its learned sounds, calibration, custom drills, settings, recognition history and saved practice/sequence sessions. Other guns stay saved. Export a backup first; this cannot be undone without one.`)) return;
  const wasSelected = activeGun?.id === gun.id;
  setBusy(true);
  gunLibraryToken += 1;
  try {
    await flushLibraryWork();
    await deleteGun(gun.id);
    if (wasSelected) {
      await loadActiveGun();
      $('#safetyAck').checked = false;
      $('#safetyAck').dispatchEvent(new Event('change'));
    } else guns = await getGuns();
    setBusy(false);
    if (!activeGun || activeGun.needsDetails) openGunSetup(activeGun);
    else { switchView('guns'); await renderGunLibrary(); }
    setStatus('Gun deleted');
    setMessage(`${gun.name || 'Gun'} and all its data were deleted. ${activeGun ? 'Other guns were kept.' : 'Add a new gun to continue.'}`);
  } finally { setBusy(false); }
}

async function selectGunProfile(id) {
  if (profileLocked()) return;
  profileLoading = true;
  renderGunControls();
  renderLiveButton();
  try {
    await eventQueue;
    await sessionController.flush();
    await practiceController.flush();
    await setActiveGun(id);
    await loadActiveGun();
    $('#safetyAck').checked = false;
    $('#safetyAck').dispatchEvent(new Event('change'));
  } finally { profileLoading = false; renderGunControls(); renderClassCards(); renderLiveButton(); }
  if (activeGun?.needsDetails) openGunSetup(activeGun);
  else switchView('home');
}

function setGunSaving(saving) { if(gunSetupPage)gunSetupPage.setSaving(saving);else $('#saveGunBtn').disabled=saving; }

async function submitGun(event) {
  event.preventDefault();
  if (profileLocked()) return;
  const name = $('#gunName').value.trim();
  const type = $('#gunType').value;
  if (!name) { setMessage('Enter a gun name.'); $('#gunName').focus(); return; }
  setBusy(true);
  setGunSaving(true);
  try {
    const editing = !!setupGunId;
    const completingLegacy = editing && activeGun?.id === setupGunId && activeGun.needsDetails;
    if (editing) await updateGun(setupGunId, {name, type});
    else await createGun({name, type}, { maxGuns: CAPABILITIES.gunCreationLimit });
    await loadActiveGun();
    setBusy(false);
    switchView(editing && !completingLegacy ? 'guns' : 'home');
    setStatus('Gun saved');
  } catch (error) { showError(error); }
  finally { setBusy(false); setGunSaving(false); }
}

function selectDrillCollection(custom){
 if(custom && !CAPABILITIES.customDrillCreation && !customDrills.length)custom=false;
 const limited=!CAPABILITIES.customDrillCreation && !customDrills.length;
 if(drillsPage)drillsPage.update({collectionHidden:limited,customTabHidden:limited,customSelected:custom,createHidden:!custom||!CAPABILITIES.customDrillCreation});
 else{
  $('#customDrillsTab').classList.toggle('hidden',limited);$('#builtInDrillsTab').parentElement.classList.toggle('hidden',limited);
  $('#builtInDrillsTab').setAttribute('aria-pressed',String(!custom));$('#customDrillsTab').setAttribute('aria-pressed',String(custom));
  $('#drillCatalog').classList.toggle('hidden',custom);$('#newCustomDrillBtn').classList.toggle('hidden',!custom||!CAPABILITIES.customDrillCreation);$('#customDrillCatalog').classList.toggle('hidden',!custom);
 }
 $('#customDrillForm').classList.add('hidden');
}
function drillCards(){return{
 builtIns:SEQUENCE_DRILLS.map(drill=>({drill,titleFor,onChoose:()=>chooseDrill(drill.id)})),
 customs:customDrills.map(drill=>({drill,titleFor,onChoose:()=>chooseDrill(drill.id),onEdit:()=>customEditor.open(drill)})),emptyCustom:!customDrills.length,
};}
async function chooseDrill(id) {
  if (profileLocked() || !activeGun || activeGun.needsDetails) return;
  const drill = currentDrill(id);
  if (!drill) return;
  preferencePending = true;
  renderLiveButton(); renderClassCards();
  try {
    await setGunSetting('selectedDrill', id, activeGun.id);
  } catch (error) { showError(error); return; }
  finally { preferencePending = false; renderLiveButton(); renderClassCards(); }
  sessionController.open(drill).catch(showError);
}
function renderCustomCatalog() {
  if(drillsPage){const view=drillCards();drillsPage.update({customs:view.customs,emptyCustom:view.emptyCustom});return;}
  const host = $('#customDrillCatalog');
  host.replaceChildren();
  if (!customDrills.length) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = 'No custom drills for this gun yet. Choose Create Custom Drill to add a sequence.'; host.append(empty); }
  for (const [index, drill] of customDrills.entries()) {
    const card = drillCard({drill, index, titleFor, onChoose: () => chooseDrill(drill.id)});
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'button secondary'; edit.textContent = 'Edit sequence'; edit.addEventListener('click', () => customEditor.open(drill)); card.append(edit); host.append(card);
  }
}
async function saveEditedCustomDrill(drill, gunId) {
  await saveCustomDrill(drill, gunId);
  customDrills = await getCustomDrills(gunId);
  const selected = $('#drillSelect').value;
  renderLiveOptions(selected);
  renderCustomCatalog(); resetDrill();
}

function titleFor(label) { return labelMeta[label]?.title ?? 'Unknown sound'; }
function setStatus(text) { informationPages.setStatus(text); }
function setMessage(text = '') {
  $('#appMessage').textContent = text;
  $('#appMessage').classList.toggle('hidden', !text);
}
function ensureSafe(action) { return safetyGate.ensure(action); }
function setBusy(next) {
  busy = next;
  settingsDisabled('resetModelBtn',next);
  liveDisabled('singleShotBtn',next);
  historyDisabled('clearHistoryBtn',next);
  renderLearningLocks();
  renderGunControls();
  renderPreferences();
}
function getCounts() { return trainingCounts(examples); }

function renderModelNotice(notice,noticeHidden){if(learnPage)learnPage.update({notice,noticeHidden});else{$('#modelNotice').textContent=notice;$('#modelNotice').classList.toggle('hidden',noticeHidden);}}
function learningProps(){
  const counts=getCounts();
  return{locked:profileLocked(),cards:['trigger',...labels.filter(label=>label!=='trigger')].map(label=>({
    label,meta:labelMeta[label],count:counts[label],maxExamples:MAX_EXAMPLES_PER_CLASS,minExamples:MIN_EXAMPLES_PER_CLASS,recommendedExamples:RECOMMENDED_EXAMPLES_PER_CLASS,locked:profileLocked(),
    onRecord:()=>recordExample(label),onReset:()=>resetSoundProfile(label),optional:label!=='trigger',enabled:enabledSoundLabels.includes(label),onToggle:enabled=>toggleOptionalSound(label,enabled),
  })),calibrationProps:{counts:Object.fromEntries(['reset','noise','cue'].map(kind=>[kind,calibration.filter(row=>row.kind===kind).length])),maximum:MAX_EXAMPLES_PER_CLASS,locked:profileLocked(),
    onRecord:kind=>{if(!profileLocked())recordCalibration(kind);},onReset:kind=>resetCalibration(kind,{reset:'Trigger reset clicks',noise:'Other noise / handling',cue:'External start beep'}[kind]),
  }};
}
function renderLearningLocks() {
  const counts = getCounts(), locked = profileLocked() || !activeGun || activeGun.needsDetails;
  if(learnPage){learnPage.update({locked});return;}
  document.querySelectorAll('.class-card[data-sound-label]').forEach(card => {
    const count = counts[card.getAttribute('data-sound-label')] || 0;
    card.querySelector('.record-example').disabled = locked || count >= MAX_EXAMPLES_PER_CLASS;
    card.querySelector('.reset-class').disabled = locked || !count;
  });
}

function renderClassCards() {
  const counts = getCounts();
  if (activeView === 'learn' && learnPage) learnPage.update(learningProps());
  else if (activeView === 'learn') {
    const host = $('#classCards');
    host.replaceChildren();
    const optionalHost = $('#optionalClassCards');
    optionalHost.replaceChildren();
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
    renderCalibrationCards();
  }
  const ready = !!activeGun && !activeGun.needsDetails && triggerReady();
  liveText("trainingSummary",ready
    ? `Ready to test · ${labels.map(label => `${titleFor(label)}: ${counts[label]}`).join(' · ')}`
    : `Learn at least ${MIN_EXAMPLES_PER_CLASS} trigger examples before trigger practice. Other sound types are optional.`);
  liveDisabled("listenBtn",busy || livePendingStart || !!sessionController?.locked() || !!practiceController?.locked() || (!ready && !liveSession));
  liveDisabled("singleShotBtn",profileLocked() || !ready);
  const training = `${counts.trigger} / ${RECOMMENDED_EXAMPLES_PER_CLASS} trigger`;
  if(homePage)homePage.update({training,listenDisabled:busy || !ready});
  else { $('#homeExamples').textContent = training; $('#homeListenBtn').disabled = busy || !ready; }
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
  if(learnPage){learnPage.update({calibrationProps:learningProps().calibrationProps});return;}
  const host=$('#calibrationCards');materializeStaticCatalog(host);
  for (const card of host.children) {
    const record = card.querySelector('[data-calibration-kind]');
    const count = calibration.filter(row => row.kind === record.dataset.calibrationKind).length;
    const text = card.querySelector('p');
    text.textContent = calibrationProgress(text.dataset.description, count, MAX_EXAMPLES_PER_CLASS);
    record.disabled = profileLocked() || count >= MAX_EXAMPLES_PER_CLASS;
    card.querySelector('.secondary').disabled = profileLocked() || !count;
  }
}
function bindCalibrationActions() {
  $('#calibrationCards').addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button || button.disabled || profileLocked()) return;
    const card = button.closest('.calibration-card');
    const kind = card.querySelector('[data-calibration-kind]').dataset.calibrationKind;
    if (button.dataset.calibrationKind) { recordCalibration(kind); return; }
    const title = card.querySelector('h3').textContent;
    await resetCalibration(kind,title);
  });
}
async function resetCalibration(kind,title){
  if(profileLocked() || !confirm(`Remove ${title} calibration for this gun? Learned action sounds and all history stay saved.`))return;
  setBusy(true);
  try{await clearCalibrationExamples(kind,ownerId());calibration=await getCalibrationExamples(ownerId());}
  catch(error){showError(error);}finally{setBusy(false);renderClassCards();}
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
  if(drillsPage){drillsPage.update({builtIns:drillCards().builtIns});return;}
  const host = $('#drillCatalog');
  host.replaceChildren();
  for (const [index, item] of SEQUENCE_DRILLS.entries()) {
    host.append(drillCard({
      drill: item, index, titleFor,
      onChoose: () => chooseDrill(item.id)
    }));
  }
}

function routeFor(name) { return { view: name, gunId: activeGun?.id || null,
  context: name === 'practiceGuide' ? practiceGuideController?.current()?.contextKey : name === 'practice' ? practiceController?.routeKey() : name === 'session' ? sessionController?.routeKey() : null }; }
function resolveRoute(route) {
  return routeFor(resolveRouteView(route, [activeGun, practiceController, sessionController, practiceGuideController]));
}
function switchView(name) { return screenNavigation ? screenNavigation.navigate(routeFor(name)) : displayView(name); }
function goBack(fallback = 'home') { return screenNavigation ? screenNavigation.back(routeFor(fallback)) : switchView(fallback); }
function displayView(name) {
  if (busy || profileLoading || !PAGE_IDS.includes(name)) return;
  if (name !== 'practice' && practiceController?.hasUnsavedResults()) {
    showError(new Error('Practice results are not saved. Keep this review open and retry saving.'));
    return;
  }
  if ((!activeGun || activeGun.needsDetails) && !['gunSetup','guns','settings','about','contact'].includes(name)) { openGunSetup(activeGun); return; }
  if (name === 'recognize') { liveValue("drillSelect",''); resetDrill(); }
  informationPages.show(name);
  if(name==='home' && document.body.dataset.view!=='loading' && !homePage && !homePagePending){
    homePagePending=loadProfilePages().then(module=>{if(!profileLocked() && !$('#safetyModal').open)homePage=module.mountHomePage($('#homeView'),view=>switchView(view));}).catch(showError).finally(()=>{homePagePending=null;});
  }
  if(name==='practice'||name==='session')void practiceGuideController.prepare().catch(()=>{});
  const previousView=activeView;
  activeView=name;
  document.body.dataset.view = name;
  window.scrollTo({top:0,behavior:'instant'});
  if(previousView!==name) document.getElementById(previousView+'View').classList.add('hidden');
  document.getElementById(name+'View').classList.toggle('hidden',false);
  setMessage();
  if(name==='practiceGuide'){
    const guideModule=preparePageModule('practiceGuide',()=>import('../apps/web/src/app/guideContents.tsx'));
    if(guideModule && !profileLocked() && !$('#safetyModal').open){
      try{practiceGuideController.connectView(guideModule.mountGuideContents);practiceGuideController.connectPage(guideModule.mountGuidePage);}catch(error){showError(error);}
    }
  }
  if(name==='session'){
    const sequenceModule=preparePageModule('session',()=>import('../apps/web/src/app/sequenceContents.tsx'));
    if(sequenceModule && !profileLocked() && !$('#safetyModal').open){
      try{sessionController.connectView(sequenceModule.mountSequenceContents);sessionController.connectPage(sequenceModule.mountSequencePage,guideHandlers.get('sessionGuideLink'));}catch(error){showError(error);}
    }
  }
  if(name==='practice'){
    const practiceModule=preparePageModule('practice',()=>import('../apps/web/src/app/practiceContents.tsx'));
    if(practiceModule && !profileLocked() && !$('#safetyModal').open){
      try{practiceController.connectView(practiceModule.mountPracticeContents);practiceController.connectPage(practiceModule.mountPracticePage,guideHandlers.get('practiceGuideLink'));}catch(error){showError(error);}
    }
  }
  if(name==='drills'){
    const drillsModule=preparePageModule('drills',()=>afterPaint(()=>import('../apps/web/src/app/drillsPage.tsx')));
    if(!drillsPage && drillsModule && !profileLocked() && !$('#safetyModal').open){
      try{drillsPage=drillsModule.mountDrillsPage($('#drillsView'),{...drillCards(),onBack:()=>goBack(),onCollection:selectDrillCollection,onCreate:()=>customEditor.open(),onFree:()=>{if(!profileLocked())switchView('recognize');}},id=>{if(!practiceController.locked())practiceController.open(id).catch(showError);});}catch(error){showError(error);}
    }
    if(drillsPage && !profileLocked() && !$('#safetyModal').open){try{customEditor.connectView(drillsModule.mountCustomDrillFields);}catch(error){showError(error);}}
  }
  if(name==='recognize'){
    const liveModule=preparePageModule('recognize',()=>import('../apps/web/src/app/liveListenPage.tsx'));
    if(!livePage && liveModule && !profileLocked() && !$('#safetyModal').open){
      try{livePage=liveModule.mountLiveListenPage($('#recognizeView'),{onBack:()=>goBack(),onAction:id=>liveHandlers.get(id)?.(),onChange:id=>liveHandlers.get(id)?.()});}catch(error){showError(error);}
    }
  }
  if(name==='learn'){
    const learnModule=preparePageModule('learn',()=>import('../apps/web/src/app/learnPage.tsx'));
    if(!learnPage && learnModule && !profileLocked() && !$('#safetyModal').open){
      try{learnPage=learnModule.mountLearnPage($('#learnView'),{...learningProps(),onBack:()=>goBack()});}catch(error){showError(error);}
    }
    renderClassCards();
  }
  if(name==='history'){
    const historyModule=preparePageModule('history',()=>import('../apps/web/src/app/historyPage.tsx'));
    if(!historyPage && historyModule && historyOwner===activeGun?.id && !profileLocked() && !$('#safetyModal').open){
      try{historyPage=historyModule.mountHistoryPage($('#historyView'),{rows:historyRows,sessions:historySessions,stats:evaluateEvents(historyRows),gunId:historyOwner},{onBack:()=>goBack(),onAction:id=>historyHandlers.get(id)?.(),onOpen:record=>sessionController.openSavedRecord(record),onVerify:async(id,value,gunId)=>{try{await verifyEvent(id,value||null,gunId);await renderHistory();}catch(error){showError(error);}},titleFor,drillTitleFor:id=>currentDrill(id)?.title,labels,actual:ACTUAL_CLASSES,predicted:PREDICTED_CLASSES});}catch(error){showError(error);}
    }
    if(historyPage && !profileLocked() && !$('#safetyModal').open){try{progressView?.prepare();}catch(error){showError(error);}}
    renderHistory().catch(showError);
  }
  if(name==='home')renderHome().catch(showError);
  if(name==='guns')renderGunLibrary().catch(showError);
  if(name==='settings'){
    const settingsModule=preparePageModule('settings',()=>afterPaint(()=>import('../apps/web/src/app/settingsPage.tsx')));
    if(!settingsPage && settingsModule && !profileLocked() && !$('#safetyModal').open){
      try{settingsPage=settingsModule.mountSettingsPage($('#settingsView'),{onBack:()=>goBack(),onAction:id=>settingsHandlers.get(id)?.(),onPreference:id=>settingsHandlers.get(id)?.()});}
      catch(error){showError(error);}
    }
    renderPreferences();
  }
}

function renderDistances(distances){
 const rows=distancePresentation(labels,distances,titleFor);
 if(livePage){livePage.update({distances:rows});return;}
 const host=$('#distanceBars');host.replaceChildren();
 for(const item of rows){const row=document.createElement('div');row.className='distance-row';const line=document.createElement('div');line.className='distance-label';const name=document.createElement('span');name.textContent=item.title;const value=document.createElement('span');value.textContent=item.value;const bar=document.createElement('div');bar.className='bar';const fill=document.createElement('span');fill.style.width=item.width;bar.append(fill);line.append(name,value);row.append(line,bar);host.append(row);}
}
function renderDrill(){
 const view=liveDrillPresentation(currentDrill($('#drillSelect').value),drillState,titleFor);
 if(livePage){livePage.update(view);return;}
 for(const[id,text]of Object.entries(view.texts))liveText(id,text);
 for(const[id,hidden]of Object.entries(view.hidden))liveHidden(id,hidden);
 const steps=$('#drillSteps');steps.replaceChildren();
 for(const step of view.steps){const item=document.createElement('li');item.className=step.className;const number=document.createElement('span');number.className='step-number';number.textContent=step.number;const name=document.createElement('span');name.textContent=step.title;item.append(number,name);steps.append(item);}
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
  liveDisabled("verifyLatestBtn",!event);
  liveDisabled("latestActual",!event);
  liveHidden("predictionEmpty",true);
  liveHidden("predictionCard",false);
  liveText("predictionLabel",result.label ? titleFor(result.label) : 'Unknown / unclear');
  liveText("predictionConfidence",result.label
    ? 'Closest learned profile; check the match yourself.'
    : 'No reliable match. Try another event or add labeled examples.');
  liveText("predictionScore",`${result.score}/100`);
  liveValue("latestActual",'');
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
      liveText("eventCounter",`${sessionEventCount} detected · ${ignoredEventCount} discarded`);
      return;
    }
    sessionEventCount += 1;
    liveText("eventCounter",`${sessionEventCount} detected · ${ignoredEventCount} discarded`);
    const nameText=result.label?titleFor(result.label):'Unknown / unclear';
    let detailText=`#${sessionEventCount} · ${result.score}/100 · ${new Date(event.createdAt).toLocaleTimeString()}`;
    if(drillMatch)detailText+=drillMatch.completed?' · ✓ drill completed':` · ${drillMatch.outcome.replace('incorrect','out of order')}`;
    if(livePage)livePage.prepend({name:nameText,detail:detailText});
    else{const list=$('#sessionTimeline'),row=document.createElement('li'),name=document.createElement('strong'),detail=document.createElement('span');name.textContent=nameText;detail.textContent=detailText;row.append(name,detail);list.prepend(row);while(list.children.length>12)list.lastElementChild.remove();}
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
  liveText("listenBtn",listening ? 'Stop listening' : 'Start continuous listening');
  liveText("listeningIndicator",listening ? '● Microphone active — listening for the next sound' : (livePendingStart ? 'Connecting microphone…' : 'Microphone inactive'));
  liveClass("listeningIndicator","is-live",listening);
  liveClass("listenBtn","listening",listening);
  liveDisabled("sensitivity",listening || livePendingStart || profileLoading || timed);
  liveDisabled("drillSelect",listening || livePendingStart || profileLoading || timed);
  liveDisabled("resetDrillBtn",listening || livePendingStart);
  const ready = triggerReady();
  liveDisabled("listenBtn",busy || profileLoading || livePendingStart || timed || (!ready && !listening));
  liveDisabled("singleShotBtn",listening || busy || profileLoading || livePendingStart || timed || !ready);
  settingsDisabled('resetModelBtn',busy || profileLoading || listening || livePendingStart || timed);
  historyDisabled('clearHistoryBtn',busy || profileLoading || listening || livePendingStart || timed);
  renderLearningLocks();
  renderGunControls();
  renderPreferences();
  practiceController?.refresh();
  if(drillsPage)drillsPage.update({practiceDisabled:profileLocked()});else document.querySelectorAll('#practiceCatalog button').forEach(button => { button.disabled = profileLocked(); });
}

async function stopLive() {
  liveToken += 1;
  const running = liveSession;
  liveSession = null;
  livePendingStart = false;
  renderLiveButton();
  liveLevel('0%');
  liveText("listenNote",'Microphone stopped. This session has ended; start again for another sequence.');
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
  clearLiveTimeline();
  liveText("eventCounter",'0 detected · 0 discarded');
  setMessage();
  renderLiveButton();
  try {
    const session = await startContinuousListening({
      sensitivity: $('#sensitivity').value,
      audioPreferences,
      onProcessing: reportAudioProcessing,
      onState: status => { if (token === liveToken) setStatus(status); },
      onLevel: level => { if (token === liveToken) liveLevel(`${level}%`); },
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
          catch {
            ignoredEventCount += 1;
            liveText("eventCounter",`${sessionEventCount} detected · ${ignoredEventCount} discarded`);
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
    liveText("listenNote",'Still listening after every detection. Separate actions with a brief quiet gap; overlapping sounds may merge. Tap Stop when finished.');
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
  const stats = evaluationPresentation(evaluateEvents(events), ACTUAL_CLASSES, PREDICTED_CLASSES);
  $('#verifiedCount').textContent = stats.verified;
  $('#accuracyPct').textContent = stats.accuracy;
  $('#falsePositivePct').textContent = stats.falsePositive;
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
  const token = ++homeRenderToken;
  const gunId = activeGun?.id;
  const rows = gunId ? await getEvents(gunId) : [];
  if (token !== homeRenderToken || gunId !== activeGun?.id) return;
  const stats = evaluateEvents(rows);
  const accuracy = stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`;
  if(homePage)homePage.update({events:rows.length,accuracy});
  else { $('#homeEvents').textContent = String(rows.length); $('#homeAccuracy').textContent = accuracy; }
}

async function renderHistory() {
  const token = ++historyRenderToken;
  const gunId = activeGun?.id;
  const isCurrent = () => token === historyRenderToken && gunId === activeGun?.id;
  const rows = gunId ? await getEvents(gunId) : [];
  if (!isCurrent()) return;
  const sessions = await sessionController.renderSavedSessions(gunId, isCurrent, !historyPage);
  if (!isCurrent()) return;
  if (CAPABILITIES.advancedGraphs) {
    if (typeof __FULL_PREVIEW__ !== 'undefined' && __FULL_PREVIEW__ && activeView === 'history' && !progressView) {
      // Saved text renders independently; a late chart may only paint its current owner.
      void import('./optional/progressView.js').then(({ createProgressView }) => {
        if (!isCurrent() || activeView !== 'history' || !CAPABILITIES.advancedGraphs) return;
        progressView ||= createProgressView(document, { enabled: () => CAPABILITIES.advancedGraphs, onError: showError });
        progressView.render(sessions || [], gunId);
      }).catch(error => {
        if (!isCurrent() || activeView !== 'history' || !CAPABILITIES.advancedGraphs) return;
        showError(new Error('Progress charts could not load. Your saved history is still available. Check your connection and reload to try again.', { cause: error }));
      });
    } else progressView?.render(sessions || [], gunId);
  } else if(progressView)progressView.clear();else $('#progressContent').replaceChildren();
  historyRows=rows;historySessions=sessions||[];historyOwner=gunId;
  if(!historyPage)renderEvaluation(rows);
  if(homePage)homePage.update({events:rows.length}); else $('#homeEvents').textContent = String(rows.length);
  if(historyPage){historyPage.setResults({rows,sessions:historySessions,stats:evaluateEvents(rows),gunId});return;}
  const host = $('#historyList');
  host.replaceChildren();
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No recognition events yet.';
    host.append(empty);
    return;
  }
  for (const row of recognitionRows(rows, titleFor, id => currentDrill(id)?.title)) {
    const item = document.createElement('article');
    item.className = 'history-item';
    const copy = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = row.title;
    const date = document.createElement('p');
    date.textContent = row.date;
    const score = document.createElement('span');
    score.textContent = row.score;
    if (row.sequence) {
      const drillDescription = document.createElement('p');
      drillDescription.textContent = row.sequence;
      copy.append(drillDescription);
    }
    copy.append(title, date);
    const controls = document.createElement('div');
    controls.className = 'history-controls';
    const actualLabel = document.createElement('label');
    actualLabel.textContent = 'Actual:';
    const actual = document.createElement('select');
    actual.setAttribute('aria-label', `Actual sound for ${row.date}`);
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
  bindCalibrationActions();
  if (typeof __FULL_PREVIEW__ !== 'undefined' && __FULL_PREVIEW__) {
    const { createPreviewTesting, retirePreviewShell } = await import('./optional/previewTesting.js');
    await retirePreviewShell({ serviceWorker: navigator.serviceWorker, caches: window.caches, origin: location.origin });
    let storage;
    try { storage = window.localStorage; } catch { /* Simulation works without preference storage. */ }
    const applyPresentation = () => {
      const full = CAPABILITIES.advancedGraphs;
      document.documentElement.dataset.featureEdition = CAPABILITIES.edition;
      const notice = full ? 'You can save up to 5 guns.' : 'Create up to two gun profiles. Existing saved profiles remain available.';
      if(gunSetupPage)gunSetupPage.setNotice(notice);else $('#gunCapacityNotice').textContent=notice;
      const sequenceDescription=full ? 'These require only the sounds in their sequence. Create your own or choose a built-in preset.' : 'Choose a built-in or an existing saved preset. Each requires only the sounds in its sequence.';
      if(drillsPage)drillsPage.update({sequenceDescription});else $('#sequenceDescription').textContent=sequenceDescription;
      informationPages.setFull(full);
    };
    previewTesting = createPreviewTesting({ doc: document, storage,
      locked: () => profileLocked() || !!practiceController?.hasUnsavedResults() || $('#safetyModal').open || !$('#customDrillForm').classList.contains('hidden'),
      onMessage: setMessage, onChange: capabilities => {
        CAPABILITIES = capabilities; applyPresentation(); selectDrillCollection(false);
        renderGunControls(); renderPreferences(); renderHistory().catch(showError);
      } });
    CAPABILITIES = previewTesting.capabilities; applyPresentation();
  }
  customEditor = createCustomDrillEditor({ doc: document, getCapabilities: () => CAPABILITIES, getContext: () => ({ activeGun, customDrills }), locked: profileLocked,
    titleFor, setBusy, onSave: saveEditedCustomDrill, onMessage: setMessage, onError: showError });
  screenNavigation = createScreenNavigation({ history: window.history, events: window, initial: routeFor('home'), resolve: resolveRoute,
    show: route => displayView(route.view), canLeave: () => !busy && !profileLoading && !preferencePending && !practiceController?.hasUnsavedResults() && !sessionController?.hasUnsavedResults(),
    beforeLeave: async () => { practiceGuideController?.pause(); safetyGate?.cancel(); if (liveSession || livePendingStart) await stopLive();
      if (sessionController?.locked()) await sessionController.interrupt('navigation');
      if (practiceController?.locked()) await practiceController.interrupt('navigation'); }, onError: showError });
  safetyGate = createSafetyGate({ dialog: $('#safetyModal'), checkbox: $('#safetyModalAck'), confirmButton: $('#safetyConfirmBtn'), cancelButton: $('#safetyCancelBtn'),
    isConfirmed: () => $('#safetyAck').checked, confirmState: () => { $('#safetyAck').checked = true; $('#safetyAck').dispatchEvent(new Event('change')); },
    identity: () => `${activeGun?.id}|${activeView}`, onError: showError });
  practiceController = createPracticeController({ getContext: practiceContext, titleFor, ensureSafe, onNavigate: switchView, onBack: () => goBack('drills'),
    onError: showError, onStatus: setStatus, onCatalogLock:locked=>{if(!drillsPage)return false;drillsPage.update({practiceDisabled:locked});return true;}, onChange: () => { renderLiveButton(); renderClassCards(); }, onProcessing: reportAudioProcessing,
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
  practiceGuideController = createPracticeGuideBridge({ onBack: parent => goBack(parent), onNavigate: () => switchView('practiceGuide'), onError: showError });
  for (const [id, parent] of [['practiceGuideLink', 'practice'], ['sessionGuideLink', 'session']]) {
    const handler=event => {
      event.preventDefault();
      void practiceGuideController.open(() => {
        if (activeView !== parent || profileLocked() || $('#safetyModal').open) return null;
        const context = (parent === 'practice' ? practiceController : sessionController).guideContext();
        return context?.gunId === activeGun?.id ? context : null;
      });
    };guideHandlers.set(id,handler);$('#'+id).addEventListener('click',handler);
  }
  darkPreference?.addEventListener?.('change', () => { if (appearance === 'system') applyAppearance(); });
  bindSettings('appearance','change', async () => {
    const value = $('#appearance').value;
    if (!['dark', 'light', 'system'].includes(value)) return;
    try { await setSetting('appearance', value); appearance = value; applyAppearance(); } catch (error) { showError(error); renderPreferences(); }
  });
  bindSettings('vibrationFeedback','change', async () => {
    if (profileLocked()) { renderPreferences(); return; }
    try { vibrationFeedback = $('#vibrationFeedback').checked; await setSetting('vibrationFeedback', vibrationFeedback); renderPreferences(); }
    catch (error) { showError(error); await loadDevicePreferences(); renderPreferences(); }
  });
  for (const [id, key] of [['noiseFilter', 'noiseFilter'], ['autoGainControl', 'autoGain']]) {
    bindSettings(id,'change', async () => {
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
  document.querySelectorAll('[data-back]:not([data-react-back])').forEach(button => button.addEventListener('click', () => goBack()));
  $('#homeLearnBtn').addEventListener('click', () => switchView('learn'));
  $('#homeDrillsBtn').addEventListener('click', () => switchView('drills'));
  $('#homeListenBtn').addEventListener('click', () => switchView('recognize'));
  $('#homeHistoryBtn').addEventListener('click', () => switchView('history'));
  bindLive('changeDrillBtn','click', () => switchView('drills'));
  $('#freeListenBtn').addEventListener('click', () => { if (!profileLocked()) switchView('recognize'); });
  renderDrillCatalog();
  bindLive('listenBtn','click', toggleLive);
  bindLive('drillSelect','change', () => { if (profileLocked()) return; resetDrill(); setGunSetting('selectedDrill', $('#drillSelect').value, ownerId()).catch(showError); });
  bindLive('sensitivity','change', () => { if (profileLocked()) return; setGunSetting('sensitivity', $('#sensitivity').value, ownerId()).catch(showError); });
  bindLive('resetDrillBtn','click', resetDrill);
  resetDrill();
  bindSettings('importBtn','click', () => $('#importFile').click());
  bindSettings('exportBtn','click', async () => {
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
  bindLive('singleShotBtn','click', recognize);
  bindLive('verifyLatestBtn','click', async () => {
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
  bindSettings('resetModelBtn','click', async () => {
    if (profileLocked() || !activeGun || activeGun.needsDetails || !confirm(`Reset all learned sounds and reset/noise/beep calibration for ${activeGun.name}? Gun profiles, presets, saved sessions, recognition history and other guns will be kept.`)) return;
    setBusy(true);
    try {
      await clearExamples(ownerId());
      examples = [];
      calibration = [];
      if(learnPage)learnPage.update({noticeHidden:true});else $('#modelNotice').classList.add('hidden');
      setStatus('All learned sounds reset');
      setMessage(`All learned sounds for ${activeGun.name} were reset. Other guns and recognition history were kept.`);
      settingsText('soundResetOutcome',`All learned sounds and calibration for ${activeGun.name} were reset. Saved guns, presets and history were kept.`);
      renderDrillCatalog();
      renderCustomCatalog();
      await renderHome();
    } catch (error) { showError(error); }
    finally { setBusy(false); renderClassCards(); }
  });
  bindSettings('resetLibraryBtn','click', async () => {
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
  bindHistory('clearHistoryBtn', async () => {
    if (profileLocked() || !activeGun || activeGun.needsDetails || !confirm(`Clear recognition history for ${activeGun.name}? Saved drill sessions, progress statistics, learned sounds and other guns will be kept.`)) return;
    const gunId = ownerId();
    setBusy(true);
    historyRenderToken += 1;
    homeRenderToken += 1;
    try {
      await flushLibraryWork();
      await clearEvents(gunId);
      latestEventId = null;
      sessionEventCount = 0;
      ignoredEventCount = 0;
      liveHidden("predictionCard",true);
      liveHidden("predictionEmpty",false);
      clearLiveTimeline();
      liveText("eventCounter",'0 detected · 0 discarded');
      resetDrill();
      await renderHistory();
      await renderHome();
      setStatus('Recognition history cleared');
      historyText('historyClearOutcome',`Recognition history for ${activeGun.name} was cleared. Saved sessions and learned sounds were kept.`);
    }
    catch (error) { showError(error); }
    finally { setBusy(false); }
  });
  bindHistory('clearSessionsBtn', async () => {
    if (profileLocked() || !activeGun || activeGun.needsDetails || !confirm(`Clear ALL saved practice and sequence sessions for ${activeGun.name}? Their results and progress statistics will be deleted. Learned sounds, custom drills, settings, recognition history and other guns will be kept. Export a backup first; this cannot be undone without one.`)) return;
    const gunId = ownerId();
    setBusy(true);
    historyRenderToken += 1;
    try {
      await flushLibraryWork();
      await clearSessions(gunId);
      sessionController.reset();
      practiceController.reset();
      await renderHistory();
      setStatus('Saved sessions cleared');
      historyText('sessionsClearOutcome',`Saved sessions and progress statistics for ${activeGun.name} were cleared. Learned sounds and recognition history were kept.`);
    } catch (error) { showError(error); }
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

const informationPages = createInformationBridge({ onBack: () => goBack(), onError: showError, onNavigate: name => { if (screenNavigation) switchView(name); },
  canEnhance: () => !profileLocked() && !$('#safetyModal').open });
init().catch(showError);

// HTTPS-hosted web builds can reopen offline after an initial successful load.
// Capacitor packages the web bundle itself, so don't register a worker there.
const isNative = typeof globalThis.Capacitor?.isNativePlatform === 'function' && globalThis.Capacitor.isNativePlatform();
if (!(typeof __FULL_PREVIEW__ !== 'undefined' && __FULL_PREVIEW__) && !import.meta.env.DEV && !isNative && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('/sw.js').catch(error => {
    console.warn('Offline caching unavailable:', error);
  });
}
