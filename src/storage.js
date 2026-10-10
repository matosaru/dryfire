import { FEATURE_VERSION } from './audio.js';
import { isFeatureVector, labels } from './classifier.js';
import { ACTUAL_CLASSES } from './evaluation.js';
import { getDrill, normalizeCustomDrill } from './drills.js';

const DB_NAME = 'dryfire-sound-trainer';
const DB_VERSION = 2;
const EXAMPLES = 'examples';
const EVENTS = 'events';
const SETTINGS = 'settings';
const GUNS = 'guns';
const GUN_SETTINGS = 'gunSettings';
const ACTIVE_GUN = 'activeGunId';
const STORES = [EXAMPLES, EVENTS, SETTINGS, GUNS, GUN_SETTINGS];
export const MAX_EXAMPLES_PER_CLASS = 50;
export const MAX_GUNS = 5;
export const GUN_TYPES = Object.freeze(['Handguns', 'Rifles and Carbines', 'Shotguns']);

export function normalizeMaxResults(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(500, Math.trunc(n)));
}

function validGunDetails(name, type) {
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 80 || !GUN_TYPES.includes(type)) {
    throw new TypeError('Enter a gun name of 1–80 characters and select a supported gun type.');
  }
  return { name: name.trim(), type };
}

function legacyGun() {
  return { id: crypto.randomUUID(), name: '', type: null, needsDetails: true, createdAt: Date.now() };
}

/** The upgrade transaction preserves legacy records before attaching ownership. */
function migrateLegacy(tx) {
  const rows = {};
  let pending = 3;
  for (const name of [EXAMPLES, EVENTS, SETTINGS]) {
    const request = tx.objectStore(name).getAll();
    request.onsuccess = () => {
      rows[name] = request.result;
      if (--pending) return;
      const perGunKeys = ['maxResults', 'selectedDrill', 'drillConfig', 'customDrills'];
      const hasDrillData = rows[SETTINGS].some(row => perGunKeys.slice(1).includes(row.key));
      if (!rows[EXAMPLES].length && !rows[EVENTS].length && !hasDrillData) return;
      const gun = legacyGun();
      tx.objectStore(GUNS).put(gun);
      for (const name of [EXAMPLES, EVENTS]) {
        for (const row of rows[name]) tx.objectStore(name).put({ ...row, gunId: gun.id });
      }
      for (const row of rows[SETTINGS]) {
        if (perGunKeys.includes(row.key)) {
          tx.objectStore(GUN_SETTINGS).put({ gunId: gun.id, key: row.key, value: row.value });
          tx.objectStore(SETTINGS).delete(row.key);
        }
      }
      tx.objectStore(SETTINGS).put({ key: ACTIVE_GUN, value: gun.id });
    };
  }
}

function openDb() {
  if (!globalThis.indexedDB) return Promise.reject(new Error('IndexedDB is unavailable on this device.'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = event => {
      const db = request.result;
      const tx = request.transaction;
      if (!db.objectStoreNames.contains(EXAMPLES)) {
        const store = db.createObjectStore(EXAMPLES, { keyPath: 'id' });
        store.createIndex('label', 'label', { unique: false });
      }
      if (!db.objectStoreNames.contains(EVENTS)) {
        const store = db.createObjectStore(EVENTS, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(SETTINGS)) db.createObjectStore(SETTINGS, { keyPath: 'key' });
      if (!db.objectStoreNames.contains(GUNS)) db.createObjectStore(GUNS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(GUN_SETTINGS)) {
        db.createObjectStore(GUN_SETTINGS, { keyPath: ['gunId', 'key'] });
      }
      for (const name of [EXAMPLES, EVENTS, GUN_SETTINGS]) {
        const store = tx.objectStore(name);
        if (!store.indexNames.contains('gunId')) store.createIndex('gunId', 'gunId', { unique: false });
      }
      if (event.oldVersion > 0 && event.oldVersion < 2) migrateLegacy(tx);
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Local database is blocked by another app tab. Close other tabs and retry.'));
  });
}

function withTransaction(storeNames, mode, action) {
  return openDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, mode);
    const context = {
      result: undefined, error: undefined,
      fail(error) { this.error = error; tx.abort(); },
    };
    tx.oncomplete = () => resolve(context.result);
    tx.onerror = () => reject(context.error || tx.error);
    tx.onabort = () => reject(context.error || tx.error || new Error('Database transaction aborted.'));
    try { action(tx, context); }
    catch (error) { context.fail(error); }
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
    return await requestToPromise(db.transaction(storeName, 'readonly').objectStore(storeName).getAll());
  } finally { db.close(); }
}

