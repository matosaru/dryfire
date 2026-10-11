import * as storage from '../src/storage.js';
import { createPractice, tickPractice, detectPractice, toPracticeRecord } from '../src/practiceSession.js';
import { createSession, tickSession, recordSessionDetection, toSessionRecord } from '../src/drillSession.js';
import { jest } from '@jest/globals';

const features = Array(15).fill(.25);
const config = { repetitions: 1, delayMode: 'fixed', fixedDelaySeconds: 0, soundAtStart: false };
const removeDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('dryfire-sound-trainer');
  request.onsuccess = resolve; request.onerror = () => reject(request.error);
});
beforeEach(removeDb);
afterAll(removeDb);

function practice(gun) {
  let state = createPractice({ id: `practice-${gun.id}`, gun, mode: 'single', config, monoNow: 0, epochNow: 1000 });
  state = tickPractice(state, { monoNow: 0, epochNow: 1000 });
  state = detectPractice(state, { label: 'trigger', score: 90, detectedAtMs: 300 }, { monoNow: 400, epochNow: 1400 });
  return toPracticeRecord(state);
}
function sequence(gun) {
  const drill = { id: 'trigger-only', title: 'Trigger Pull', steps: ['trigger'] };
  let state = createSession({ id: `sequence-${gun.id}`, gun, drill, config, monoNow: 0, epochNow: 2000 });
  state = tickSession(state, { monoNow: 0, epochNow: 2000 });
  state = recordSessionDetection(state, { label: 'trigger', score: 90, detectedAtMs: 400 }, { monoNow: 450, epochNow: 2450 });
  return toSessionRecord(state);
}
async function ownedData(gun) {
  await storage.addExample('trigger', features, gun.id);
  await storage.addCalibrationExample('noise', features, gun.id);
  await storage.addEvent({ label: 'trigger', score: 90, actualLabel: 'trigger' }, gun.id);
  await storage.saveCustomDrill({ title: 'Two clicks', steps: ['trigger', 'trigger'] }, gun.id);
  await storage.setGunSetting('audioPreferences', { noiseFilter: false, autoGain: true }, gun.id);
  await storage.saveSession(practice(gun), gun.id);
  await storage.saveSession(sequence(gun), gun.id);
}
async function seed() {
  const a = await storage.createGun({ name: 'A', type: 'Handguns' });
  const b = await storage.createGun({ name: 'B', type: 'Shotguns' });
  await ownedData(a); await ownedData(b);
  await storage.setSetting('appearance', 'light');
  return { a, b };
}
const comparable = backup => ({ ...backup, exportedAt: 0 });

test('deleting one nonselected gun removes all owned data, preserves the other gun and restores from backup', async () => {
  const { a, b } = await seed();
  const before = await storage.exportBackup();
  expect(typeof storage.deleteGun).toBe('function');
  await storage.deleteGun(a.id);
  const after = await storage.exportBackup();
  expect(after.guns).toEqual([b]);
  for (const key of ['examples', 'events', 'gunSettings', 'sessions']) {
    expect(after[key]).toEqual(before[key].filter(row => row.gunId !== a.id));
  }
  expect(after.settings).toEqual(before.settings);
  expect(after.activeGunId).toBe(b.id);
  await storage.restoreBackup(before);
  expect(comparable(await storage.exportBackup())).toEqual(comparable(before));
});

test('deleting the active gun selects the oldest remaining profile and concurrent deletions keep a valid selection', async () => {
  const { a, b } = await seed();
  const c = await storage.createGun({ name: 'C', type: 'Rifles and Carbines' });
  const oldest = (await storage.getGuns()).filter(gun => gun.id !== c.id)[0];
  await storage.deleteGun(c.id);
  expect((await storage.getActiveGun()).id).toBe(oldest.id);
  await Promise.all([storage.deleteGun(a.id), storage.deleteGun(b.id)]);
  expect(await storage.getGuns()).toEqual([]);
  expect(await storage.getActiveGun()).toBeNull();
});

test('deleting the last gun clears selection and owned stores but retains device preferences and frees capacity', async () => {
  const gun = await storage.createGun({ name: 'Last', type: 'Handguns' });
  await ownedData(gun); await storage.setSetting('appearance', 'light');
  await storage.deleteGun(gun.id);
  const backup = await storage.exportBackup();
  for (const key of ['guns', 'examples', 'events', 'gunSettings', 'sessions']) expect(backup[key]).toEqual([]);
  expect(backup.activeGunId).toBeNull();
  expect(backup.settings).toEqual({ appearance: 'light' });
  await expect(storage.restoreBackup(backup)).resolves.toMatchObject({ guns: 0 });
  const next = await storage.createGun({ name: 'New', type: 'Handguns' });
  expect((await storage.getActiveGun()).id).toBe(next.id);
});

