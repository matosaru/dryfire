import {
  addEvent, addExample, clearEvents, clearExamples, clearExamplesForLabel, getEvents, getExamples,
  getOutdatedExampleCount, getSetting, normalizeMaxResults, setSetting, trimEvents, verifyEvent,
  MAX_EXAMPLES_PER_CLASS, createGun, getGunSetting, setGunSetting,
} from '../src/storage.js';

const DB_NAME = 'dryfire-sound-trainer';

function deleteDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Database deletion blocked'));
  });
}

describe('IndexedDB storage', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await createGun({ name: 'Test gun', type: 'Handguns' });
  });
  afterAll(deleteDatabase);

  test('unknown predictions do not create durable events or trim known history', async () => {
    const known = await addEvent({ label: 'trigger', score: 90 });
    for (const label of [null, 'unknown']) expect(await addEvent({ label, score: 0 })).toBeNull();
    expect(await getEvents()).toEqual([known]);
  });

  test('approved recording cap is ten and concurrent attempts cannot exceed it', async () => {
    expect(MAX_EXAMPLES_PER_CLASS).toBe(10);
    const attempts = await Promise.allSettled(Array.from({ length: 12 }, () => addExample('trigger', [0.1, 0.2])));
    expect(attempts.filter(result => result.status === 'fulfilled')).toHaveLength(10);
    expect(await getExamples()).toHaveLength(10);
  });

  test('stores and clears current training vectors', async () => {
    await addExample('draw', [0.1, 0.2]);
    await addExample('trigger', [0.9, 1.0]);
    await addExample('rack', [0.4, 0.5]);
    const items = await getExamples();
    expect(items).toHaveLength(3);
    expect(items.every(row => row.featureVersion === 2)).toBe(true);
    await clearExamples();
    expect(await getExamples()).toHaveLength(0);
  });

  test('clears only the requested learned sound, keeping others and history', async () => {
    await addExample('draw',[0.1,0.2]);
    await addExample('rack',[0.2,0.3]);
    await addExample('trigger',[0.3,0.4]);
    await addExample('reload',[0.4,0.5]);
    const event = await addEvent({ label:'draw', score:75 });
    await clearExamplesForLabel('draw');
    expect((await getExamples()).map(x=>x.label).sort()).toEqual(['rack','reload','trigger']);
    expect((await getEvents()).map(x=>x.id)).toEqual([event.id]);
    await expect(clearExamplesForLabel('bad')).rejects.toThrow(TypeError);
  });

  test('rejects invalid training samples', async () => {
    await expect(addExample('nope', [1])).rejects.toThrow(TypeError);
    await expect(addExample('draw', [Infinity])).rejects.toThrow(TypeError);
    expect(await getExamples()).toHaveLength(0);
  });

  test('can identify incompatible old model vectors without mixing them', async () => {
    await deleteDatabase();
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      // Simulate the previous schema, not a brand-new empty database.
      request.onupgradeneeded = () => {
        const store = request.result.createObjectStore('examples', { keyPath: 'id' });
        store.createIndex('label', 'label', { unique: false });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise((resolve, reject) => {
        const tx = db.transaction('examples', 'readwrite');
        tx.objectStore('examples').put({ id: 'old', label: 'draw', features: [1], createdAt: 10 });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });
    } finally {
      // Always close, including on an assertion or transaction failure.
      db.close();
    }
    expect(await getOutdatedExampleCount()).toBe(1);
    expect(await getExamples()).toEqual([]);
  });

  test('keeps settings with a fallback and normalizes N', async () => {
    expect(await getSetting('appearance', 'system')).toBe('system');
    await setSetting('appearance', 'dark');
    expect(await getSetting('appearance', 'system')).toBe('dark');
    await setGunSetting('maxResults', 2);
    expect(await getGunSetting('maxResults', 50)).toBe(2);
    expect(normalizeMaxResults(0)).toBe(1);
    expect(normalizeMaxResults(1000)).toBe(500);
    expect(normalizeMaxResults('none')).toBe(50);
    expect(normalizeMaxResults(2.9)).toBe(2);
  });

  test('stores events newest first, respecting N and preventing spoofed system fields', async () => {
    await setGunSetting('maxResults', 2);
    const originalNow = Date.now;
    let now = 1000;
    Date.now = () => now++;
    try {
      await addEvent({ label: 'draw', score: 60, createdAt: 1, id: 'user-supplied' });
      await addEvent({ label: 'reload', score: 75 });
      await addEvent({ label: 'trigger', score: 90 });
    } finally { Date.now = originalNow; }
    const events = await getEvents();
    expect(events.map(e => e.label)).toEqual(['trigger', 'reload']);
    expect(events.every(e => e.id !== 'user-supplied')).toBe(true);
    expect(events[0].createdAt).toBeGreaterThan(events[1].createdAt);
  });

  test('limits concurrent event writes to last N', async () => {
    await setGunSetting('maxResults', 3);
    await Promise.all(Array.from({ length: 12 }, (_, i) => addEvent({ label: 'draw', score: i })));
    expect(await getEvents()).toHaveLength(3);
    await trimEvents(1);
    expect(await getEvents()).toHaveLength(1);
    await clearEvents();
    expect(await getEvents()).toEqual([]);
  });


  test('manual ground truth persists without altering a prediction and can be cleared', async () => {
    const item = await addEvent({ label: 'draw', score: 68 });
    const updated = await verifyEvent(item.id, 'reload');
    expect(updated.label).toBe('draw');
    expect(updated.actualLabel).toBe('reload');
    expect((await getEvents())[0].actualLabel).toBe('reload');
    await verifyEvent(item.id, null);
    expect((await getEvents())[0].actualLabel).toBeUndefined();
    await expect(verifyEvent(item.id, 'invalid')).rejects.toThrow(TypeError);
    await expect(verifyEvent('nonexistent', 'draw')).rejects.toThrow(/not found/i);
  });

  test('exports bounded per-class capacity', () => {
    expect(MAX_EXAMPLES_PER_CLASS).toBe(10);
  });
});

