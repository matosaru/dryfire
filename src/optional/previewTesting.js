import { editionCapabilities } from '../buildEdition.js';
import { translate } from '../../apps/web/src/localization/runtime.ts';

const PREVIEW_MODE_KEY = 'dryfire-private-preview-mode';
export function createPreviewSimulation({ storage, locked = () => false, onChange = () => {} } = {}) {
  let mode = 'free';
  try { if (storage?.getItem(PREVIEW_MODE_KEY) === 'full') mode = 'full'; } catch { /* Preference storage can be unavailable. */ }
  const capabilitiesFor = value => editionCapabilities(value === 'full' ? 'preview' : 'public');
  return {
    get mode() { return mode; },
    get capabilities() { return capabilitiesFor(mode); },
    select(next) {
      if (next !== 'free' && next !== 'full') throw new Error('Unknown preview simulation.');
      if (locked()) return false;
      if (next === mode) return true;
      onChange(capabilitiesFor(next));
      mode = next;
      try { storage?.setItem(PREVIEW_MODE_KEY, mode); } catch { /* Keep the selected mode in memory. */ }
      return true;
    },
  };
}

export function createPreviewTesting({ doc, storage, locked, onChange, onMessage }) {
  const simulation = createPreviewSimulation({ storage, locked, onChange });
  let select;
  function change(event) {
    if (!simulation.select(event.currentTarget.value)) onMessage(translate('settings','preview.locked'));
    render();
  }
  function render() {
    const current = doc.getElementById('previewTestMode');
    if (current !== select) {
      select?.removeEventListener('change', change);
      select = current;
      select.addEventListener('change', change);
    }
    const full = simulation.mode === 'full';
    doc.getElementById('previewTestingTitle').textContent=translate('settings','preview.title');
    doc.getElementById('previewTestAs').textContent=translate('settings','preview.testAs');
    doc.querySelector('#previewTestMode option[value="free"]').textContent=translate('settings','preview.free');
    doc.querySelector('#previewTestMode option[value="full"]').textContent=translate('settings','preview.full');
    doc.getElementById('previewTestDataNote').textContent=translate('settings','preview.dataNote');
    select.value = simulation.mode; select.disabled = locked();
    doc.getElementById('previewModeBadge').textContent = translate('settings','preview.badge',{mode:translate('settings',full?'preview.full':'preview.free')});
    doc.getElementById('previewModeStatus').textContent = locked() ? translate('settings','preview.locked')
      : translate('settings',full?'preview.fullStatus':'preview.freeStatus');
  }
  render();
  return { get capabilities() { return simulation.capabilities; }, render };
}

// Authenticated preview assets must not be served from an old app-shell cache.
// These operations affect this origin's app cache, never IndexedDB/user backups.
export async function retirePreviewShell({ serviceWorker, caches, origin }) {
  for (const registration of await serviceWorker?.getRegistrations() ?? []) {
    if ([registration.active, registration.waiting, registration.installing].some(worker => worker && new URL(worker.scriptURL).href === `${origin}/sw.js`)) await registration.unregister();
  }
  for (const key of await caches?.keys() ?? []) if (key.startsWith('dryfire-sound-trainer-')) await caches.delete(key);
}
