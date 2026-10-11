import {
  addEvent, addExample, clearEvents, clearExamples, clearExamplesForLabel, createGun,
  exportBackup, getEvents, getExamples, getGunSetting, getGuns, getSession, getSessions,
  getSetting, recoverInterruptedSessions, restoreBackup, saveCustomDrill, saveSession,
  setActiveGun, setGunSetting, setSetting, trimEvents,
} from '../src/storage.js';

import { createSession, tickSession, recordSessionDetection, pauseSession, resumeSession, endSession, toSessionRecord } from '../src/drillSession.js';

const DB_NAME = 'dryfire-sound-trainer';
const features = Array(15).fill(0.25);
const makeGun = name => createGun({ name, type: 'Handguns' });
const removeDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase(DB_NAME);
  request.onsuccess = resolve;
  request.onerror = () => reject(request.error);
  request.onblocked = () => reject(new Error('Database deletion blocked'));
});
const config = { repetitions: 2, delayMode: 'fixed', fixedDelaySeconds: 3,
  randomMinSeconds: 2, randomMaxSeconds: 5, soundAtStart: false };

function attempt(number, { status = 'completed', ordinal = number } = {}) {
  const startedAt = 1000 + (number - 1) * 4000;
  const goAt = startedAt + 3000;
  return { attempt: number, ordinal, status, startedAt, goAt, endedAt: goAt + 300,
    reason: status === 'partial' ? 'pause' : null, elapsedMs: 300, unknown: 0, incorrect: 0,
    detections: status === 'completed' ? [{ label: 'trigger', score: 80, offsetMs: 300, outcome: 'completed', position: 0 }] : [],
    stepTimings: status === 'completed' ? [{ label: 'trigger', offsetMs: 300, splitMs: 300 }] : [] };
}

function session(gun, overrides = {}) {
  return { id: 'session-one', gunId: gun.id, gunName: gun.name, gunType: gun.type,
    drillId: 'trigger-only', drillTitle: 'Trigger pull', drillSteps: ['trigger'], config: { ...config },
    revision: 0, startedAt: 1000, updatedAt: 1000, endedAt: null, status: 'running', endReason: null,
    completed: 0, remaining: 2, repetitions: [],
    currentAttempt: { attempt: 1, ordinal: 1, status: 'waiting', startedAt: 1000, goAt: null, endedAt: null,
      reason: null, elapsedMs: null, unknown: 0, incorrect: 0, detections: [], stepTimings: [] }, ...overrides };
}

function completedSession(gun, overrides = {}) {
  return session(gun, { revision: 2, updatedAt: 9000, endedAt: 9000, status: 'completed', endReason: 'completed',
    completed: 2, remaining: 0, repetitions: [attempt(1), attempt(2)], currentAttempt: null, ...overrides });
}

beforeEach(removeDb);
afterAll(removeDb);

