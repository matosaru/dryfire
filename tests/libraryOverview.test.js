import {jest} from '@jest/globals';
import {getLibraryOverview,createGun,getActiveGun,getGuns,setSetting,getSetting,getOutdatedExampleCount,exportBackup} from '../src/storage.js';
const clear=()=>new Promise((resolve,reject)=>{const request=indexedDB.deleteDatabase('dryfire-sound-trainer');request.onsuccess=resolve;request.onerror=()=>reject(request.error);});
beforeEach(clear);afterEach(()=>jest.restoreAllMocks());
test('empty startup obtains library, active profile and preference defaults through one database open',async()=>{
 const opened=jest.spyOn(indexedDB,'open');expect(await getLibraryOverview()).toEqual({guns:[],activeGun:null,devicePreferences:{appearance:'dark',vibrationFeedback:false}});expect(opened).toHaveBeenCalledTimes(1);
});
test('snapshot matches existing public reads and preserves all stored data',async()=>{
 await createGun({name:'One',type:'Handguns'});await createGun({name:'Two',type:'Shotguns'});await setSetting('appearance','light');await setSetting('vibrationFeedback',true);const {exportedAt:beforeTime,...before}=await exportBackup();
 const overview=await getLibraryOverview();expect(overview.guns).toEqual(await getGuns());expect(overview.activeGun).toEqual(await getActiveGun());expect(overview.devicePreferences).toEqual({appearance:'light',vibrationFeedback:true});const {exportedAt:afterTime,...after}=await exportBackup();expect(typeof beforeTime).toBe('string');expect(typeof afterTime).toBe('string');expect(after).toEqual(before);
});
test('missing active profile is not silently repaired or replaced with another gun',async()=>{
 await createGun({name:'One',type:'Handguns'});await new Promise((resolve,reject)=>{const opened=indexedDB.open('dryfire-sound-trainer',4);opened.onsuccess=()=>{const db=opened.result,tx=db.transaction('settings','readwrite');tx.objectStore('settings').put({key:'activeGunId',value:'deleted'});tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};opened.onerror=()=>reject(opened.error);});await setSetting('appearance',null);await setSetting('vibrationFeedback',null);const result=await getLibraryOverview();expect(result.guns).toHaveLength(1);expect(result.activeGun).toBeNull();expect(await getSetting('activeGunId',null)).toBe('deleted');expect(result.devicePreferences).toEqual({appearance:'dark',vibrationFeedback:false});
});

test('the first snapshot completes the existing legacy migration before exposing ownership',async()=>{
 await new Promise((resolve,reject)=>{const opened=indexedDB.open('dryfire-sound-trainer',1);opened.onupgradeneeded=()=>{const db=opened.result,ex=db.createObjectStore('examples',{keyPath:'id'}),events=db.createObjectStore('events',{keyPath:'id'});ex.createIndex('label','label');events.createIndex('createdAt','createdAt');db.createObjectStore('settings',{keyPath:'key'});ex.put({id:'old',label:'trigger',features:Array(15).fill(0.2),createdAt:1});};opened.onsuccess=()=>{opened.result.close();resolve();};opened.onerror=()=>reject(opened.error);});
 const snapshot=await getLibraryOverview();expect(snapshot.guns).toHaveLength(1);expect(snapshot.activeGun).toEqual(snapshot.guns[0]);expect(snapshot.activeGun.needsDetails).toBe(true);const backup=await exportBackup();expect(backup.activeGunId).toBe(snapshot.activeGun.id);expect(await getOutdatedExampleCount(snapshot.activeGun.id)).toBe(1);expect(backup.examples).toEqual([]);
});
