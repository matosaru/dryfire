import {STORES,SETTINGS,EXAMPLES,EVENTS,GUNS,GUN_SETTINGS,SESSIONS,legacyGun,withTransaction} from './database.js';
import {ACTIVE_GUN} from './constants.js';
import {normalizeMaxResults} from './validation.js';
import {validateBackup} from './backupValidation.js';

/** Validate the entire library before one atomic replacement transaction. */
export async function restoreBackup(backup) {
  const data = validateBackup(backup, legacyGun, () => Date.now());
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
