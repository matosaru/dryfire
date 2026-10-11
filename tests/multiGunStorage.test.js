import {
  GUN_TYPES, MAX_GUNS, addEvent, addExample, clearEvents, clearExamples,
  clearExamplesForLabel, createGun, exportBackup, getActiveGun, getCustomDrills,
  getEvents, getExamples, getGunSetting, getGuns, getOutdatedExampleCount,
  getSetting, restoreBackup, saveCustomDrill, setActiveGun, setGunSetting,
  setSetting, trimEvents, updateGun, verifyEvent,
} from '../src/storage.js';

const DB_NAME = 'dryfire-sound-trainer';
const features = Array(15).fill(0.25);
const makeGun = name => createGun({ name, type: 'Handguns' });
const removeDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase(DB_NAME);
  request.onsuccess = resolve;
  request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error('Database deletion blocked'));
});

async function seedLegacy({ examples = [], events = [], settings = [] } = {}) {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const ex = request.result.createObjectStore('examples', { keyPath: 'id' });
      ex.createIndex('label', 'label', { unique: false });
      const ev = request.result.createObjectStore('events', { keyPath: 'id' });
      ev.createIndex('createdAt', 'createdAt', { unique: false });
      request.result.createObjectStore('settings', { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(['examples', 'events', 'settings'], 'readwrite');
      for (const row of examples) tx.objectStore('examples').put(row);
      for (const row of events) tx.objectStore('events').put(row);
      for (const row of settings) tx.objectStore('settings').put(row);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}

beforeEach(removeDb);
afterAll(removeDb);

test('new or empty legacy databases require a named first gun before writes', async () => {
  expect(await getGuns()).toEqual([]);
  expect(await getActiveGun()).toBeNull();
  expect(await getExamples()).toEqual([]);
  expect(await getEvents()).toEqual([]);
  await expect(addExample('draw', features)).rejects.toThrow(/select|gun/i);
  await expect(addEvent({ label: 'draw', score: 55 })).rejects.toThrow(/select|gun/i);
  await removeDb();
  await seedLegacy({ settings: [{ key: 'maxResults', value: 25 }] });
  expect(await getGuns()).toEqual([]);
  expect(await getActiveGun()).toBeNull();
});

test('creates only five profiles even when all creations are concurrent', async () => {
  expect(GUN_TYPES).toEqual(['Handguns', 'Rifles and Carbines', 'Shotguns']);
  expect(MAX_GUNS).toBe(5);
  const attempts = await Promise.allSettled(Array.from({ length: 7 }, (_, i) => makeGun(`Gun ${i}`)));
  expect(attempts.filter(r => r.status === 'fulfilled')).toHaveLength(5);
  expect(attempts.filter(r => r.status === 'rejected')).toHaveLength(2);
  expect(await getGuns()).toHaveLength(5);
  expect((await getGuns()).some(gun => gun.id === attempts.find(r => r.status === 'fulfilled').value.id)).toBe(true);
  await expect(makeGun('Sixth')).rejects.toThrow(/five|5|maximum/i);
});

test('validates details, trims names and persists selection across independent reads', async () => {
  await expect(makeGun(' ')).rejects.toThrow(TypeError);
  await expect(makeGun('a'.repeat(81))).rejects.toThrow(TypeError);
  await expect(createGun({ name: 'Gun', type: 'Rifle' })).rejects.toThrow(TypeError);
  const first = await makeGun('  First gun  ');
  const second = await createGun({ name: 'Second', type: 'Shotguns' });
  expect(first.name).toBe('First gun');
  expect((await getActiveGun()).id).toBe(second.id);
  await setActiveGun(first.id);
  expect((await getActiveGun()).id).toBe(first.id);
  await expect(setActiveGun('missing')).rejects.toThrow(/gun/i);
  expect((await getActiveGun()).id).toBe(first.id);
});

test('legacy upgrade preserves identifiers, features, timestamps and verification in an unnamed profile', async () => {
  const example = { id: 'legacy-sample', label: 'draw', features, featureVersion: 2, createdAt: 100 };
  const event = { id: 'legacy-event', label: 'trigger', score: 70, createdAt: 200, actualLabel: 'reload',
    drillId: 'trigger-only', drillPosition: 0, drillOutcome: 'completed', drillCompleted: true };
  await seedLegacy({ examples: [example, { id: 'outdated', label: 'rack', features: [1], createdAt: 30 }], events: [event],
    settings: [{ key: 'maxResults', value: 17 }, { key: 'appearance', value: 'system' }] });
  const [legacy] = await getGuns();
  expect(legacy).toMatchObject({ name: '', type: null, needsDetails: true });
  expect((await getActiveGun()).id).toBe(legacy.id);
  expect(await getExamples()).toEqual([{ ...example, gunId: legacy.id }]);
  expect(await getEvents()).toEqual([{ ...event, gunId: legacy.id }]);
  expect(await getOutdatedExampleCount()).toBe(1);
  expect(await getGunSetting('maxResults', 50)).toBe(17);
  expect(await getSetting('appearance', 'light')).toBe('system');
  await updateGun(legacy.id, { name: 'My inherited rifle', type: 'Rifles and Carbines' });
  expect(await getActiveGun()).toMatchObject({ id: legacy.id, needsDetails: false, name: 'My inherited rifle', type: 'Rifles and Carbines' });
  expect((await getExamples())[0]).toMatchObject(example);
});

test('samples, manual verification, resets, trimming and clearing belong only to their gun', async () => {
  const a = await makeGun('A');
  const b = await makeGun('B');
  await addExample('draw', features, a.id);
  await addExample('rack', features, a.id);
  await addExample('draw', features.map(v => v + 0.4), b.id);
  const aEvent = await addEvent({ label: 'draw', score: 60 }, a.id);
  const bEvent = await addEvent({ label: 'rack', score: 80 }, b.id);
  await expect(verifyEvent(aEvent.id, 'reload', b.id)).rejects.toThrow(/not found|gun/i);
  expect((await getEvents(a.id))[0].actualLabel).toBeUndefined();
  await verifyEvent(aEvent.id, 'reload', a.id);
  await clearExamplesForLabel('draw', a.id);
  expect((await getExamples(a.id)).map(row => row.label)).toEqual(['rack']);
  expect(await getExamples(b.id)).toHaveLength(1);
  await clearExamples(a.id);
  expect(await getExamples(a.id)).toEqual([]);
  expect(await getExamples(b.id)).toHaveLength(1);
  await clearEvents(a.id);
  expect(await getEvents(a.id)).toEqual([]);
  expect((await getEvents(b.id)).map(row => row.id)).toEqual([bEvent.id]);
  await trimEvents(1, b.id);
  expect(await getEvents(b.id)).toHaveLength(1);
});

test('per-gun retention and active fallback cannot cause cross-gun trimming', async () => {
  const a = await makeGun('A');
  const b = await makeGun('B');
  await setGunSetting('maxResults', 1, a.id);
  await setGunSetting('maxResults', 3, b.id);
  await Promise.all(Array.from({ length: 8 }, () => addEvent({ label: 'trigger', score: 65 }, a.id)));
  await Promise.all(Array.from({ length: 8 }, () => addEvent({ label: 'rack', score: 75 }, b.id)));
  expect(await getEvents(a.id)).toHaveLength(1);
  expect(await getEvents(b.id)).toHaveLength(3);
  await setActiveGun(a.id);
  expect(await getEvents()).toHaveLength(1);
  await addExample('draw', features);
  expect(await getExamples(a.id)).toHaveLength(1);
  expect(await getExamples(b.id)).toHaveLength(0);
});

test('explicit in-flight event ownership survives an active-gun change', async () => {
  const a = await makeGun('A');
  const b = await makeGun('B');
  await setActiveGun(a.id);
  const recording = addEvent({ label: 'draw', score: 66 }, a.id);
  await setActiveGun(b.id);
  const result = await recording;
  expect(result.gunId).toBe(a.id);
  expect(await getEvents(a.id)).toHaveLength(1);
  expect(await getEvents(b.id)).toHaveLength(0);
});

test('custom presets/configuration and event sequence snapshots remain isolated and durable', async () => {
  const a = await makeGun('A');
  const b = await makeGun('B');
  const preset = await saveCustomDrill({ title: '  Two presses  ', steps: ['trigger', 'trigger'] }, a.id);
  await setGunSetting('selectedDrill', preset.id, a.id);
  await setGunSetting('drillConfig', { delayMode: 'random', min: 2, max: 5 }, a.id);
  expect(await getCustomDrills(b.id)).toEqual([]);
  expect((await getCustomDrills(a.id))[0]).toMatchObject({ title: 'Two presses', steps: ['trigger', 'trigger'] });
  await expect(saveCustomDrill({ title: 'Invalid', steps: ['shot'] }, a.id)).rejects.toThrow(TypeError);
  const event = await addEvent({ label: 'trigger', score: 85, drillId: preset.id,
    drillPosition: 1, drillOutcome: 'completed' }, a.id);
  expect(event).toMatchObject({ drillTitle: 'Two presses', drillSteps: ['trigger', 'trigger'], drillCompleted: true });
  await saveCustomDrill({ ...preset, title: 'Updated', steps: ['rack'] }, a.id);
  expect((await getEvents(a.id))[0].drillSteps).toEqual(['trigger', 'trigger']);
  expect(await getGunSetting('drillConfig', null, a.id)).toEqual({ delayMode: 'random', min: 2, max: 5 });
  expect(await getGunSetting('drillConfig', null, b.id)).toBeNull();
});

test('current backup restores the complete library and active selection', async () => {
  const a = await makeGun('A');
  const b = await createGun({ name: 'B', type: 'Shotguns' });
  await addExample('draw', features, a.id);
  await addExample('rack', features.map(v => v + 0.1), b.id);
  const event = await addEvent({ label: 'rack', score: 80 }, b.id);
  await verifyEvent(event.id, 'reload', b.id);
  await setGunSetting('maxResults', 4, a.id);
  const preset = await saveCustomDrill({ title: 'Practice', steps: ['draw', 'trigger'] }, a.id);
  await setGunSetting('selectedDrill', preset.id, a.id);
  await setGunSetting('drillConfig', { repetitions: 6, delay: 3 }, a.id);
  await setSetting('appearance', 'dark');
  await setActiveGun(a.id);
  const backup = await exportBackup();
  expect(backup).toMatchObject({ format: 'sound-trainer-backup', version: 4, activeGunId: a.id });
  expect(backup.guns).toHaveLength(2);
  expect(backup.examples).toHaveLength(2);
  await removeDb();
  const stats = await restoreBackup(backup);
  expect(stats).toMatchObject({ guns: 2, examples: 2, events: 1, maxResults: 4 });
  expect((await getActiveGun()).id).toBe(a.id);
  expect((await getExamples(a.id))[0].features).toEqual(features);
  expect((await getEvents(b.id))[0]).toMatchObject({ id: event.id, actualLabel: 'reload' });
  expect(await getCustomDrills(a.id)).toEqual([preset]);
  expect(await getGunSetting('selectedDrill', null, a.id)).toBe(preset.id);
  expect(await getGunSetting('drillConfig', null, a.id)).toEqual({ repetitions: 6, delay: 3 });
  expect(await getSetting('appearance', 'system')).toBe('dark');
});

test('version-one backup gets one unnamed profile without losing old row identity', async () => {
  await setSetting('appearance', 'dark');
  const backup = { format: 'sound-trainer-backup', version: 1, featureVersion: 2,
    settings: { maxResults: 10 },
    examples: [{ id: 'old-sample', label: 'draw', features, featureVersion: 2, createdAt: 40 }],
    events: [{ id: 'old-event', label: 'trigger', score: 80, actualLabel: 'trigger', createdAt: 50 }] };
  await restoreBackup(backup);
  expect(await getGuns()).toHaveLength(1);
  expect(await getActiveGun()).toMatchObject({ name: '', type: null, needsDetails: true });
  expect((await getExamples())[0]).toMatchObject({ id: 'old-sample', createdAt: 40 });
  expect((await getEvents())[0]).toMatchObject({ id: 'old-event', createdAt: 50, actualLabel: 'trigger' });
  expect(await getGunSetting('maxResults', 50)).toBe(10);
  expect(await getSetting('appearance', 'system')).toBe('dark');
});

test.each([
  ['sparse samples', backup => { backup.examples = Array(1); }],
  ['sparse features', backup => { backup.examples[0].features = Array(15); }],
  ['foreign preset selection', backup => { backup.gunSettings.push({ gunId: backup.guns[0].id, key: 'selectedDrill', value: 'custom-missing' }); }],
  ['unknown owner', backup => { backup.examples[0].gunId = 'missing'; }],
  ['invalid gun type', backup => { backup.guns[0].type = 'Unknown'; }],
  ['duplicate gun', backup => { backup.guns.push({ ...backup.guns[0] }); }],
  ['unknown selection', backup => { backup.activeGunId = 'missing'; }],
  ['six guns', backup => { for (let i = 0; i < 5; i++) backup.guns.push({ ...backup.guns[0], id: `extra-${i}` }); }],
  ['invalid preset', backup => { backup.gunSettings.push({ gunId: backup.guns[0].id, key: 'customDrills', value: [{ id: 'custom-test', title: 'Bad', steps: ['bang'] }] }); }],
  ['duplicate setting', backup => { backup.gunSettings.push({ ...backup.gunSettings[0] }); }],
])('malformed %s backup fails before replacing any saved data', async (_, damage) => {
  const gun = await makeGun('Keep me');
  await addExample('draw', features, gun.id);
  await setGunSetting('maxResults', 8, gun.id);
  const before = await exportBackup();
  const broken = structuredClone(before);
  damage(broken);
  await expect(restoreBackup(broken)).rejects.toThrow();
  const after = await exportBackup();
  expect({ ...after, exportedAt: null }).toEqual({ ...before, exportedAt: null });
});


test('per-class example capacity is atomic and does not consume another gun’s capacity', async () => {
  const a = await makeGun('A');
  const b = await makeGun('B');
  const writes = await Promise.allSettled(Array.from({ length: 13 }, () => addExample('draw', features, a.id)));
  expect(writes.filter(write => write.status === 'fulfilled')).toHaveLength(10);
  expect(writes.filter(write => write.status === 'rejected')).toHaveLength(3);
  expect(await getExamples(a.id)).toHaveLength(10);
  await addExample('draw', features, b.id);
  await addExample('rack', features, a.id);
  expect(await getExamples(b.id)).toHaveLength(1);
  expect(await getExamples(a.id)).toHaveLength(11);
});


test('rejects sparse features without creating a silently unusable sample', async () => {
  const gun = await makeGun('A');
  await expect(addExample('draw', Array(15), gun.id)).rejects.toThrow(TypeError);
  expect(await getExamples(gun.id)).toEqual([]);
});


test.each([null, ''])('preserves free listening choice %p through whole-library backup', async selection => {
  const gun = await makeGun('Free listening');
  await setGunSetting('selectedDrill', selection, gun.id);
  const backup = await exportBackup();
  expect(backup.gunSettings.find(row => row.key === 'selectedDrill').value).toBe(selection);
  await removeDb();
  await restoreBackup(backup);
  const restored = await exportBackup();
  expect(restored.gunSettings.find(row => row.key === 'selectedDrill').value).toBe(selection);
  if (selection === '') expect(await getGunSetting('selectedDrill', 'trigger-only')).toBe('');
});

/** Hold the write-opening request after its earlier ownership read succeeds. */
async function replaceLibraryDuringPendingWrite(action, gatedOpen = 2) {
  const originalOpen = indexedDB.open.bind(indexedDB);
  let calls = 0;
  let release;
  let announce;
  const gated = new Promise(resolve => { announce = resolve; });
  indexedDB.open = (...args) => {
    if (++calls !== gatedOpen) return originalOpen(...args);
    let actual;
    const request = {
      get result() { return actual?.result; },
      get error() { return actual?.error; },
      get transaction() { return actual?.transaction; },
    };
    release = () => {
      actual = originalOpen(...args);
      for (const name of ['onsuccess', 'onerror', 'onblocked', 'onupgradeneeded']) actual[name] = event => request[name]?.(event);
    };
    announce();
    return request;
  };
  try {
    const outcome = action().then(value => ({ value }), error => ({ error }));
    await gated;
    indexedDB.open = originalOpen;
    await restoreBackup({ format: 'sound-trainer-backup', version: 3, featureVersion: 2,
      guns: [], activeGunId: null, settings: {}, gunSettings: [], examples: [], events: [], sessions: [] });
    release();
    return await outcome;
  } finally { indexedDB.open = originalOpen; }
}

test.each([
  ['preference', gun => setGunSetting('audioPreferences', { noiseFilter: true, autoGain: false }, gun.id), 2],
  ['learned sample', gun => addExample('draw', features, gun.id), 2],
  ['recognition event', gun => addEvent({ label: 'draw', score: 80 }, gun.id), 4],
  ['custom preset', gun => saveCustomDrill({ title: 'Practice', steps: ['trigger'] }, gun.id), 2],
])('pending %s write cannot create orphaned gun data after library replacement', async (_, action, gatedOpen) => {
  const gun = await makeGun('Old owner');
  const outcome = await replaceLibraryDuringPendingWrite(() => action(gun), gatedOpen);
  expect(outcome.error).toBeInstanceOf(Error);
  expect(outcome.error.message).toMatch(/gun|owner|profile/i);
  const backup = await exportBackup();
  expect(backup.guns).toEqual([]);
  expect(backup.gunSettings).toEqual([]);
  expect(backup.examples).toEqual([]);
  expect(backup.events).toEqual([]);
  expect(backup.sessions).toEqual([]);
  await expect(restoreBackup(backup)).resolves.toMatchObject({ guns: 0 });
});
