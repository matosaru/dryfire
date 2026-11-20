/** Gun workflows keep one epoch and page cache; application/transaction owners stay explicit ports. */
import {translate} from '../apps/web/src/localization/runtime.ts';
export function createGunLibraryCoordinator(state,store,ui){
let setupGunId=null,gunLibraryPage,gunSetupPage,gunLibraryToken=0;
const {getGuns,deleteGun,setActiveGun,updateGun,createGun}=store;
const {profileLocked,setMessage,switchView,showError,setBusy,loadActiveGun,setStatus,openEntry,renderGunControls,renderLiveButton,renderClassCards,$,document,confirm}=ui;
function openGunSetup(gun = null) {
  if (profileLocked()) return;
  if (!gun && state.guns.length >= state.capabilities.gunCreationLimit) { setMessage(translate('common','runtimeMain.gunLimit')); return; }
  setupGunId = gun?.id ?? null;
  const variant=gun?.needsDetails?'repair':gun?'edit':state.guns.length?'add':'first';
  const props = {name:gun?.name ?? '',type:gun?.type ?? '',variant,noticeMode:state.capabilities.gunCreationLimit>=5?'full':'limit',
    title:translate('gun-setup',gun?.needsDetails?'page.repairTitle':gun?'page.editTitle':state.guns.length?'page.addTitle':'page.firstTitle'),
    description:translate('gun-setup',gun?.needsDetails?'page.repairDescription':gun?'page.editDescription':state.guns.length?'page.addDescription':'page.firstDescription'),
    submitLabel:translate('gun-setup',gun?'actions.save':'actions.saveFirst'),cancelHidden:!state.gun || !!state.gun.needsDetails};
  if (state.pages) {
    if(gunSetupPage)gunSetupPage.reset(props);
    else gunSetupPage=state.pages.mountGunSetupPage(document,{...props,onSubmit:event=>{submitGun(event).catch(showError);},onCancel:()=>switchView('guns'),onRestore:()=>switchView('settings')});
  } else {
    $('#gunForm').reset(); $('#gunName').value=props.name; $('#gunType').value=props.type;
    document.querySelectorAll('[name="gunTypeChoice"]').forEach(input=>{input.checked=input.value===props.type;});
    $('#gunSetupTitle').textContent=props.title; $('#gunSetupDescription').textContent=props.description;
    $('#saveGunBtn').textContent=props.submitLabel; $('#cancelGunSetupBtn').classList.toggle('hidden',props.cancelHidden);
  }
  switchView('gunSetup');
  $('#gunName').focus();
}
async function renderGunLibrary() {
  const token = ++gunLibraryToken;
  const library = await getGuns();
  if (token !== gunLibraryToken) return;
  state.guns = library;
  const {renderGunLibraryView}=await import('./gunLibraryView.js');
  if(token!==gunLibraryToken)return;
  const page=await renderGunLibraryView(state,store,ui,{current:()=>token===gunLibraryToken,page:gunLibraryPage,selectGunProfile,openGunSetup,deleteGunProfile});
  if(token===gunLibraryToken&&page)gunLibraryPage=page;
}
async function flushLibraryWork() {
  await state.events;
  await state.session?.flush();
  await state.practice?.flush();
  if (state.session?.hasUnsavedResults() || state.practice?.hasUnsavedResults()) {
    throw new Error(translate('common','runtimeMain.saveUnsentSession'));
  }
}
async function deleteGunProfile(gun) {
  if (profileLocked() || !confirm(translate('common','runtimeMain.deleteGun',{gun:gun.name||'this gun'}))) return;
  const wasSelected = state.gun?.id === gun.id;
  setBusy(true);
  gunLibraryToken += 1;
  try {
    await flushLibraryWork();
    await deleteGun(gun.id);
    if (wasSelected) {
      await loadActiveGun();
      $('#safetyAck').checked = false;
      $('#safetyAck').dispatchEvent(new document.defaultView.Event('change'));
    } else state.guns = await getGuns();
    setBusy(false);
    if (!state.gun || state.gun.needsDetails) openGunSetup(state.gun);
    else { switchView('guns'); await renderGunLibrary(); }
    setStatus(translate('common','runtimeMain.gunDeleted'));
    setMessage(translate('common',state.gun?'runtimeMain.gunDeletedOther':'runtimeMain.gunDeletedFinal',{gun:gun.name||translate('common','runtimeMain.gunPlaceholder')}));
  } finally { setBusy(false); }
}
async function selectGunProfile(id) {
  if (profileLocked()) return;
  state.loading = true;
  renderGunControls();
  renderLiveButton();
  try {
    await state.events;
    await state.session?.flush();
    await state.practice?.flush();
    await setActiveGun(id);
    await loadActiveGun();
    $('#safetyAck').checked = false;
    $('#safetyAck').dispatchEvent(new document.defaultView.Event('change'));
  } finally { state.loading = false; renderGunControls(); renderClassCards(); renderLiveButton(); }
  if (state.gun?.needsDetails) openGunSetup(state.gun);
  else switchView('home');
}
function setGunSaving(saving) { if(gunSetupPage)gunSetupPage.setSaving(saving);else $('#saveGunBtn').disabled=saving; }
async function submitGun(event) {
  event.preventDefault();
  if (profileLocked()) return;
  const name = $('#gunName').value.trim();
  const type = $('#gunType').value;
  if (!name) { setMessage(translate('common','runtimeMain.enterGunName')); $('#gunName').focus(); return; }
  setBusy(true);
  setGunSaving(true);
  try {
    const editing = !!setupGunId;
    const completingLegacy = editing && state.gun?.id === setupGunId && state.gun.needsDetails;
    if (editing) await updateGun(setupGunId, {name, type});
    else await createGun({name, type}, { maxGuns: state.capabilities.gunCreationLimit });
    await loadActiveGun();
    setBusy(false);
    if(state.pendingEntry&&!editing)await openEntry();else switchView(editing && !completingLegacy ? 'guns' : 'home');
    setStatus(translate('common','runtimeMain.gunSaved'));
  } catch (error) { showError(error); }
  finally { setBusy(false); setGunSaving(false); }
}
return{open:openGunSetup,render:renderGunLibrary,flush:flushLibraryWork,remove:deleteGunProfile,select:selectGunProfile,submit:submitGun,invalidate(){gunLibraryToken+=1;},syncLocked(){if(!gunLibraryPage)return false;gunLibraryPage.setLocked(profileLocked());return true;},setNotice(mode){const key=mode==='full'?'notice.full':'notice.limit';if(gunSetupPage)gunSetupPage.setNoticeMode(mode==='full'?'full':'limit');else $('#gunCapacityNotice').textContent=translate('gun-setup',key);}};
}