async function getRow(storeName, key) {
  const db = await openDb();
  try {
    return await requestToPromise(db.transaction(storeName, 'readonly').objectStore(storeName).get(key));
  } finally { db.close(); }
}

export async function getGuns() {
  return (await getAll(GUNS)).sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
}

export async function getActiveGun() {
  const id = await getSetting(ACTIVE_GUN, null);
  return id ? await getRow(GUNS, id) ?? null : null;
}

export async function createGun({ name, type } = {}) {
  const details = validGunDetails(name, type);
  const row = { id: crypto.randomUUID(), ...details, needsDetails: false, createdAt: Date.now() };
  return withTransaction([GUNS, SETTINGS], 'readwrite', (tx, context) => {
    const store = tx.objectStore(GUNS);
    const request = store.count();
    request.onsuccess = () => {
      if (request.result >= MAX_GUNS) { context.fail(new Error('Maximum five guns saved. Select an existing gun.')); return; }
      store.put(row);
      tx.objectStore(SETTINGS).put({ key: ACTIVE_GUN, value: row.id });
      context.result = row;
    };
  });
}

export async function updateGun(id, { name, type } = {}) {
  if (typeof id !== 'string' || !id) throw new TypeError('Invalid gun profile.');
  return withTransaction(GUNS, 'readwrite', (tx, context) => {
    const store = tx.objectStore(GUNS);
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result) { context.fail(new Error('Gun profile not found.')); return; }
      try {
        const details = validGunDetails(name ?? request.result.name, type ?? request.result.type);
        const row = { ...request.result, ...details, needsDetails: false };
        store.put(row);
        context.result = row;
      } catch (error) { context.fail(error); }
    };
  });
}

export async function setActiveGun(id) {
  if (typeof id !== 'string' || !id) throw new TypeError('Invalid gun profile.');
  return withTransaction([GUNS, SETTINGS], 'readwrite', (tx, context) => {
    const request = tx.objectStore(GUNS).get(id);
    request.onsuccess = () => {
      if (!request.result) { context.fail(new Error('Gun profile not found.')); return; }
      tx.objectStore(SETTINGS).put({ key: ACTIVE_GUN, value: id });
      context.result = request.result;
    };
  });
}

async function resolveGunId(gunId, required = false) {
  const id = gunId === undefined ? (await getActiveGun())?.id : gunId;
  if (id == null) {
    if (required) throw new Error('Select or add a gun before saving its data.');
    return null;
  }
  if (typeof id !== 'string' || !id || !await getRow(GUNS, id)) throw new Error('Gun profile not found.');
  return id;
}

async function getOwnedRows(storeName, gunId) {
  if (!gunId) return [];
  const db = await openDb();
  try {
    return await requestToPromise(db.transaction(storeName, 'readonly').objectStore(storeName).index('gunId').getAll(gunId));
  } finally { db.close(); }
}

function validFeatures(vector) {
  return isFeatureVector(vector) && Array.from(vector).every(Number.isFinite);
}

function currentExample(row) {
  return row.featureVersion === FEATURE_VERSION && labels.includes(row.label) && validFeatures(row.features);
}

export async function addExample(label, features, gunId) {
  if (!labels.includes(label) || !validFeatures(features)) throw new TypeError('Invalid label or audio feature vector.');
  const owner = await resolveGunId(gunId, true);
  const row = { id: crypto.randomUUID(), gunId: owner, label, features: [...features], featureVersion: FEATURE_VERSION, createdAt: Date.now() };
  return withTransaction(EXAMPLES, 'readwrite', (tx, context) => {
    const store = tx.objectStore(EXAMPLES);
    const request = store.index('gunId').getAll(owner);
    request.onsuccess = () => {
      if (request.result.filter(e => currentExample(e) && e.label === label).length >= MAX_EXAMPLES_PER_CLASS) {
        context.fail(new Error(`Maximum ${MAX_EXAMPLES_PER_CLASS} examples per sound reached.`)); return;
      }
      store.put(row);
      context.result = row;
    };
  });
}

export async function getExamples(gunId) {
  return (await getOwnedRows(EXAMPLES, await resolveGunId(gunId))).filter(currentExample);
}

