import { editionCapabilities } from '../buildEdition.js';

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
    if (!simulation.select(event.currentTarget.value)) onMessage('Finish recording, practice or pending results before changing test mode.');
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
    select.value = simulation.mode; select.disabled = locked();
    doc.getElementById('previewModeBadge').textContent = `Private preview · ${full ? 'Full' : 'Free'} mode`;
    doc.getElementById('previewModeStatus').textContent = locked() ? 'Finish active work before changing test mode.'
      : full ? 'Full: five guns, new custom drills and progress graphs.'
      : 'Free: two guns, built-in practice and saved timing results. Existing data stays available.';
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