test('schema-two upgrade creates separate session store and preserves models, events and all preferences', async () => {
  const gun = { id: 'existing-gun', name: 'Existing gun', type: 'Handguns', needsDetails: false, createdAt: 10 };
  const example = { id: 'existing-model', gunId: gun.id, label: 'draw', features, featureVersion: 2, createdAt: 20 };
  const event = { id: 'existing-result', gunId: gun.id, label: 'draw', score: 80, actualLabel: 'rack', createdAt: 30 };
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const ex = request.result.createObjectStore('examples', { keyPath: 'id' });
      ex.createIndex('label', 'label'); ex.createIndex('gunId', 'gunId');
      const ev = request.result.createObjectStore('events', { keyPath: 'id' });
      ev.createIndex('createdAt', 'createdAt'); ev.createIndex('gunId', 'gunId');
      request.result.createObjectStore('settings', { keyPath: 'key' });
      request.result.createObjectStore('guns', { keyPath: 'id' });
      const prefs = request.result.createObjectStore('gunSettings', { keyPath: ['gunId', 'key'] });
      prefs.createIndex('gunId', 'gunId');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(['examples', 'events', 'settings', 'guns', 'gunSettings'], 'readwrite');
      tx.objectStore('examples').put(example); tx.objectStore('events').put(event); tx.objectStore('guns').put(gun);
      tx.objectStore('settings').put({ key: 'activeGunId', value: gun.id });
      tx.objectStore('settings').put({ key: 'appearance', value: 'light' });
      tx.objectStore('settings').put({ key: 'vibrationFeedback', value: true });
      tx.objectStore('gunSettings').put({ gunId: gun.id, key: 'maxResults', value: 42 });
      tx.objectStore('gunSettings').put({ gunId: gun.id, key: 'drillConfig', value: { ...config } });
      tx.objectStore('gunSettings').put({ gunId: gun.id, key: 'noiseFilter', value: true });
      tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
  expect(await getSessions(gun.id)).toEqual([]);
  expect(await getGuns()).toEqual([gun]);
  expect(await getExamples(gun.id)).toEqual([example]);
  expect(await getEvents(gun.id)).toEqual([event]);
  expect(await getGunSetting('maxResults', 50, gun.id)).toBe(42);
  expect(await getGunSetting('drillConfig', null, gun.id)).toEqual(config);
  expect(await getGunSetting('noiseFilter', false, gun.id)).toBe(true);
  expect(await getSetting('appearance', 'dark')).toBe('light');
  expect(await getSetting('vibrationFeedback', false)).toBe(true);
  expect((await exportBackup()).version).toBe(4);
});

test('owned session snapshots remain separate after active selection and preset changes', async () => {
  const a = await makeGun('A');
  const b = await makeGun('B');
  const preset = await saveCustomDrill({ title: 'Single press', steps: ['trigger'] }, a.id);
  const record = completedSession(a, { drillId: preset.id, drillTitle: preset.title });
  expect(await saveSession(record, a.id)).toEqual(record);
  await setActiveGun(b.id);
  expect(await getSessions()).toEqual([]);
  expect(await getSession(record.id, b.id)).toBeNull();
  await expect(saveSession({ ...record, gunId: b.id }, b.id)).rejects.toThrow(/owner|gun|session/i);
  await saveCustomDrill({ ...preset, title: 'Edited preset', steps: ['rack'] }, a.id);
  expect(await getSession(record.id, a.id)).toEqual(record);
  const backup = await exportBackup();
  await removeDb();
  await restoreBackup(backup);
  expect(await getSession(record.id, a.id)).toEqual(record);
});

test('completed results survive sound resets and recent recognition-history trim/clear', async () => {
  const gun = await makeGun('A');
  const record = completedSession(gun);
  await saveSession(record, gun.id);
  await addExample('draw', features, gun.id);
  await addExample('rack', features, gun.id);
  await addEvent({ label: 'trigger', score: 80 }, gun.id);
  await addEvent({ label: 'draw', score: 70 }, gun.id);
  await clearExamplesForLabel('draw', gun.id);
  await clearExamples(gun.id);
  await trimEvents(1, gun.id);
  await clearEvents(gun.id);
  expect(await getSession(record.id, gun.id)).toEqual(record);
  expect(await getSessions(gun.id)).toHaveLength(1);
});

test('save snapshots are detached and stale revisions cannot overwrite completed results', async () => {
  const gun = await makeGun('A');
  const initial = session(gun);
  await saveSession(initial, gun.id);
  initial.drillSteps[0] = 'rack';
  expect((await getSession(initial.id, gun.id)).drillSteps).toEqual(['trigger']);
  const final = completedSession(gun);
  await saveSession(final, gun.id);
  const stale = session(gun, { revision: 1 });
  expect(await saveSession(stale, gun.id)).toEqual(final);
  expect(await getSession(final.id, gun.id)).toEqual(final);
  await expect(saveSession({ ...final, revision: 3, drillTitle: 'Changed' }, gun.id)).rejects.toThrow(/snapshot|change|immutable/i);
  expect(await getSession(final.id, gun.id)).toEqual(final);
});