test('unknown deletion and aborted selection changes preserve the complete library', async () => {
  const gun = await storage.createGun({ name: 'Keep', type: 'Handguns' });
  await ownedData(gun);
  const before = await storage.exportBackup();
  await expect(storage.deleteGun('missing')).rejects.toThrow(/gun|profile/i);
  const original = IDBObjectStore.prototype.delete;
  const spy = jest.spyOn(IDBObjectStore.prototype, 'delete').mockImplementation(function(key) {
    if (this.name === 'settings') throw new Error('Injected deletion failure');
    return original.call(this, key);
  });
  try { await expect(storage.deleteGun(gun.id)).rejects.toThrow('Injected deletion failure'); }
  finally { spy.mockRestore(); }
  expect(comparable(await storage.exportBackup())).toEqual(comparable(before));
});

test('clearing sessions deletes both session kinds for only their owner and preserves every other store', async () => {
  const { a } = await seed();
  const before = await storage.exportBackup();
  expect(typeof storage.clearSessions).toBe('function');
  await storage.clearSessions(a.id);
  const after = await storage.exportBackup();
  expect(await storage.getSessions(a.id)).toEqual([]);
  expect(await storage.getSession(practice(a).id, a.id)).toBeNull();
  expect(after.sessions).toEqual(before.sessions.filter(row => row.gunId !== a.id));
  for (const key of ['guns', 'examples', 'events', 'gunSettings', 'settings']) expect(after[key]).toEqual(before[key]);
  await storage.saveSession({ ...practice(a), id: 'new-practice-after-clear' }, a.id);
  expect(await storage.getSessions(a.id)).toHaveLength(1);
});

test('clearing recognition events preserves all sessions and the other gun’s events', async () => {
  const { a } = await seed();
  const before = await storage.exportBackup();
  await storage.clearEvents(a.id);
  const after = await storage.exportBackup();
  expect(after.events).toEqual(before.events.filter(row => row.gunId !== a.id));
  for (const key of ['guns', 'examples', 'sessions', 'gunSettings', 'settings']) expect(after[key]).toEqual(before[key]);
});

test('an aborted session clear keeps all saved sessions and owned data intact', async () => {
  const { a } = await seed();
  const before = await storage.exportBackup();
  const original = IDBCursor.prototype.delete;
  let deletes = 0;
  const spy = jest.spyOn(IDBCursor.prototype, 'delete').mockImplementation(function() {
    if (++deletes === 2) throw new Error('Injected cursor failure');
    return original.call(this);
  });
  try { await expect(storage.clearSessions(a.id)).rejects.toThrow('Injected cursor failure'); }
  finally { spy.mockRestore(); }
  expect(comparable(await storage.exportBackup())).toEqual(comparable(before));
});

test.each(['sample', 'session'])('a pending %s write cannot recreate data after its gun is deleted', async kind => {
  const gun = await storage.createGun({ name: 'Deleted owner', type: 'Handguns' });
  const originalOpen = indexedDB.open.bind(indexedDB);
  let calls = 0, release, announce;
  const gated = new Promise(resolve => { announce = resolve; });
  indexedDB.open = (...args) => {
    if (++calls !== 2) return originalOpen(...args);
    let actual;
    const request = { get result() { return actual?.result; }, get error() { return actual?.error; } };
    release = () => {
      actual = originalOpen(...args);
      for (const name of ['onsuccess', 'onerror', 'onblocked']) actual[name] = event => request[name]?.(event);
    };
    announce(); return request;
  };
  try {
    const action = kind === 'sample' ? storage.addExample('trigger', features, gun.id) : storage.saveSession(practice(gun), gun.id);
    const outcome = action.then(value => ({ value }), error => ({ error }));
    await gated; indexedDB.open = originalOpen;
    await storage.deleteGun(gun.id); release();
    expect((await outcome).error?.message).toMatch(/gun|profile/i);
    const after = await storage.exportBackup();
    expect(after.examples).toEqual([]); expect(after.sessions).toEqual([]);
  } finally { indexedDB.open = originalOpen; }
});
