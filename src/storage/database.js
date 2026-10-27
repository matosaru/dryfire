import {ACTIVE_GUN} from './constants.js';
import {supportedSession,currentPracticeRecord,currentPracticeSettings,validatePracticeSetting} from './validation.js';

export const DB_NAME = 'dryfire-sound-trainer';
export const DB_VERSION = 4;
export const EXAMPLES = 'examples';
export const EVENTS = 'events';
export const SETTINGS = 'settings';
export const GUNS = 'guns';
export const GUN_SETTINGS = 'gunSettings';
export const SESSIONS = 'sessions';

export const STORES = [EXAMPLES, EVENTS, SETTINGS, GUNS, GUN_SETTINGS, SESSIONS];

export function legacyGun() {
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

export function openDb() {
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

export function withTransaction(storeNames, mode, action) {
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