test('startup recovery preserves complete attempts and accurately saves a partial interrupted attempt', async () => {
  const gun = await makeGun('A');
  const pending = session(gun, { revision: 1, updatedAt: 8500, completed: 1, remaining: 1,
    repetitions: [attempt(1)], currentAttempt: { ...attempt(2, { status: 'partial' }), status: 'active', endedAt: null, reason: null,
      detections: [{ label: 'unknown', score: 0, offsetMs: 100, outcome: 'unknown', position: 0 }], unknown: 1, elapsedMs: null } });
  await saveSession(pending, gun.id);
  const recovered = await recoverInterruptedSessions(gun.id);
  expect(recovered).toHaveLength(1);
  expect(recovered[0]).toMatchObject({ status: 'interrupted', endReason: 'refresh', completed: 1, remaining: 1,
    currentAttempt: null, revision: 2 });
  expect(recovered[0].repetitions[0]).toEqual(pending.repetitions[0]);
  expect(recovered[0].repetitions[1]).toMatchObject({ status: 'partial', reason: 'refresh', unknown: 1 });
  expect(await recoverInterruptedSessions(gun.id)).toEqual([]);
});

test('paused recovery never reopens microphone or claims a partial attempt completed', async () => {
  const gun = await makeGun('A');
  const record = session(gun, { status: 'paused', updatedAt: 5000, repetitions: [attempt(1, { status: 'partial' })], currentAttempt: null });
  await saveSession(record, gun.id);
  const [recovered] = await recoverInterruptedSessions(gun.id);
  expect(recovered).toMatchObject({ status: 'interrupted', completed: 0, remaining: 2, currentAttempt: null });
  expect(recovered.repetitions).toEqual(record.repetitions);
});

test('a durable completed target still waiting for its result display recovers as completed', async () => {
  const gun = await makeGun('A');
  const record = completedSession(gun, { status: 'running', endedAt: null, endReason: null });
  await saveSession(record, gun.id);
  const [recovered] = await recoverInterruptedSessions(gun.id);
  expect(recovered).toMatchObject({ status: 'completed', completed: 2, remaining: 0, currentAttempt: null });
  expect(recovered.repetitions).toEqual(record.repetitions);
});

test('sessions remain untrimmed and sort newest first', async () => {
  const gun = await makeGun('A');
  await setGunSetting('maxResults', 1, gun.id);
  for (let i = 0; i < 8; i++) await saveSession(completedSession(gun, { id: `session-${i}`, startedAt: i + 1 }), gun.id);
  expect((await getSessions(gun.id)).map(row => row.id)).toEqual(Array.from({ length: 8 }, (_, i) => `session-${7 - i}`));
});

test('current whole-library backup restores all gun-owned sessions and preferences', async () => {
  const a = await makeGun('A');
  const b = await makeGun('B');
  const first = completedSession(a);
  const second = completedSession(b, { id: 'session-two', status: 'ended', endReason: 'user', completed: 1, remaining: 1,
    repetitions: [attempt(1)], currentAttempt: null });
  await saveSession(first, a.id); await saveSession(second, b.id);
  await setGunSetting('autoGain', true, b.id); await setSetting('appearance', 'system');
  const backup = await exportBackup();
  expect(backup).toMatchObject({ version: 4, sessions: expect.arrayContaining([first, second]) });
  await removeDb();
  expect(await restoreBackup(backup)).toMatchObject({ guns: 2, sessions: 2 });
  expect(await getSessions(a.id)).toEqual([first]); expect(await getSessions(b.id)).toEqual([second]);
  expect(await getGunSetting('autoGain', false, b.id)).toBe(true); expect(await getSetting('appearance', 'dark')).toBe('system');
});

test('older version-two whole-library replacement keeps old data compatible and contains no sessions', async () => {
  const gun = await makeGun('A');
  await addExample('draw', features, gun.id); await addEvent({ label: 'draw', score: 60 }, gun.id);
  await setGunSetting('maxResults', 12, gun.id);
  const backup = await exportBackup(); backup.version = 2; delete backup.sessions;
  await saveSession(completedSession(gun), gun.id);
  const stats = await restoreBackup(backup);
  expect(stats).toMatchObject({ guns: 1, examples: 1, events: 1, sessions: 0, maxResults: 12 });
  expect(await getSessions(gun.id)).toEqual([]);
  expect(await getExamples(gun.id)).toHaveLength(1); expect(await getEvents(gun.id)).toHaveLength(1);
});

