import {ACTIVE_GUN,MAX_EXAMPLES_PER_CLASS,MAX_GUNS,GUN_TYPES,DRILL_OUTCOMES,TERMINAL_SESSION_STATUSES} from './constants.js';
import {normalizeMaxResults,validGunDetails,validFeatures,validatePracticeSetting,validateCustomDrills,sortedEvents} from './validation.js';
import {validateSession} from './sessionValidation.js';
import {STORES,EXAMPLES,EVENTS,SETTINGS,GUNS,GUN_SETTINGS,SESSIONS,openDb,withTransaction} from './database.js';
export {MAX_EXAMPLES_PER_CLASS,MAX_GUNS,GUN_TYPES,normalizeMaxResults};
import { FEATURE_VERSION } from '../featureFormat.js';
import { parseNumberInput } from '../inputLimits.js';
import { labels } from '../classifier.js';
import { ACTUAL_CLASSES } from '../evaluation.js';
import { getDrill, normalizeCustomDrill } from '../drills.js';
import { recoverSessionRecord } from '../drillSession.js';
import { recoverPracticeRecord } from '../practiceSession.js';
import { normalizeCalibration, compatibleCalibration, CALIBRATION_KINDS } from '../calibration.js';

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

function orderGuns(rows) { return rows.sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)); }

export async function getGuns() { return orderGuns(await getAll(GUNS)); }

/** One read-only snapshot avoids reopening IndexedDB for each startup field. */
export async function getLibraryOverview() {
  const rows = await withTransaction([GUNS, SETTINGS], 'readonly', (tx, context) => {
    const result = {}; context.result = result;
    const guns = tx.objectStore(GUNS).getAll();
    guns.onsuccess = () => { result.guns = guns.result; };
    for (const key of [ACTIVE_GUN, 'appearance', 'vibrationFeedback']) {
      const request = tx.objectStore(SETTINGS).get(key);
      request.onsuccess = () => { result[key] = request.result?.value; };
    }
  });
  const guns = orderGuns(rows.guns);
  return { guns, activeGun: rows[ACTIVE_GUN] ? guns.find(gun => gun.id === rows[ACTIVE_GUN]) ?? null : null,
    devicePreferences: { appearance: rows.appearance ?? 'dark', vibrationFeedback: rows.vibrationFeedback ?? false } };
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

const sortSessions = rows => rows.sort((a, b) => b.startedAt - a.startedAt || b.id.localeCompare(a.id));

/** Strict portable records exclude raw audio and runtime timer handles. */

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


