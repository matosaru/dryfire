import { editionCapabilities } from '../buildEdition.js';

export const PREVIEW_MODE_KEY = 'dryfire-private-preview-mode';
export function createPreviewSimulation({ storage, locked = () => false, onChange = () => {} } = {}) {
  let mode = 'free';
  try { if (storage?.getItem(PREVIEW_MODE_KEY) === 'full') mode = 'full'; } catch { /* Preference storage can be unavailable. */ }
  const capabilitiesFor = value => editionCapabilities(value === 'full' ? 'preview' : 'public');
  return {
    get mode() { return mode; },
    get capabilities() { return capabilitiesFor(mode); },
    select(next) {
      if (!['free', 'full'].includes(next)) throw new Error('Unknown preview simulation.');
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
  const select = doc.getElementById('previewTestMode');
  function render() {
    select.value = simulation.mode; select.disabled = locked();
    doc.getElementById('previewModeBadge').textContent = `Private preview · ${simulation.mode === 'full' ? 'Full' : 'Free'} mode`;
    doc.getElementById('previewModeStatus').textContent = locked() ? 'Finish active work before changing test mode.'
      : simulation.mode === 'full' ? 'Full: five guns, new custom drills and progress graphs.'
      : 'Free: two guns, built-in practice and saved timing results. Existing data stays available.';
  }
  select.addEventListener('change', () => {
    if (!simulation.select(select.value)) onMessage('Finish recording, practice or pending results before changing test mode.');
    render();
  });
  render();
  return { get capabilities() { return simulation.capabilities; }, render };
}

// Authenticated preview assets must not be served from an old app-shell cache.
// These operations affect this origin's app cache, never IndexedDB/user backups.
export async function retirePreviewShell({ serviceWorker, caches, origin }) {
  for (const registration of await serviceWorker?.getRegistrations() ?? []) {
    const scripts = [registration.active, registration.waiting, registration.installing].filter(Boolean);
    if (scripts.some(worker => new URL(worker.scriptURL).href === `${origin}/sw.js`)) await registration.unregister();
  }
  for (const key of await caches?.keys() ?? []) if (key.startsWith('dryfire-sound-trainer-')) await caches.delete(key);
}
