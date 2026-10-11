import * as storage from '../src/storage.js';
import { jest } from '@jest/globals';

const removeDb = () => new Promise((resolve, reject) => {
  const request = indexedDB.deleteDatabase('dryfire-sound-trainer');
  request.onsuccess = resolve;
  request.onerror = () => reject(request.error);
});
beforeEach(removeDb);
afterAll(removeDb);

async function seed() {
  const a = await storage.createGun({name:'Handgun A',type:'Handguns'});
  const b = await storage.createGun({name:'Rifle B',type:'Rifles and Carbines'});
  await storage.addExample('trigger',Array(15).fill(.25),a.id);
  await storage.addEvent({label:'trigger',score:90},a.id);
  await storage.saveCustomDrill({id:'custom-test',title:'Press',steps:['trigger']},a.id);
  await storage.setGunSetting('audioPreferences',{noiseFilter:true,autoGain:false},a.id);
  await storage.setSetting('appearance','light');
  return {a,b};
}

test('editing a nonselected gun preserves identity, other selection and all owned data',async()=>{
  const {a,b} = await seed();
  const before = await storage.exportBackup();
  await storage.updateGun(a.id,{name:'Renamed gun',type:'Shotguns'});
  const after = await storage.exportBackup();
  expect((await storage.getActiveGun()).id).toBe(b.id);
  expect(after.guns.find(g=>g.id===a.id)).toMatchObject({id:a.id,name:'Renamed gun',type:'Shotguns',createdAt:a.createdAt});
  for(const key of ['examples','events','gunSettings','sessions','settings'])expect(after[key]).toEqual(before[key]);
});

test('full app reset clears every app store and allows fresh first-gun setup',async()=>{
  await seed();
  expect(typeof storage.resetLibrary).toBe('function');
  await storage.resetLibrary();
  const cleared=await storage.exportBackup();
  for(const key of ['guns','examples','events','gunSettings','sessions'])expect(cleared[key]).toEqual([]);
  expect(cleared.settings).toEqual({});
  expect(await storage.getActiveGun()).toBeNull();
  const newGun=await storage.createGun({name:'Fresh gun',type:'Handguns'});
  expect((await storage.getActiveGun()).id).toBe(newGun.id);
});

test('an aborted reset leaves the whole preexisting library intact',async()=>{
  await seed();const before=await storage.exportBackup();
  expect(typeof storage.resetLibrary).toBe('function');
  const original=IDBObjectStore.prototype.clear;
  const spy=jest.spyOn(IDBObjectStore.prototype,'clear').mockImplementation(function(){
    if(this.name==='settings')throw new Error('Injected transaction failure');
    return original.call(this);
  });
  try{await expect(storage.resetLibrary()).rejects.toThrow('Injected transaction failure');}finally{spy.mockRestore();}
  const after=await storage.exportBackup();
  expect({...after,exportedAt:before.exportedAt}).toEqual(before);
});

test('a compatible exported backup restores the full library after intentional reset',async()=>{
  await seed();const backup=await storage.exportBackup();
  expect(typeof storage.resetLibrary).toBe('function');
  await storage.resetLibrary();await storage.restoreBackup(backup);
  const restored=await storage.exportBackup();
  expect({...restored,exportedAt:backup.exportedAt}).toEqual(backup);
});
