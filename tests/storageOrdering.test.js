import { restoreBackup, getGuns, getActiveGun, deleteGun, getEvents } from '../src/storage.js';

const removeDb = () => new Promise((resolve,reject) => {
  const request=indexedDB.deleteDatabase('dryfire-sound-trainer');request.onsuccess=resolve;request.onerror=()=>reject(request.error);
});
beforeEach(removeDb);afterAll(removeDb);
function library(events=[]) {
  return {format:'sound-trainer-backup',version:4,featureVersion:2,exportedAt:5000,
    guns:[
      {id:'gun-z',name:'First timestamp Z',type:'Handguns',createdAt:1000},
      {id:'gun-selected',name:'Selected newest',type:'Handguns',createdAt:3000},
      {id:'gun-a',name:'First timestamp A',type:'Handguns',createdAt:1000},
      {id:'gun-middle',name:'Middle timestamp',type:'Handguns',createdAt:2000},
    ],activeGunId:'gun-selected',settings:{},gunSettings:[],examples:[],events,sessions:[]};
}
test('same-timestamp guns have stable order and deletion selects the oldest remaining profile deterministically',async()=>{
  await restoreBackup(library());
  expect((await getGuns()).map(gun=>gun.id)).toEqual(['gun-a','gun-z','gun-middle','gun-selected']);
  await deleteGun('gun-selected');expect((await getActiveGun()).id).toBe('gun-a');
  await deleteGun('gun-a');expect((await getActiveGun()).id).toBe('gun-z');
  await deleteGun('gun-z');expect((await getActiveGun()).id).toBe('gun-middle');
});
test('History remains newest-first with deterministic ordering for identical event timestamps',async()=>{
  const event=(id,createdAt)=>({id,createdAt,gunId:'gun-selected',label:'trigger',score:90});
  await restoreBackup(library([event('event-old',1000),event('event-a',4000),event('event-middle',2000),event('event-z',4000)]));
  expect((await getEvents('gun-selected')).map(row=>row.id)).toEqual(['event-z','event-a','event-middle','event-old']);
});