test.each([
  ['unknown owner', backup => { backup.sessions[0].gunId = 'missing'; }],
  ['duplicate session', backup => { backup.sessions.push(structuredClone(backup.sessions[0])); }],
  ['wrong counts', backup => { backup.sessions[0].completed = 0; }],
  ['wrong status', backup => { backup.sessions[0].status = 'not-real'; }],
  ['bad config', backup => { backup.sessions[0].config.repetitions = 101; }],
  ['negative sound timing', backup => { backup.sessions[0].repetitions[0].stepTimings[0].offsetMs = -1; }],
  ['invalid detection label', backup => { backup.sessions[0].repetitions[0].detections[0].label = 'shot'; }],
  ['missing completion detection', backup => { backup.sessions[0].repetitions[0].detections = []; }],
  ['unmatched split timing', backup => { backup.sessions[0].repetitions[0].detections[0].offsetMs = 250; }],
  ['false completion', backup => { backup.sessions[0].repetitions[0].status = 'partial'; }],
  ['invalid sequence', backup => { backup.sessions[0].drillSteps = []; }],
  ['sparse sessions', backup => { backup.sessions = Array(1); }],
])('invalid session %s rejects complete backup before replacing current library', async (_, damage) => {
  const gun = await makeGun('Keep'); await addExample('draw', features, gun.id);
  await saveSession(completedSession(gun), gun.id);
  const before = await exportBackup(); const broken = structuredClone(before); damage(broken);
  await expect(restoreBackup(broken)).rejects.toThrow();
  const after = await exportBackup();
  expect({ ...after, exportedAt: null }).toEqual({ ...before, exportedAt: null });
});


test('real engine records save and restore across countdown, GO, completion and pause/resume', async () => {
  const gun = await makeGun('Actual engine');
  const drill = { id: 'trigger-only', title: 'Trigger pull', steps: ['trigger'] };
  let state = createSession({ id: 'actual-engine', gun, drill, config, monoNow: 0, epochNow: 1000 });
  const persist = async () => expect(await saveSession(toSessionRecord(state), gun.id)).toEqual(toSessionRecord(state));
  await persist();
  state = tickSession(state, { monoNow: 3000, epochNow: 4000 }); await persist();
  state = recordSessionDetection(state, { label: 'trigger', score: 82, detectedAtMs: 3500 }, { monoNow: 3500, epochNow: 4500 });
  await persist();
  expect(state.completed).toBe(1);
  state = tickSession(state, { monoNow: 4500, epochNow: 5500 }); await persist();
  state = pauseSession(state, { monoNow: 5000, epochNow: 6000 }); await persist();
  state = resumeSession(state, { monoNow: 6000, epochNow: 7000 }); await persist();
  state = tickSession(state, { monoNow: 9000, epochNow: 10000 }); await persist();
  state = recordSessionDetection(state, { label: 'unknown', score: 0, detectedAtMs: 9200 }, { monoNow: 9300, epochNow: 10300 }); await persist();
  state = recordSessionDetection(state, { label: 'trigger', score: 88, detectedAtMs: 9500 }, { monoNow: 9600, epochNow: 10600 }); await persist();
  expect(state).toMatchObject({ completed: 2, remaining: 0, status: 'running' });
  state = tickSession(state, { monoNow: 10600, epochNow: 11600 }); await persist();
  const expected = toSessionRecord(state);
  expect(expected.status).toBe('completed');
  expect(expected.repetitions.map(row => row.status)).toEqual(['completed', 'partial', 'completed']);
  const backup = await exportBackup(); await removeDb(); await restoreBackup(backup);
  expect(await getSession(expected.id, gun.id)).toEqual(expected);
  expect(await recoverInterruptedSessions(gun.id)).toEqual([]);
});

