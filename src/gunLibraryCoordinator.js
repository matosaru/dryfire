/** Gun workflows keep one epoch and page cache; application/transaction owners stay explicit ports. */
export function createGunLibraryCoordinator(state,store,ui){
let setupGunId=null,gunLibraryPage,gunSetupPage,gunLibraryToken=0;
const {getGuns,deleteGun,setActiveGun,updateGun,createGun}=store;
const {profileLocked,setMessage,switchView,showError,setBusy,loadActiveGun,setStatus,openEntry,renderGunControls,renderLiveButton,renderClassCards,$,document,confirm}=ui;
function openGunSetup(gun = null) {
  if (profileLocked()) return;
  if (!gun && state.guns.length >= state.capabilities.gunCreationLimit) { setMessage('This version cannot create another gun. Existing saved guns remain available.'); return; }
  setupGunId = gun?.id ?? null;
  const props = {name:gun?.name ?? '',type:gun?.type ?? '',
    title:gun?.needsDetails ? 'Name your existing gun' : gun ? 'Edit gun' : state.guns.length ? 'Add your gun' : 'Add your first gun',
    description:gun?.needsDetails ? 'Your learned sounds and recognition history have been preserved together. Add the name and type of the gun they belong to.'
      : gun ? 'Update the name or type. This gun’s learned sounds, presets and history stay saved.'
      : 'Give this gun a name and type. Its learned sounds, presets and history will be saved separately on this device.',
    submitLabel:gun ? 'Save Changes' : 'Save Gun & Continue',cancelHidden:!state.gun || !!state.gun.needsDetails};
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
    throw new Error('Session results are not saved. Retry saving before deleting data.');
  }
}
async function deleteGunProfile(gun) {
  if (profileLocked() || !confirm(`Delete ${gun.name || 'this gun'} and ALL its data? This removes its learned sounds, calibration, custom drills, settings, recognition history and saved practice/sequence sessions. Other guns stay saved. Export a backup first; this cannot be undone without one.`)) return;
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
    setStatus('Gun deleted');
    setMessage(`${gun.name || 'Gun'} and all its data were deleted. ${state.gun ? 'Other guns were kept.' : 'Add a new gun to continue.'}`);
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
  if (!name) { setMessage('Enter a gun name.'); $('#gunName').focus(); return; }
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
    setStatus('Gun saved');
  } catch (error) { showError(error); }
  finally { setBusy(false); setGunSaving(false); }
}
return{open:openGunSetup,render:renderGunLibrary,flush:flushLibraryWork,remove:deleteGunProfile,select:selectGunProfile,submit:submitGun,invalidate(){gunLibraryToken+=1;},syncLocked(){if(!gunLibraryPage)return false;gunLibraryPage.setLocked(profileLocked());return true;},setNotice(notice){if(gunSetupPage)gunSetupPage.setNotice(notice);else $('#gunCapacityNotice').textContent=notice;}};
}
