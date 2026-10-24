import { readFileSync } from 'node:fs';
import { createGun, exportBackup, restoreBackup, saveSession, getSessions, getExamples, getGuns, getGunSetting, addExample } from '../src/storage.js';
import { createPractice, toPracticeRecord, normalizePracticeConfig } from '../src/practiceSession.js';
import { createSession, toSessionRecord } from '../src/drillSession.js';
const retired = JSON.parse(readFileSync(new URL('./fixtures/retired-practice-sessions.json', import.meta.url)));
const name = 'dryfire-sound-trainer';
const removeDb = () => new Promise((resolve, reject) => { const r = indexedDB.deleteDatabase(name); r.onsuccess = resolve; r.onerror = () => reject(r.error); });
beforeEach(removeDb); afterAll(removeDb);
async function library() {
  const a = await createGun({ name: 'A', type: 'Handguns' }), b = await createGun({ name: 'B', type: 'Shotguns' });
  await addExample('trigger', Array(15).fill(.2), a.id);
  for (const gun of [a, b]) {
    await saveSession(toPracticeRecord(createPractice({ id: `kept-${gun.id}`, gun, mode: 'single', monoNow: 0, epochNow: 1000 })), gun.id);
    await saveSession(toSessionRecord(createSession({ id: `sequence-${gun.id}`, gun, drill: { id: 'rack-trigger' }, monoNow: 0, epochNow: 1000 })), gun.id);
  }
  const backup = await exportBackup();
  for (const gun of [a, b]) {
    backup.sessions.push(...retired.map(row => ({ ...structuredClone(row), id: `${row.id}-${gun.id}`, gunId: gun.id, gunName: gun.name, gunType: gun.type })));
    backup.gunSettings.push({ gunId: gun.id, key: 'practiceConfig', value: Object.fromEntries(['single', ...retired.map(row => row.practiceMode)].map(mode => [mode, { ...normalizePracticeConfig(), durationSeconds: 60, reloadStart: 'rack', reloadEnd: 'reload' }])) });
  }
  return { a, b, backup };
}
test('old backups remove only retired sessions/settings across guns, retaining recordings and sequence/practice history', async () => {
  const { a, b, backup } = await library();
  await restoreBackup(backup);
  for (const gun of [a, b]) {
    expect((await getSessions(gun.id)).map(row => row.id).sort()).toEqual([`kept-${gun.id}`, `sequence-${gun.id}`].sort());
    expect(await getGunSetting('practiceConfig', {}, gun.id)).toEqual({ single: normalizePracticeConfig() });
  }
  expect(await getGuns()).toHaveLength(2); expect(await getExamples(a.id)).toHaveLength(1);
  expect((await exportBackup()).sessions).toHaveLength(4);
});
test('schema 3 upgrades atomically and permanently removes only retired owned sessions', async () => {
  const { a, b, backup } = await library(); await removeDb();
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 3);
    request.onupgradeneeded = () => {
      const database = request.result;
      for (const [store, keyPath] of [['examples','id'],['events','id'],['settings','key'],['guns','id'],['gunSettings',['gunId','key']],['sessions','id']]) {
        const objectStore = database.createObjectStore(store, { keyPath });
        if (['examples','events','gunSettings','sessions'].includes(store)) objectStore.createIndex('gunId','gunId');
        if (store==='examples') objectStore.createIndex('label','label');
        if (store==='events') objectStore.createIndex('createdAt','createdAt');
        if (store==='sessions') objectStore.createIndex('startedAt','startedAt');
      }
    };
    request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  });
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(['examples','events','settings','guns','gunSettings','sessions'],'readwrite');
    for (const key of ['examples','events','guns','gunSettings','sessions']) for(const row of backup[key]) tx.objectStore(key).put(row);
    tx.objectStore('settings').put({key:'activeGunId',value:backup.activeGunId});
    for(const [key,value] of Object.entries(backup.settings)) tx.objectStore('settings').put({key,value});
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
  });db.close();
  for (const gun of [a,b]) expect(await getSessions(gun.id)).toHaveLength(2);
  expect(await getExamples(a.id)).toHaveLength(1);
  const again=await exportBackup();expect(again.sessions).toHaveLength(4);
  await restoreBackup(again);expect((await exportBackup()).sessions).toHaveLength(4);
});
test('unsupported future modes and malformed retained records still reject restores atomically', async()=>{
  const {a,backup}=await library();const before=await exportBackup();
  backup.sessions.push({...backup.sessions.find(row=>row.kind==='practice'),id:'unsupported',practiceMode:'unsupported',drillId:'practice-unsupported'});
  await expect(restoreBackup(backup)).rejects.toThrow();expect(await getSessions(a.id)).toHaveLength(2);
  const bad=structuredClone(before);bad.sessions.find(row=>row.kind==='practice').shots=123;
  await expect(restoreBackup(bad)).rejects.toThrow();expect(await getExamples(a.id)).toHaveLength(1);
});

test('all retained modes restore their older configuration snapshots and preserve outcomes', async () => {
  const { a, backup } = await library();
  const titles = { repeated: 'Repeated trigger presses', par: 'Par-time practice' };
  const records = ['single','repeated','par','control'].map(mode => {
    const row=toPracticeRecord(createPractice({ id:`old-${mode}`,gun:a,mode,monoNow:0,epochNow:1000 }));
    return {...row,drillTitle:titles[mode]??row.drillTitle,config:{...row.config,durationSeconds:60,reloadStart:'rack',reloadEnd:'reload'}};
  });
  backup.sessions=records;
  await restoreBackup(backup);
  const restored=await getSessions(a.id);
  expect(restored).toHaveLength(4);
  for(const row of restored){
    expect(row.repetitions).toEqual([]);
    expect(row.config).toEqual(normalizePracticeConfig());
    expect(row.drillTitle).toBe(records.find(original=>original.id===row.id).drillTitle);
    expect(Object.keys(row.config)).not.toContain('durationSeconds');
  }
  await restoreBackup(await exportBackup());expect(await getSessions(a.id)).toEqual(restored);
});
