import { FEATURE_VERSION } from './audio.js';
import { isFeatureVector, labels } from './classifier.js';
import { ACTUAL_CLASSES } from './evaluation.js';
import { getDrill } from './drills.js';

const DB_NAME = 'dryfire-sound-trainer';
const DB_VERSION = 1; // Retain existing stores, but version individual example features.
const EXAMPLES = 'examples';
const EVENTS = 'events';
const SETTINGS = 'settings';
export const MAX_EXAMPLES_PER_CLASS = 50;

export function normalizeMaxResults(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(500, Math.trunc(n)));
}

function openDb() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('IndexedDB is unavailable on this device.'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(EXAMPLES)) {
        const store = db.createObjectStore(EXAMPLES, { keyPath: 'id' });
        store.createIndex('label', 'label', { unique: false });
      }
      if (!db.objectStoreNames.contains(EVENTS)) {
        const store = db.createObjectStore(EVENTS, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(SETTINGS)) db.createObjectStore(SETTINGS, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Local database is blocked by another app tab. Close other tabs and retry.'));
  });
}

function withTransaction(storeName, mode, action) {
  return openDb().then(db => new Promise((resolve, reject) => {
    let value;
    const transaction = db.transaction(storeName, mode);
    try { value = action(transaction.objectStore(storeName)); }
    catch (error) { transaction.abort(); reject(error); }
    transaction.oncomplete = () => resolve(value);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('Database transaction aborted.'));
  }).finally(() => db.close()));
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAll(storeName) {
  const db = await openDb();
  try {
    const transaction = db.transaction(storeName, 'readonly');
    return await requestToPromise(transaction.objectStore(storeName).getAll());
  } finally { db.close(); }
}

export async function addExample(label, features) {
  if (!labels.includes(label) || !isFeatureVector(features)) throw new TypeError('Invalid label or audio feature vector.');
  const existing = (await getExamples()).filter(e => e.label === label);
  if (existing.length >= MAX_EXAMPLES_PER_CLASS) throw new Error(`Maximum ${MAX_EXAMPLES_PER_CLASS} examples per sound reached.`);
  const row = { id: crypto.randomUUID(), label, features: [...features], featureVersion: FEATURE_VERSION, createdAt: Date.now() };
  await withTransaction(EXAMPLES, 'readwrite', store => { store.put(row); });
  return row;
}

export async function getExamples() {
  const rows = await getAll(EXAMPLES);
  // Old version-1 examples cannot be mixed with event-centred version-2 features.
  return rows.filter(row => row.featureVersion === FEATURE_VERSION && labels.includes(row.label) && isFeatureVector(row.features));
}

export async function getOutdatedExampleCount() {
  const rows = await getAll(EXAMPLES);
  return rows.filter(row => row.featureVersion !== FEATURE_VERSION).length;
}

export async function clearExamples() {
  await withTransaction(EXAMPLES, 'readwrite', store => { store.clear(); });
}

export async function addEvent(event) {
  const row = {
    label: labels.includes(event.label) ? event.label : 'unknown',
    score: Math.max(0, Math.min(100, Number(event.score) || 0)),
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    ...(getDrill(event.drillId) && ['matched', 'completed', 'incorrect', 'unknown'].includes(event.drillOutcome) &&
        Number.isInteger(event.drillPosition) && event.drillPosition >= 0 &&
        event.drillPosition < getDrill(event.drillId).steps.length
      ? { drillId: event.drillId, drillOutcome: event.drillOutcome,
          drillPosition: event.drillPosition, drillCompleted: event.drillOutcome === 'completed' } : {}),
  };
  const max = normalizeMaxResults(await getSetting('maxResults', 50));
  // Insert then trim within one transaction; concurrent inserts cannot exceed N.
  await withTransaction(EVENTS, 'readwrite', store => {
    store.put(row);
    const all = store.getAll();
    all.onsuccess = () => {
      const sorted = all.result.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
      for (const excess of sorted.slice(max)) store.delete(excess.id);
    };
  });
  return row;
}

/** Manual labels are independent of classifier guesses and never change the model. */
export async function verifyEvent(id, actualLabel) {
  if (typeof id !== 'string' || !id || ![...ACTUAL_CLASSES, null].includes(actualLabel)) {
    throw new TypeError('Invalid recognition event or actual sound label.');
  }
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(EVENTS, 'readwrite');
      const store = tx.objectStore(EVENTS);
      let updated;
      const request = store.get(id);
      request.onsuccess = () => {
        if (!request.result) { tx.abort(); return; }
        updated = { ...request.result };
        if (actualLabel === null) delete updated.actualLabel;
        else updated.actualLabel = actualLabel;
        store.put(updated);
      };
      tx.oncomplete = () => resolve(updated);
      tx.onabort = () => reject(new Error('Recognition event not found or update failed.'));
      tx.onerror = () => reject(tx.error || new Error('Failed to update event.'));
    });
  } finally { db.close(); }
}

export async function getEvents() {
  const rows = await getAll(EVENTS);
  return rows.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
}

export async function clearEvents() {
  await withTransaction(EVENTS, 'readwrite', store => { store.clear(); });
}