export async function getOutdatedExampleCount(gunId) {
  return (await getOwnedRows(EXAMPLES, await resolveGunId(gunId))).filter(row => row.featureVersion !== FEATURE_VERSION).length;
}

async function clearOwnedRows(storeName, gunId, predicate = () => true) {
  const owner = await resolveGunId(gunId, true);
  await withTransaction(storeName, 'readwrite', tx => {
    const store = tx.objectStore(storeName);
    const request = store.index('gunId').openCursor(IDBKeyRange.only(owner));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      if (predicate(cursor.value)) cursor.delete();
      cursor.continue();
    };
  });
}

export async function clearExamples(gunId) {
  await clearOwnedRows(EXAMPLES, gunId);
}

/** Delete one learned sound for one gun, preserving every gun's history. */
export async function clearExamplesForLabel(label, gunId) {
  if (!labels.includes(label)) throw new TypeError('Unknown sound profile.');
  await clearOwnedRows(EXAMPLES, gunId, row => row.label === label);
}

const sortedEvents = rows => rows.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
const DRILL_OUTCOMES = ['matched', 'completed', 'incorrect', 'unknown'];

export async function addEvent(event, gunId) {
  const owner = await resolveGunId(gunId, true);
  const drill = event.drillId ? getDrill(event.drillId, await getCustomDrills(owner)) : null;
  const validDrill = drill && DRILL_OUTCOMES.includes(event.drillOutcome) && Number.isInteger(event.drillPosition) &&
    event.drillPosition >= 0 && event.drillPosition < drill.steps.length;
  const row = {
    label: labels.includes(event.label) ? event.label : 'unknown',
    score: Math.max(0, Math.min(100, Number(event.score) || 0)),
    id: crypto.randomUUID(), gunId: owner, createdAt: Date.now(),
    ...(validDrill ? { drillId: drill.id, drillTitle: drill.title, drillSteps: [...drill.steps],
      drillOutcome: event.drillOutcome, drillPosition: event.drillPosition,
      drillCompleted: event.drillOutcome === 'completed' } : {}),
  };
  const max = normalizeMaxResults(await getGunSetting('maxResults', 50, owner));
  await withTransaction(EVENTS, 'readwrite', tx => {
    const store = tx.objectStore(EVENTS);
    store.put(row);
    const request = store.index('gunId').getAll(owner);
    request.onsuccess = () => {
      for (const excess of sortedEvents(request.result).slice(max)) store.delete(excess.id);
    };
  });
  return row;
}

/** Verification belongs to the owner and never changes the learned model. */
export async function verifyEvent(id, actualLabel, gunId) {
  if (typeof id !== 'string' || !id || ![...ACTUAL_CLASSES, null].includes(actualLabel)) {
    throw new TypeError('Invalid recognition event or actual sound label.');
  }
  const owner = await resolveGunId(gunId, true);
  return withTransaction(EVENTS, 'readwrite', (tx, context) => {
    const store = tx.objectStore(EVENTS);
    const request = store.get(id);
    request.onsuccess = () => {
      if (!request.result || request.result.gunId !== owner) { context.fail(new Error('Recognition event not found for this gun.')); return; }
      const row = { ...request.result };
      if (actualLabel === null) delete row.actualLabel;
      else row.actualLabel = actualLabel;
      store.put(row);
      context.result = row;
    };
  });
}

export async function getEvents(gunId) {
  return sortedEvents(await getOwnedRows(EVENTS, await resolveGunId(gunId)));
}

export async function clearEvents(gunId) {
  await clearOwnedRows(EVENTS, gunId);
}

export async function trimEvents(maxResults, gunId) {
  const owner = await resolveGunId(gunId, true);
  const max = normalizeMaxResults(maxResults);
  await withTransaction(EVENTS, 'readwrite', tx => {
    const store = tx.objectStore(EVENTS);
    const request = store.index('gunId').getAll(owner);
    request.onsuccess = () => {
      for (const excess of sortedEvents(request.result).slice(max)) store.delete(excess.id);
    };
  });
}

export async function setSetting(key, value) {
  if (typeof key !== 'string' || !key || key === ACTIVE_GUN) throw new TypeError('Invalid global setting.');
  await withTransaction(SETTINGS, 'readwrite', tx => { tx.objectStore(SETTINGS).put({ key, value }); });
}

export async function getSetting(key, fallback) {
  return (await getRow(SETTINGS, key))?.value ?? fallback;
}

