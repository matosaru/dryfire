import { FEATURE_VERSION } from './audio.js';
import { parseNumberInput } from './inputLimits.js';
import { isFeatureVector, labels } from './classifier.js';
import { ACTUAL_CLASSES } from './evaluation.js';
import { getDrill, normalizeCustomDrill } from './drills.js';
import { normalizeSessionConfig, recoverSessionRecord } from './drillSession.js';
import { normalizePracticeConfig, practiceDefinition, validatePracticeRecord, recoverPracticeRecord } from './practiceSession.js';
import { normalizeCalibration, compatibleCalibration, normalizeEnabledLabels, CALIBRATION_KINDS } from './calibration.js';

const DB_NAME = 'dryfire-sound-trainer';
const DB_VERSION = 4;
const EXAMPLES = 'examples';
const EVENTS = 'events';
const SETTINGS = 'settings';
const GUNS = 'guns';
const GUN_SETTINGS = 'gunSettings';
const SESSIONS = 'sessions';
const ACTIVE_GUN = 'activeGunId';
const STORES = [EXAMPLES, EVENTS, SETTINGS, GUNS, GUN_SETTINGS, SESSIONS];
export const MAX_EXAMPLES_PER_CLASS = 10;
// Older compatible libraries remain restorable without deleting their samples.
const MAX_COMPATIBLE_EXAMPLES_PER_CLASS = 50;
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