test('version-three restore replaces all backed-up global preferences instead of leaving stale settings', async () => {
  await makeGun('Backup owner');
  await setSetting('appearance', 'light');
  const backup = await exportBackup();
  await setSetting('appearance', 'dark');
  await setSetting('stalePreference', true);
  await restoreBackup(backup);
  expect(await getSetting('appearance', 'dark')).toBe('light');
  expect(await getSetting('stalePreference', 'missing')).toBe('missing');
});


test('real custom sequence snapshots preserve unknown/out-of-order detections and an active interruption', async () => {
  const gun = await makeGun('Custom engine');
  const drill = await saveCustomDrill({ title: 'Three actions', steps: ['draw', 'rack', 'trigger'] }, gun.id);
  let state = createSession({ id: 'custom-engine', gun, drill, config: { ...config, repetitions: 1, fixedDelaySeconds: 0 }, monoNow: 0, epochNow: 1000 });
  state = tickSession(state, { monoNow: 0, epochNow: 1000 });
  for (const [label, detectedAtMs] of [['draw', 100], ['unknown', 200], ['draw', 300], ['rack', 400]]) {
    state = recordSessionDetection(state, { label, score: label === 'unknown' ? 0 : 80, detectedAtMs }, { monoNow: detectedAtMs, epochNow: 1000 + detectedAtMs });
    expect(await saveSession(toSessionRecord(state), gun.id)).toEqual(toSessionRecord(state));
  }
  state = pauseSession(state, { monoNow: 450, epochNow: 1450 });
  await saveSession(toSessionRecord(state), gun.id);
  expect(state.repetitions[0]).toMatchObject({ status: 'partial', unknown: 0, incorrect: 1, ordinal: 1 });
  state = resumeSession(state, { monoNow: 500, epochNow: 1500 });
  state = tickSession(state, { monoNow: 500, epochNow: 1500 });
  state = recordSessionDetection(state, { label: 'draw', score: 85, detectedAtMs: 600 }, { monoNow: 600, epochNow: 1600 });
  state = endSession(state, { monoNow: 700, epochNow: 1700, interrupted: true, reason: 'microphone-error' });
  const record = toSessionRecord(state);
  expect(record).toMatchObject({ status: 'interrupted', completed: 0, remaining: 1, endReason: 'microphone-error' });
  expect(await saveSession(record, gun.id)).toEqual(record);
  expect(await getSession(record.id, gun.id)).toEqual(record);
  const backup = await exportBackup(); await removeDb(); await restoreBackup(backup);
  expect(await getSession(record.id, gun.id)).toEqual(record);
});

test('pending session save cannot recreate an orphan after atomic library replacement', async () => {
  const gun = await makeGun('Old session owner');
  const originalOpen = indexedDB.open.bind(indexedDB);
  let calls = 0;
  let release;
  let announce;
  const gated = new Promise(resolve => { announce = resolve; });
  indexedDB.open = (...args) => {
    if (++calls !== 2) return originalOpen(...args);
    let actual;
    const request = {
      get result() { return actual?.result; }, get error() { return actual?.error; },
      get transaction() { return actual?.transaction; },
    };
    release = () => {
      actual = originalOpen(...args);
      for (const name of ['onsuccess', 'onerror', 'onblocked', 'onupgradeneeded']) actual[name] = event => request[name]?.(event);
    };
    announce(); return request;
  };
  try {
    const result = saveSession(completedSession(gun), gun.id).then(value => ({ value }), error => ({ error }));
    await gated; indexedDB.open = originalOpen;
    await restoreBackup({ format: 'sound-trainer-backup', version: 3, featureVersion: 2,
      guns: [], activeGunId: null, settings: {}, gunSettings: [], examples: [], events: [], sessions: [] });
    release();
    const outcome = await result;
    expect(outcome.error).toBeInstanceOf(Error);
    expect(outcome.error.message).toMatch(/gun|owner|profile/i);
    expect((await exportBackup()).sessions).toEqual([]);
  } finally { indexedDB.open = originalOpen; }
});