export async function getGunSetting(key, fallback, gunId) {
  const owner = await resolveGunId(gunId);
  return owner ? (await getRow(GUN_SETTINGS, [owner, key]))?.value ?? fallback : fallback;
}

export async function setGunSetting(key, value, gunId) {
  if (typeof key !== 'string' || !key) throw new TypeError('Invalid gun setting.');
  const owner = await resolveGunId(gunId, true);
  if (key === 'customDrills') value = validateCustomDrills(value);
  if (key === 'maxResults') value = normalizeMaxResults(value);
  if (key === 'selectedDrill' && value !== null && value !== '' && !getDrill(value, await getCustomDrills(owner))) {
    throw new TypeError('Selected drill is not available for this gun.');
  }
  await withTransaction(GUN_SETTINGS, 'readwrite', tx => {
    tx.objectStore(GUN_SETTINGS).put({ gunId: owner, key, value });
  });
}

function validateCustomDrills(value) {
  if (!Array.isArray(value)) throw new TypeError('Invalid custom drill collection.');
  const ids = new Set();
  return Array.from(value, item => {
    const row = normalizeCustomDrill(item);
    if (ids.has(row.id)) throw new TypeError('Duplicated custom drill ID.');
    ids.add(row.id);
    return row;
  });
}

export async function getCustomDrills(gunId) {
  return validateCustomDrills(await getGunSetting('customDrills', [], gunId));
}

export async function saveCustomDrill(drill, gunId) {
  const owner = await resolveGunId(gunId, true);
  const row = normalizeCustomDrill({ ...drill, id: drill?.id ?? `custom-${crypto.randomUUID()}` });
  return withTransaction(GUN_SETTINGS, 'readwrite', (tx, context) => {
    const store = tx.objectStore(GUN_SETTINGS);
    const request = store.get([owner, 'customDrills']);
    request.onsuccess = () => {
      try {
        const presets = validateCustomDrills(request.result?.value ?? []);
        const existing = presets.findIndex(item => item.id === row.id);
        if (existing < 0) presets.push(row);
        else presets[existing] = row;
        store.put({ gunId: owner, key: 'customDrills', value: presets });
        context.result = row;
      } catch (error) { context.fail(error); }
    };
  });
}

/** One consistent snapshot of all profiles and derived data; no raw audio. */
export async function exportBackup() {
  return withTransaction(STORES, 'readonly', (tx, context) => {
    const snapshot = {};
    let pending = STORES.length;
    for (const name of STORES) {
      const request = tx.objectStore(name).getAll();
      request.onsuccess = () => {
        snapshot[name] = request.result;
        if (--pending) return;
        context.result = {
          format: 'sound-trainer-backup', version: 2, featureVersion: FEATURE_VERSION,
          exportedAt: new Date().toISOString(), guns: snapshot[GUNS],
          activeGunId: snapshot[SETTINGS].find(row => row.key === ACTIVE_GUN)?.value ?? null,
          settings: Object.fromEntries(snapshot[SETTINGS].filter(row => row.key !== ACTIVE_GUN && row.key !== 'maxResults').map(row => [row.key, row.value])),
          gunSettings: snapshot[GUN_SETTINGS], examples: snapshot[EXAMPLES].filter(currentExample),
          events: sortedEvents(snapshot[EVENTS]),
        };
      };
    }
  });
}

function isJsonValue(value, depth = 0) {
  if (depth > 32) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return Array.from(value).every(item => isJsonValue(item, depth + 1));
  if (!value || typeof value !== 'object' || Object.prototype.toString.call(value) !== '[object Object]') return false;
  return Object.values(value).every(item => isJsonValue(item, depth + 1));
}

