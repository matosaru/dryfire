import {trainingCounts,MIN_EXAMPLES_PER_CLASS} from './classifier.js';
/** Optional library screen; loaded only after explicit navigation to gun management. */
export async function renderGunLibraryView(state,{getExamples,getCustomDrills},{loadProfilePages,profileLocked,gunImagePath,showError,switchView,document},{current,page,selectGunProfile,openGunSetup,deleteGunProfile}){
  const rows = [];
  for (const gun of state.guns) {
    const samples = await getExamples(gun.id);
    const presets = await getCustomDrills(gun.id);
    if (!current()) return;
    const counts = trainingCounts(samples);
    const triggerTrained = counts.trigger >= MIN_EXAMPLES_PER_CLASS;
    rows.push({ gun, image: gunImagePath(gun.type), triggerReady: triggerTrained,
      optionalReady: Object.values(counts).filter(count => count >= MIN_EXAMPLES_PER_CLASS).length - (triggerTrained ? 1 : 0),
      samples: samples.length, presets: presets.length });
  }
  const pages = await loadProfilePages();
  if (!current()) return;
  const props = { rows, selectedId: state.gun?.id, locked: profileLocked(), full: state.capabilities.edition !== 'public', limit: state.capabilities.gunCreationLimit, loaded: true,
    onSelect: id => { selectGunProfile(id).catch(showError); }, onEdit: gun => openGunSetup(gun),
    onDelete: gun => { deleteGunProfile(gun).catch(showError); }, onAdd: () => openGunSetup(), onBackup: () => switchView('settings') };
  if (page) page.update(props);
  else page = pages.mountGunsPage(document, props);
  return page;
}
