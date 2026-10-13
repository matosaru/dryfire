import { createPreviewSimulation, PREVIEW_MODE_KEY, retirePreviewShell } from '../src/optional/previewTesting.js';

function saved(value) {
  const values = new Map([['other', 'keep'], ...(value ? [[PREVIEW_MODE_KEY, value]] : [])]);
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
test('private dev simulation starts with all Full capabilities', () => {
  const simulation = createPreviewSimulation();
  expect(simulation.mode).toBe('full');
  expect(simulation.capabilities).toMatchObject({ edition: 'preview', gunCreationLimit: 5, customDrillCreation: true, advancedGraphs: true });
});
test('an explicit remembered Free choice retains the real public simulation without rewriting preferences', () => {
  const storage = saved('free');
  const simulation = createPreviewSimulation({ storage });
  expect(simulation.mode).toBe('free');
  expect(simulation.capabilities).toMatchObject({ edition: 'public', gunCreationLimit: 2, customDrillCreation: false, advancedGraphs: false });
  expect(storage.values).toEqual(new Map([['other', 'keep'], [PREVIEW_MODE_KEY, 'free']]));
});
test('a valid private Full preference restores all existing preview capabilities', () => {
  const simulation = createPreviewSimulation({ storage: saved('full') });
  expect(simulation.capabilities).toMatchObject({ edition: 'preview', gunCreationLimit: 5, customDrillCreation: true, advancedGraphs: true });
});
test('invalid saved modes use the private Full default while invalid changes are rejected', () => {
  const simulation = createPreviewSimulation({ storage: saved('paid') });
  expect(simulation.mode).toBe('full');
  for (const mode of ['paid', '', null, 'FULL']) expect(() => simulation.select(mode)).toThrow('Unknown preview simulation');
  expect(simulation.mode).toBe('full');
});
test('locked operation rejects a direct change without writing the preference or changing capabilities', () => {
  const storage = saved('free'); let locked = true; const changes = [];
  const simulation = createPreviewSimulation({ storage, locked: () => locked, onChange: value => changes.push(value) });
  expect(simulation.select('full')).toBe(false); expect(storage.getItem(PREVIEW_MODE_KEY)).toBe('free');
  expect(changes).toHaveLength(0); expect(simulation.capabilities.gunCreationLimit).toBe(2);
  locked = false; expect(simulation.select('full')).toBe(true); expect(changes).toHaveLength(1);
});
test('switching either way writes only the private mode preference and preserves unrelated data', () => {
  const storage = saved('free'); const simulation = createPreviewSimulation({ storage });
  simulation.select('full'); expect(storage.getItem(PREVIEW_MODE_KEY)).toBe('full');
  simulation.select('free'); expect(storage.getItem(PREVIEW_MODE_KEY)).toBe('free');
  expect(storage.values).toEqual(new Map([['other', 'keep'], [PREVIEW_MODE_KEY, 'free']]));
});
test('unavailable browser preference storage does not break the mode switch', () => {
  const storage = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Blocked'); } };
  const simulation = createPreviewSimulation({ storage });
  expect(simulation.mode).toBe('full'); expect(simulation.select('free')).toBe(true); expect(simulation.mode).toBe('free');
});
test('preview retirement removes only its origin app shell and registration, preserving unrelated caches/workers', async () => {
  const removed = [], unregistered = []; const origin = 'https://dev-dryfire.matosaru.workers.dev';
  const serviceWorker = { getRegistrations: async () => [
    { active: { scriptURL: `${origin}/sw.js` }, unregister: async () => unregistered.push('app') },
    { active: { scriptURL: `${origin}/other-sw.js` }, unregister: async () => unregistered.push('other') },
  ] };
  const caches = { keys: async () => ['dryfire-sound-trainer-preview-v28', 'dryfire-sound-trainer-public-v20', 'unrelated-cache'], delete: async key => removed.push(key) };
  await retirePreviewShell({ serviceWorker, caches, origin });
  expect(unregistered).toEqual(['app']); expect(removed).toEqual(['dryfire-sound-trainer-preview-v28', 'dryfire-sound-trainer-public-v20']);
});