function validateBackup(backup) {
  if (!backup || backup.format !== 'sound-trainer-backup' || ![1, 2].includes(backup.version) || backup.featureVersion !== FEATURE_VERSION) {
    throw new Error('This file is not a compatible Dry Fire With Ease backup.');
  }
  const v1 = backup.version === 1;
  if (!Array.isArray(backup.examples) || !Array.isArray(backup.events) ||
      backup.examples.length > MAX_EXAMPLES_PER_CLASS * labels.length * (v1 ? 1 : MAX_GUNS) ||
      backup.events.length > 500 * (v1 ? 1 : MAX_GUNS)) {
    throw new Error('Backup contains an invalid amount of data.');
  }
  const oldGun = v1 && (backup.examples.length || backup.events.length) ? legacyGun() : null;
  const guns = v1 ? (oldGun ? [oldGun] : []) : backup.guns;
  if (!Array.isArray(guns) || guns.length > MAX_GUNS) throw new Error('Backup contains an invalid gun library.');
  const gunIds = new Set();
  const safeGuns = Array.from(guns, gun => {
    if (!gun || typeof gun.id !== 'string' || !gun.id || gunIds.has(gun.id) || !Number.isFinite(gun.createdAt)) {
      throw new Error('Backup contains an invalid or duplicated gun profile.');
    }
    const legacy = gun.needsDetails === true && gun.name === '' && gun.type === null;
    if (!legacy) validGunDetails(gun.name, gun.type);
    if (gun.needsDetails !== undefined && gun.needsDetails !== legacy) throw new Error('Backup contains invalid gun details.');
    gunIds.add(gun.id);
    return { id: gun.id, name: legacy ? '' : gun.name.trim(), type: gun.type, needsDetails: legacy, createdAt: gun.createdAt };
  });
  const activeGunId = v1 ? oldGun?.id ?? null : backup.activeGunId;
  if ((activeGunId !== null && !gunIds.has(activeGunId)) || (safeGuns.length && activeGunId === null)) {
    throw new Error('Backup contains an invalid selected gun.');
  }
  const settings = v1 ? {} : backup.settings ?? {};
  if (!settings || Array.isArray(settings) || !isJsonValue(settings) || Object.hasOwn(settings, ACTIVE_GUN)) {
    throw new Error('Backup contains invalid global settings.');
  }
  const sourceGunSettings = v1 ? (oldGun ? [{ gunId: oldGun.id, key: 'maxResults', value: normalizeMaxResults(backup.settings?.maxResults ?? 50) }] : []) : backup.gunSettings;
  if (!Array.isArray(sourceGunSettings)) throw new Error('Backup contains invalid gun settings.');
  const settingIds = new Set();
  const safeGunSettings = Array.from(sourceGunSettings, row => {
    if (!row || !gunIds.has(row.gunId) || typeof row.key !== 'string' || !row.key || !isJsonValue(row.value)) {
      throw new Error('Backup contains invalid gun settings.');
    }
    const identity = JSON.stringify([row.gunId, row.key]);
    if (settingIds.has(identity)) throw new Error('Backup contains duplicated gun settings.');
    settingIds.add(identity);
    let value = structuredClone(row.value);
    if (row.key === 'customDrills') value = validateCustomDrills(value);
    if (row.key === 'maxResults') value = normalizeMaxResults(value);
    return { gunId: row.gunId, key: row.key, value };
  });
  const presetCatalogs = new Map(safeGunSettings.filter(row => row.key === 'customDrills').map(row => [row.gunId, row.value]));
  for (const row of safeGunSettings) {
    if (row.key === 'selectedDrill' && row.value !== null && row.value !== '' && !getDrill(row.value, presetCatalogs.get(row.gunId) ?? [])) {
      throw new Error('Backup contains a selected drill unavailable for its gun.');
    }
  }
  const ownerOf = row => v1 ? oldGun?.id : row.gunId;
  const counts = new Map();
  const exampleIds = new Set();
  const safeExamples = Array.from(backup.examples, row => {
    if (!row || !labels.includes(row.label) || row.featureVersion !== FEATURE_VERSION ||
        !validFeatures(row.features) || row.features.length !== 15) throw new Error('Backup contains incompatible learned samples.');
    const gunId = ownerOf(row);
    if (!gunIds.has(gunId)) throw new Error('Backup contains a learned sample with an unknown gun owner.');
    const identity = JSON.stringify([gunId, row.label]);
    const count = (counts.get(identity) ?? 0) + 1;
    if (count > MAX_EXAMPLES_PER_CLASS) throw new Error('Too many examples of one sound.');
    counts.set(identity, count);
    if (typeof row.id !== 'string' || !row.id || exampleIds.has(row.id)) throw new Error('Invalid or duplicated backup ID.');
    exampleIds.add(row.id);
    return { id: row.id, gunId, label: row.label, featureVersion: FEATURE_VERSION,
      features: [...row.features], createdAt: Number.isFinite(row.createdAt) ? row.createdAt : Date.now() };
  });
  const eventIds = new Set();
  const eventCounts = new Map();
  const safeEvents = Array.from(backup.events, row => {
    if (!row || typeof row.id !== 'string' || !row.id || eventIds.has(row.id) ||
        ![...labels, 'unknown'].includes(row.label) || !Number.isFinite(row.score)) throw new Error('Backup contains an invalid recognition event.');
    if (row.actualLabel !== undefined && !ACTUAL_CLASSES.includes(row.actualLabel)) throw new Error('Backup contains an invalid verification label.');
    const gunId = ownerOf(row);
    if (!gunIds.has(gunId)) throw new Error('Backup contains an event with an unknown gun owner.');
    const count = (eventCounts.get(gunId) ?? 0) + 1;
    if (count > 500) throw new Error('Backup contains too many events for one gun.');
    eventCounts.set(gunId, count);
    const hasDrill = row.drillId !== undefined;
    const drill = hasDrill ? getDrill(row.drillId, presetCatalogs.get(gunId) ?? []) : null;
    let snapshot = null;
    if (row.drillTitle !== undefined || row.drillSteps !== undefined) {
      if (typeof row.drillTitle !== 'string' || !row.drillTitle.trim() || row.drillTitle.length > 80 ||
          !Array.isArray(row.drillSteps) || !row.drillSteps.length || row.drillSteps.length > 32 || !Array.from(row.drillSteps).every(label => labels.includes(label))) {
        throw new Error('Backup contains invalid drill sequence metadata.');
      }
      snapshot = { title: row.drillTitle, steps: [...row.drillSteps] };
    }
    const sequence = snapshot?.steps ?? drill?.steps;
    if ((!hasDrill && snapshot) || (hasDrill && ((!drill && !snapshot) || typeof row.drillId !== 'string' || !row.drillId ||
        !DRILL_OUTCOMES.includes(row.drillOutcome) || !Number.isInteger(row.drillPosition) || row.drillPosition < 0 ||
        row.drillPosition >= sequence.length ||
        (row.drillCompleted !== undefined && row.drillCompleted !== (row.drillOutcome === 'completed'))))) {
      throw new Error('Backup contains invalid drill metadata.');
    }
    eventIds.add(row.id);
    return { id: row.id, gunId, label: row.label, score: Math.max(0, Math.min(100, row.score)),
      createdAt: Number.isFinite(row.createdAt) ? row.createdAt : Date.now(),
      ...(row.actualLabel ? { actualLabel: row.actualLabel } : {}),
      ...(hasDrill ? { drillId: row.drillId, drillOutcome: row.drillOutcome,
        drillPosition: row.drillPosition, drillCompleted: row.drillOutcome === 'completed',
        ...(snapshot ? { drillTitle: snapshot.title, drillSteps: snapshot.steps } : {}) } : {}) };
  });
  const events = [];
  for (const gun of safeGuns) {
    const max = normalizeMaxResults(safeGunSettings.find(row => row.gunId === gun.id && row.key === 'maxResults')?.value ?? 50);
    events.push(...sortedEvents(safeEvents.filter(row => row.gunId === gun.id)).slice(0, max));
  }
  return { guns: safeGuns, activeGunId, settings: structuredClone(settings), gunSettings: safeGunSettings, examples: safeExamples, events };
}