// Project prior practice data onto the supported catalog during upgrade/import.
// Historical IDs occur only at this retirement boundary, never in the engine/UI.
const retiredPractice = mode => ['reload', 'free'].includes(mode);
const supportedSession = row => row?.kind !== 'practice' || !retiredPractice(row.practiceMode);
function currentPracticeConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return config;
  return Object.fromEntries(Object.entries(config).filter(([key]) => !['durationSeconds', 'reloadStart', 'reloadEnd'].includes(key)));
}
function currentPracticeSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  return Object.fromEntries(Object.entries(value).filter(([mode]) => !retiredPractice(mode))
    .map(([mode, config]) => [mode, currentPracticeConfig(config)]));
}
function currentPracticeRecord(row) {
  if (row.kind !== 'practice') return row;
  const previousTitles = { repeated: 'Repeated trigger presses', par: 'Par-time practice' };
  return { ...row, config: currentPracticeConfig(row.config),
    drillTitle: row.drillTitle === previousTitles[row.practiceMode] ? practiceDefinition(row.practiceMode).title : row.drillTitle };
}
function migratePracticeCatalog(tx) {
  const sessions = tx.objectStore(SESSIONS).openCursor();
  sessions.onsuccess = () => {
    const cursor = sessions.result;
    if (!cursor) return;
    if (!supportedSession(cursor.value)) cursor.delete();
    else if (cursor.value.kind === 'practice') cursor.update(currentPracticeRecord(cursor.value));
    cursor.continue();
  };
  const settings = tx.objectStore(GUN_SETTINGS).openCursor();
  settings.onsuccess = () => {
    const cursor = settings.result;
    if (!cursor) return;
    if (cursor.value.key === 'practiceConfig') cursor.update({ ...cursor.value,
      value: validatePracticeSetting('practiceConfig', currentPracticeSettings(cursor.value.value)) });
    cursor.continue();
  };
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
      if (!db.objectStoreNames.contains(SESSIONS)) {
        const store = db.createObjectStore(SESSIONS, { keyPath: 'id' });
        store.createIndex('gunId', 'gunId', { unique: false });
        store.createIndex('startedAt', 'startedAt', { unique: false });
      }
      for (const name of [EXAMPLES, EVENTS, GUN_SETTINGS]) {
        const store = tx.objectStore(name);
        if (!store.indexNames.contains('gunId')) store.createIndex('gunId', 'gunId', { unique: false });
      }
      if (event.oldVersion > 0 && event.oldVersion < 2) migrateLegacy(tx);
      if (event.oldVersion > 0 && event.oldVersion < 4) migratePracticeCatalog(tx);
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

/** Recheck ownership inside the write so library replacement cannot race it. */
function withOwnedTransaction(owner, storeName, action) {
  return withTransaction([GUNS, ...(Array.isArray(storeName) ? storeName : [storeName])], 'readwrite', (tx, context) => {
    const request = tx.objectStore(GUNS).get(owner);
    request.onsuccess = () => {
      if (!request.result) { context.fail(new Error('Gun profile no longer exists. Retry with the current library.')); return; }
      try { action(tx, context); }
      catch (error) { context.fail(error); }
    };
  });
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

export async function createGun({ name, type } = {}, { maxGuns = MAX_GUNS } = {}) {
  if (!Number.isInteger(maxGuns) || maxGuns < 1 || maxGuns > MAX_GUNS) throw new TypeError('Invalid gun creation limit.');
  const details = validGunDetails(name, type);
  const row = { id: crypto.randomUUID(), ...details, needsDetails: false, createdAt: Date.now() };
  return withTransaction([GUNS, SETTINGS], 'readwrite', (tx, context) => {
    const store = tx.objectStore(GUNS);
    const request = store.count();
    request.onsuccess = () => {
      if (request.result >= maxGuns) {
        const limit = ['one gun', 'two guns', 'three guns', 'four guns'][maxGuns - 1];
        context.fail(new Error(maxGuns === MAX_GUNS ? 'Maximum five guns saved. Select an existing gun.' : `This version allows creating ${limit}. Existing saved guns remain available.`)); return;
      }
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

/** Confirmed single-profile deletion; ownership and selection change atomically. */
export async function deleteGun(id) {
  if (typeof id !== 'string' || !id) throw new TypeError('Invalid gun profile.');
  await withTransaction(STORES, 'readwrite', (tx, context) => {
    const store = tx.objectStore(GUNS);
    const request = store.getAll();
    request.onsuccess = () => {
      if (!request.result.some(gun => gun.id === id)) { context.fail(new Error('Gun profile not found.')); return; }
      const remaining = request.result.filter(gun => gun.id !== id)
        .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id));
      const settings = tx.objectStore(SETTINGS);
      const selection = settings.get(ACTIVE_GUN);
      selection.onsuccess = () => {
        try {
          for (const name of [EXAMPLES, EVENTS, GUN_SETTINGS, SESSIONS]) deleteOwnedRows(tx, context, name, id);
          store.delete(id);
          if (selection.result?.value === id) {
            if (remaining.length) settings.put({ key: ACTIVE_GUN, value: remaining[0].id });
            else settings.delete(ACTIVE_GUN);
          }
        } catch (error) { context.fail(error); }
      };
    };
  });
}

/** Explicitly confirmed UI action: atomically clear only this application's stores. */
export async function resetLibrary() {
  await withTransaction(STORES, 'readwrite', tx => {
    for (const name of STORES) tx.objectStore(name).clear();
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
  return withOwnedTransaction(owner, EXAMPLES, (tx, context) => {
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
  await withOwnedTransaction(owner, storeName, (tx, context) => deleteOwnedRows(tx, context, storeName, owner, predicate));
}

function deleteOwnedRows(tx, context, storeName, owner, predicate = () => true) {
  const request = tx.objectStore(storeName).index('gunId').openCursor(IDBKeyRange.only(owner));
  request.onsuccess = () => {
    try {
      const cursor = request.result;
      if (!cursor) return;
      if (predicate(cursor.value)) cursor.delete();
      cursor.continue();
    } catch (error) { context.fail(error); }
  };
}

export async function clearExamples(gunId) {
  const owner = await resolveGunId(gunId, true);
  await withOwnedTransaction(owner, [EXAMPLES, GUN_SETTINGS], tx => {
    const request = tx.objectStore(EXAMPLES).index('gunId').openCursor(IDBKeyRange.only(owner));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      cursor.delete(); cursor.continue();
    };
    tx.objectStore(GUN_SETTINGS).delete([owner, 'calibrationExamples']);
  });
}

/** Delete one learned sound for one gun, preserving every gun's history. */
export async function clearExamplesForLabel(label, gunId) {
  if (!labels.includes(label)) throw new TypeError('Unknown sound profile.');
  await clearOwnedRows(EXAMPLES, gunId, row => row.label === label);
}

const sortedEvents = rows => rows.sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
const DRILL_OUTCOMES = ['matched', 'completed', 'incorrect', 'unknown'];

export async function addEvent(event, gunId) {
  if (!labels.includes(event?.label)) return null;
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
  await withOwnedTransaction(owner, EVENTS, tx => {
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
  return withOwnedTransaction(owner, EVENTS, (tx, context) => {
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
  await withOwnedTransaction(owner, EVENTS, tx => {
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
  if (key === 'maxResults') value = parseNumberInput(value, 'maxResults');
  value = validatePracticeSetting(key, value);
  if (key === 'selectedDrill' && value !== null && value !== '' && !getDrill(value, await getCustomDrills(owner))) {
    throw new TypeError('Selected drill is not available for this gun.');
  }
  await withOwnedTransaction(owner, GUN_SETTINGS, tx => {
    tx.objectStore(GUN_SETTINGS).put({ gunId: owner, key, value });
  });
}

function validatePracticeSetting(key, value) {
  if (key === 'calibrationExamples') return normalizeCalibration(value);
  if (key === 'enabledSoundLabels') return normalizeEnabledLabels(value);
  if (key === 'practiceConfig') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Invalid practice settings.');
    return Object.fromEntries(Object.entries(value).map(([mode, config]) => {
      if (!practiceDefinition(mode)) throw new TypeError('Invalid practice mode.');
      return [mode, normalizePracticeConfig(config)];
    }));
  }
  return value;
}

export async function getCalibrationExamples(gunId) {
  return compatibleCalibration(normalizeCalibration(await getGunSetting('calibrationExamples', [], gunId)));
}

export async function addCalibrationExample(kind, features, gunId) {
  if (!CALIBRATION_KINDS.includes(kind) || !validFeatures(features) || features.length !== 15) throw new TypeError('Invalid calibration example.');
  const owner = await resolveGunId(gunId, true);
  const row = { id: crypto.randomUUID(), kind, features: [...features], featureVersion: FEATURE_VERSION, createdAt: Date.now() };
  return withOwnedTransaction(owner, GUN_SETTINGS, (tx, context) => {
    const store = tx.objectStore(GUN_SETTINGS);
    const request = store.get([owner, 'calibrationExamples']);
    request.onsuccess = () => {
      try {
        const previous = normalizeCalibration(request.result?.value ?? []);
        if (previous.filter(item => item.kind === kind).length >= MAX_EXAMPLES_PER_CLASS) throw new Error(`Maximum ${MAX_EXAMPLES_PER_CLASS} calibration examples per category reached.`);
        const rows = normalizeCalibration([...previous, row]);
        store.put({ gunId: owner, key: 'calibrationExamples', value: rows }); context.result = row;
      } catch (error) { context.fail(error); }
    };
  });
}

export async function clearCalibrationExamples(kind, gunId) {
  if (kind !== null && !CALIBRATION_KINDS.includes(kind)) throw new TypeError('Invalid calibration category.');
  const owner = await resolveGunId(gunId, true);
  return withOwnedTransaction(owner, GUN_SETTINGS, (tx, context) => {
    const store = tx.objectStore(GUN_SETTINGS), request = store.get([owner, 'calibrationExamples']);
    request.onsuccess = () => {
      try {
        const rows = normalizeCalibration(request.result?.value ?? []).filter(row => kind !== null && row.kind !== kind);
        store.put({ gunId: owner, key: 'calibrationExamples', value: rows });
      } catch (error) { context.fail(error); }
    };
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
  return withOwnedTransaction(owner, GUN_SETTINGS, (tx, context) => {
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

const SESSION_STATUSES = ['running', 'paused', 'completed', 'ended', 'interrupted'];
const TERMINAL_SESSION_STATUSES = ['completed', 'ended', 'interrupted'];
const sortSessions = rows => rows.sort((a, b) => b.startedAt - a.startedAt || b.id.localeCompare(a.id));
const finiteNonnegative = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const nullableTime = value => value === null || finiteNonnegative(value);
const reasonValue = value => value === null || (typeof value === 'string' && !!value.trim());

function invalidSession(message) {
  throw new TypeError(`Invalid saved drill session: ${message}.`);
}

function validateAttempt(value, record, isCurrent) {
  const steps = record.drillSteps;
  const statuses = isCurrent ? ['waiting', 'active'] : ['completed', 'partial'];
  if (!value || !Number.isInteger(value.attempt) || value.attempt < 1 ||
      !Number.isInteger(value.ordinal) || value.ordinal < 1 || value.ordinal > record.config.repetitions ||
      !statuses.includes(value.status) || !finiteNonnegative(value.startedAt) || value.startedAt < record.startedAt ||
      !nullableTime(value.goAt) || !nullableTime(value.endedAt) || !nullableTime(value.elapsedMs) || !reasonValue(value.reason) ||
      !Number.isInteger(value.unknown) || value.unknown < 0 || !Number.isInteger(value.incorrect) || value.incorrect < 0 ||
      !Array.isArray(value.detections) || !Array.isArray(value.stepTimings)) invalidSession('invalid repetition outcome');
  if ((value.goAt !== null && value.goAt < value.startedAt) ||
      (value.endedAt !== null && value.endedAt < value.startedAt) ||
      (isCurrent && value.endedAt !== null) || (!isCurrent && value.endedAt === null) ||
      (isCurrent && value.reason !== null) || (value.status === 'waiting' && value.goAt !== null) ||
      (value.status === 'active' && value.goAt === null)) invalidSession('invalid repetition timestamps');
  let lastOffset = -1;
  const detections = Array.from(value.detections, item => {
    if (!item || ![...labels, 'unknown'].includes(item.label) || !finiteNonnegative(item.score) || item.score > 100 ||
        !finiteNonnegative(item.offsetMs) || item.offsetMs < lastOffset || !DRILL_OUTCOMES.includes(item.outcome) ||
        !Number.isInteger(item.position) || item.position < 0 || item.position >= steps.length ||
        ((item.label === 'unknown') !== (item.outcome === 'unknown')) ||
        (['matched', 'completed'].includes(item.outcome) && item.label !== steps[item.position]) ||
        (item.outcome === 'completed' && item.position !== steps.length - 1)) invalidSession('invalid saved sound detection');
    lastOffset = item.offsetMs;
    return { label: item.label, score: item.score, offsetMs: item.offsetMs, outcome: item.outcome, position: item.position };
  });
  if (value.unknown !== detections.filter(item => item.outcome === 'unknown').length ||
      value.incorrect !== detections.filter(item => item.outcome === 'incorrect').length) invalidSession('incorrect repetition counters');
  let previousOffset = 0;
  const stepTimings = Array.from(value.stepTimings, (item, index) => {
    if (!item || index >= steps.length || item.label !== steps[index] || !finiteNonnegative(item.offsetMs) ||
        item.offsetMs < previousOffset || !finiteNonnegative(item.splitMs) ||
        Math.abs(item.splitMs - (item.offsetMs - previousOffset)) > 0.000001) invalidSession('invalid sound-detection timing splits');
    if (!detections.some(detection => detection.label === item.label && detection.offsetMs === item.offsetMs)) {
      invalidSession('timing split has no matching sound detection');
    }
    previousOffset = item.offsetMs;
    return { label: item.label, offsetMs: item.offsetMs, splitMs: item.splitMs };
  });
  if (value.status === 'waiting' && (detections.length || stepTimings.length || value.elapsedMs !== null)) invalidSession('detections before GO');
  if (value.goAt === null && (detections.length || stepTimings.length || value.elapsedMs !== null)) invalidSession('timings without a GO signal');
  if (value.elapsedMs !== null && value.elapsedMs < Math.max(lastOffset, previousOffset)) invalidSession('elapsed time precedes detections');
  if (value.status === 'completed') {
    if (stepTimings.length !== steps.length || value.goAt === null || value.elapsedMs === null ||
        Math.abs(value.elapsedMs - previousOffset) > 0.000001 || ![null, 'completed'].includes(value.reason) ||
        detections.at(-1)?.outcome !== 'completed' || detections.at(-1)?.offsetMs !== value.elapsedMs) invalidSession('incomplete sequence reported as completed');
  } else if (stepTimings.length >= steps.length) invalidSession('complete sequence reported as partial');
  return { attempt: value.attempt, ordinal: value.ordinal, status: value.status, startedAt: value.startedAt,
    goAt: value.goAt, endedAt: value.endedAt, reason: value.reason, elapsedMs: value.elapsedMs,
    unknown: value.unknown, incorrect: value.incorrect, detections, stepTimings };
}

/** Strict portable records exclude raw audio and runtime timer handles. */
function validateSession(value, owner) {
  if (value?.kind === 'practice') return validatePracticeRecord(value, owner);
  if (!value || typeof value.id !== 'string' || !value.id || value.gunId !== owner ||
      typeof value.drillId !== 'string' || !value.drillId || value.drillId.length > 80 ||
      typeof value.drillTitle !== 'string' || !value.drillTitle.trim() || value.drillTitle.length > 80 ||
      !Array.isArray(value.drillSteps) || !value.drillSteps.length || value.drillSteps.length > 32 ||
      !Array.from(value.drillSteps).every(label => labels.includes(label)) ||
      !Number.isInteger(value.revision) || value.revision < 0 || !SESSION_STATUSES.includes(value.status) ||
      !finiteNonnegative(value.startedAt) || !finiteNonnegative(value.updatedAt) || value.updatedAt < value.startedAt ||
      !nullableTime(value.endedAt) || !reasonValue(value.endReason) || !Array.isArray(value.repetitions) ||
      !Number.isInteger(value.completed) || !Number.isInteger(value.remaining)) invalidSession('invalid identity, status or fields');
  validGunDetails(value.gunName, value.gunType);
  if (!value.config || typeof value.config !== 'object' || Array.isArray(value.config)) invalidSession('invalid configuration snapshot');
  const config = normalizeSessionConfig(value.config);
  if (Object.keys(config).some(key => value.config[key] !== config[key])) invalidSession('invalid configuration snapshot');
  if (value.completed < 0 || value.completed > config.repetitions || value.remaining !== config.repetitions - value.completed) {
    invalidSession('incorrect completed and remaining counts');
  }
  const terminal = TERMINAL_SESSION_STATUSES.includes(value.status);
  if ((terminal && value.endedAt === null) || (!terminal && value.endedAt !== null) ||
      (value.endedAt !== null && value.endedAt < value.startedAt) ||
      (value.status === 'completed' && value.remaining !== 0) ||
      (terminal && value.currentAttempt !== null) || (value.status === 'paused' && value.currentAttempt !== null)) invalidSession('invalid final session status');
  const record = { id: value.id, gunId: owner, gunName: value.gunName, gunType: value.gunType,
    drillId: value.drillId, drillTitle: value.drillTitle, drillSteps: [...value.drillSteps], config,
    revision: value.revision, startedAt: value.startedAt, updatedAt: value.updatedAt, endedAt: value.endedAt,
    status: value.status, endReason: value.endReason, completed: value.completed, remaining: value.remaining,
    repetitions: [], currentAttempt: null };
  let completed = 0;
  let previousAttempt = 0;
  record.repetitions = Array.from(value.repetitions, item => {
    const attempt = validateAttempt(item, record, false);
    if (attempt.attempt <= previousAttempt || attempt.ordinal !== completed + 1) invalidSession('invalid repetition order');
    previousAttempt = attempt.attempt;
    if (attempt.status === 'completed') completed += 1;
    return attempt;
  });
  if (completed !== record.completed) invalidSession('completed count does not match saved repetitions');
  if (value.currentAttempt !== null) {
    const current = validateAttempt(value.currentAttempt, record, true);
    if (current.attempt <= previousAttempt || current.ordinal !== completed + 1 || record.remaining === 0) invalidSession('invalid active repetition');
    record.currentAttempt = current;
  }
  return record;
}

export async function getSessions(gunId) {
  return sortSessions(await getOwnedRows(SESSIONS, await resolveGunId(gunId)));
}

export async function clearSessions(gunId) {
  await clearOwnedRows(SESSIONS, gunId);
}

export async function getSession(id, gunId) {
  if (typeof id !== 'string' || !id) throw new TypeError('Invalid saved session ID.');
  const owner = await resolveGunId(gunId);
  if (!owner) return null;
  const row = await getRow(SESSIONS, id);
  return row?.gunId === owner ? row : null;
}

/** Revision guards protect durable results from delayed asynchronous writes. */
export async function saveSession(record, gunId) {
  const owner = await resolveGunId(gunId, true);
  const row = validateSession(record, owner);
  return withOwnedTransaction(owner, SESSIONS, (tx, context) => {
    const store = tx.objectStore(SESSIONS);
    const request = store.get(row.id);
    request.onsuccess = () => {
      const previous = request.result;
      if (previous) {
        if (previous.gunId !== owner) { context.fail(new Error('Saved session belongs to another gun.')); return; }
        const immutable = ['kind', 'practiceMode', 'gunName', 'gunType', 'drillId', 'drillTitle', 'drillSteps', 'config', 'startedAt'];
        if (immutable.some(key => JSON.stringify(previous[key]) !== JSON.stringify(row[key]))) {
          context.fail(new Error('A saved session snapshot cannot be changed.')); return;
        }
        if (row.revision <= previous.revision) { context.result = previous; return; }
        if (TERMINAL_SESSION_STATUSES.includes(previous.status) || row.completed < previous.completed ||
            previous.repetitions.some((attempt, index) => JSON.stringify(attempt) !== JSON.stringify(row.repetitions[index]))) {
          context.fail(new Error('Saved session results cannot be rewritten or reopened.')); return;
        }
      }
      store.put(row);
      context.result = row;
    };
  });
}

/** Recover the last durable snapshot; never restart capture automatically. */
export async function recoverInterruptedSessions(gunId) {
  const owner = await resolveGunId(gunId);
  if (!owner) return [];
  return withOwnedTransaction(owner, SESSIONS, (tx, context) => {
    const store = tx.objectStore(SESSIONS);
    const request = store.index('gunId').getAll(owner);
    request.onsuccess = () => {
      try {
        const recovered = [];
        for (const record of request.result) {
          if (!['running', 'paused'].includes(record.status)) continue;
          const recover = record.kind === 'practice' ? recoverPracticeRecord : recoverSessionRecord;
          const row = validateSession(recover(record, Date.now()), owner);
          store.put(row); recovered.push(row);
        }
        context.result = sortSessions(recovered);
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
          format: 'sound-trainer-backup', version: 4, featureVersion: FEATURE_VERSION,
          exportedAt: new Date().toISOString(), guns: snapshot[GUNS],
          activeGunId: snapshot[SETTINGS].find(row => row.key === ACTIVE_GUN)?.value ?? null,
          settings: Object.fromEntries(snapshot[SETTINGS].filter(row => row.key !== ACTIVE_GUN && row.key !== 'maxResults').map(row => [row.key, row.value])),
          gunSettings: snapshot[GUN_SETTINGS], examples: snapshot[EXAMPLES].filter(currentExample),
          events: sortedEvents(snapshot[EVENTS]), sessions: sortSessions(snapshot[SESSIONS]),
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
  if (!backup || backup.format !== 'sound-trainer-backup' || ![1, 2, 3, 4].includes(backup.version) || backup.featureVersion !== FEATURE_VERSION) {
    throw new Error('This file is not a compatible Dry Fire With Ease backup.');
  }
  const v1 = backup.version === 1;
  if (!Array.isArray(backup.examples) || !Array.isArray(backup.events) ||
      backup.examples.length > MAX_COMPATIBLE_EXAMPLES_PER_CLASS * labels.length * (v1 ? 1 : MAX_GUNS) ||
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
    if (row.key === 'practiceConfig') value = currentPracticeSettings(value);
    value = validatePracticeSetting(row.key, value);
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
    if (count > MAX_COMPATIBLE_EXAMPLES_PER_CLASS) throw new Error('Too many examples of one sound.');
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
  const sessionRows = backup.version >= 3 ? backup.sessions ?? [] : [];
  if (!Array.isArray(sessionRows)) throw new Error('Backup contains invalid saved sessions.');
  for (const row of sessionRows) {
    if (!row || !gunIds.has(row.gunId)) throw new Error('Backup contains a saved session with an unknown gun owner.');
  }
  const sessionIds = new Set();
  const sessions = Array.from(sessionRows.filter(supportedSession), row => {
    const record = validateSession(currentPracticeRecord(row), row.gunId);
    if (sessionIds.has(record.id)) throw new Error('Backup contains duplicated saved session IDs.');
    sessionIds.add(record.id);
    return record;
  });
  return { guns: safeGuns, activeGunId, settings: structuredClone(settings), gunSettings: safeGunSettings, examples: safeExamples, events, sessions };
}

/** Validate the entire library before one atomic replacement transaction. */
export async function restoreBackup(backup) {
  const data = validateBackup(backup);
  await withTransaction(STORES, 'readwrite', tx => {
    for (const name of STORES) {
      if (name !== SETTINGS || backup.version >= 2) tx.objectStore(name).clear();
    }
    if (backup.version === 1) {
      tx.objectStore(SETTINGS).delete(ACTIVE_GUN);
      tx.objectStore(SETTINGS).delete('maxResults');
    }
    for (const row of data.guns) tx.objectStore(GUNS).put(row);
    for (const row of data.examples) tx.objectStore(EXAMPLES).put(row);
    for (const row of data.events) tx.objectStore(EVENTS).put(row);
    for (const row of data.sessions) tx.objectStore(SESSIONS).put(row);
    for (const row of data.gunSettings) tx.objectStore(GUN_SETTINGS).put(row);
    for (const [key, value] of Object.entries(data.settings)) tx.objectStore(SETTINGS).put({ key, value });
    if (data.activeGunId) tx.objectStore(SETTINGS).put({ key: ACTIVE_GUN, value: data.activeGunId });
  });
  return { guns: data.guns.length, examples: data.examples.length, events: data.events.length, sessions: data.sessions.length,
    maxResults: normalizeMaxResults(data.gunSettings.find(row => row.gunId === data.activeGunId && row.key === 'maxResults')?.value ?? 50) };
}