export async function trimEvents(maxResults) {
  const max = normalizeMaxResults(maxResults);
  await withTransaction(EVENTS, 'readwrite', store => {
    const request = store.getAll();
    request.onsuccess = () => {
      const sorted = request.result.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
      for (const excess of sorted.slice(max)) store.delete(excess.id);
    };
  });
}

export async function setSetting(key, value) {
  await withTransaction(SETTINGS, 'readwrite', store => { store.put({ key, value }); });
}

export async function getSetting(key, fallback) {
  const db = await openDb();
  try {
    const transaction = db.transaction(SETTINGS, 'readonly');
    const row = await requestToPromise(transaction.objectStore(SETTINGS).get(key));
    return row?.value ?? fallback;
  } finally { db.close(); }
}

/** Portable backup of derived audio features and recognition history only. */
export async function exportBackup() {
  const [examples, events, maxResults] = await Promise.all([
    getExamples(), getEvents(), getSetting('maxResults', 50),
  ]);
  return {
    format: 'sound-trainer-backup', version: 1, featureVersion: FEATURE_VERSION,
    exportedAt: new Date().toISOString(),
    settings: { maxResults: normalizeMaxResults(maxResults) },
    examples, events,
  };
}

/** Validates everything before atomically replacing local model + history. */
export async function restoreBackup(backup) {
  if (!backup || backup.format !== 'sound-trainer-backup' || backup.version !== 1 || backup.featureVersion !== FEATURE_VERSION) {
    throw new Error('This file is not a compatible Sound Trainer backup.');
  }
  if (!Array.isArray(backup.examples) || !Array.isArray(backup.events) || backup.examples.length > MAX_EXAMPLES_PER_CLASS * labels.length || backup.events.length > 500) {
    throw new Error('Backup contains an invalid amount of data.');
  }
  const max = normalizeMaxResults(backup.settings?.maxResults ?? 50);
  const counts = Object.fromEntries(labels.map(label => [label, 0]));
  const ids = new Set();
  const safeExamples = backup.examples.map(row => {
    if (!row || !labels.includes(row.label) || row.featureVersion !== FEATURE_VERSION ||
        !isFeatureVector(row.features) || row.features.length !== 15) {
      throw new Error('Backup contains incompatible learned samples.');
    }
    if (++counts[row.label] > MAX_EXAMPLES_PER_CLASS) throw new Error('Too many examples of one sound.');
    if (typeof row.id !== 'string' || !row.id || ids.has(row.id)) throw new Error('Invalid or duplicated backup ID.');
    ids.add(row.id);
    return { id: row.id, label: row.label, featureVersion: FEATURE_VERSION,
      features: [...row.features], createdAt: Number.isFinite(row.createdAt) ? row.createdAt : Date.now() };
  });
  ids.clear();
  const safeEvents = backup.events.map(row => {
    if (!row || typeof row.id !== 'string' || !row.id || ids.has(row.id) ||
        ![...labels, 'unknown'].includes(row.label) || !Number.isFinite(row.score)) {
      throw new Error('Backup contains an invalid recognition event.');
    }
    if (row.actualLabel !== undefined && !ACTUAL_CLASSES.includes(row.actualLabel)) {
      throw new Error('Backup contains an invalid verification label.');
    }
    const hasDrill = row.drillId !== undefined;
    if (hasDrill && (!getDrill(row.drillId) ||
        !['matched', 'completed', 'incorrect', 'unknown'].includes(row.drillOutcome) ||
        !Number.isInteger(row.drillPosition) || row.drillPosition < 0 ||
        row.drillPosition >= getDrill(row.drillId).steps.length ||
        (row.drillCompleted !== undefined && row.drillCompleted !== (row.drillOutcome === 'completed')))) {
      throw new Error('Backup contains invalid drill metadata.');
    }
    ids.add(row.id);
    return { id: row.id, label: row.label,
      score: Math.max(0, Math.min(100, row.score)),
      createdAt: Number.isFinite(row.createdAt) ? row.createdAt : Date.now(),
      ...(row.actualLabel ? { actualLabel: row.actualLabel } : {}),
      ...(hasDrill ? { drillId: row.drillId, drillOutcome: row.drillOutcome,
        drillPosition: row.drillPosition, drillCompleted: row.drillOutcome === 'completed' } : {}) };
  });
  const newestEvents = safeEvents.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id)).slice(0, max);
  const db = await openDb();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction([EXAMPLES, EVENTS, SETTINGS], 'readwrite');
      tx.objectStore(EXAMPLES).clear();
      tx.objectStore(EVENTS).clear();
      for (const row of safeExamples) tx.objectStore(EXAMPLES).put(row);
      for (const row of newestEvents) tx.objectStore(EVENTS).put(row);
      tx.objectStore(SETTINGS).put({ key: 'maxResults', value: max });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Backup import failed.'));
      tx.onabort = () => reject(tx.error || new Error('Backup import cancelled.'));
    });
  } finally { db.close(); }
  return { examples: safeExamples.length, events: newestEvents.length, maxResults: max };
}