/** Validate the entire library before one atomic replacement transaction. */
export async function restoreBackup(backup) {
  const data = validateBackup(backup);
  await withTransaction(STORES, 'readwrite', tx => {
    for (const name of STORES) {
      if (name !== SETTINGS || backup.version === 2) tx.objectStore(name).clear();
    }
    if (backup.version === 1) {
      tx.objectStore(SETTINGS).delete(ACTIVE_GUN);
      tx.objectStore(SETTINGS).delete('maxResults');
    }
    for (const row of data.guns) tx.objectStore(GUNS).put(row);
    for (const row of data.examples) tx.objectStore(EXAMPLES).put(row);
    for (const row of data.events) tx.objectStore(EVENTS).put(row);
    for (const row of data.gunSettings) tx.objectStore(GUN_SETTINGS).put(row);
    for (const [key, value] of Object.entries(data.settings)) tx.objectStore(SETTINGS).put({ key, value });
    if (data.activeGunId) tx.objectStore(SETTINGS).put({ key: ACTIVE_GUN, value: data.activeGunId });
  });
  return { guns: data.guns.length, examples: data.examples.length, events: data.events.length,
    maxResults: normalizeMaxResults(data.gunSettings.find(row => row.gunId === data.activeGunId && row.key === 'maxResults')?.value ?? 50) };
}