describe('portable local backup', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await createGun({ name: 'Test gun', type: 'Handguns' });
  });
  afterAll(deleteDatabase);

  test('restores learned examples, verification labels and result limit', async () => {
    const { exportBackup, restoreBackup } = await import('../src/storage.js');
    await setGunSetting('maxResults', 2);
    await addExample('draw', Array(15).fill(0.25));
    const detection = await addEvent({ label: 'draw', score: 63 });
    await verifyEvent(detection.id, 'reload');
    const backup = await exportBackup();
    expect(backup.format).toBe('sound-trainer-backup');
    await clearExamples();
    await clearEvents();
    await setGunSetting('maxResults', 50);
    const stats = await restoreBackup(backup);
    expect(stats).toEqual({ guns: 1, examples: 1, events: 1, sessions: 0, maxResults: 2 });
    expect((await getExamples())[0].features).toHaveLength(15);
    expect((await getEvents())[0].actualLabel).toBe('reload');
    expect(await getGunSetting('maxResults', 50)).toBe(2);
  });

  test('restores newly learned slide-racking samples', async () => {
    const { exportBackup, restoreBackup } = await import('../src/storage.js');
    await addExample('rack', Array(15).fill(0.4));
    const backup = await exportBackup();
    await clearExamples();
    await restoreBackup(backup);
    expect((await getExamples()).map(row => row.label)).toEqual(['rack']);
  });

  test('rejects malformed backup without erasing existing data', async () => {
    const { restoreBackup } = await import('../src/storage.js');
    await addExample('draw', Array(15).fill(0.1));
    await expect(restoreBackup({format:'sound-trainer-backup',version:1,featureVersion:2,examples:[{id:'x',label:'draw',featureVersion:2,features:[3]}],events:[]})).rejects.toThrow(/incompatible/);
    expect(await getExamples()).toHaveLength(1);
  });
});
