/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {renderPageTemplates} from '../tools/page-templates.mjs';
import {normalizeAudioPreferences} from '../src/audioPreferences.js';
import {normalizeEnabledLabels,initialEnabledLabels} from '../src/calibration.js';
import {normalizeMaxResults} from '../src/storage.js';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const extract=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end));
const deferred=()=>{let resolve;const promise=new Promise(yes=>{resolve=yes;});return{promise,resolve};};
function setup(gun={id:'a',name:'Test',type:'Handguns'}){
 document.body.innerHTML=renderPageTemplates('{{app}}');
 const context={learnPage:null,document,Option,$:s=>document.querySelector(s),historyRenderToken:0,homeRenderToken:0,gunLibraryToken:0,
  activeGun:null,guns:[],examples:[],customDrills:[],selectedTimedDrillId:'',audioPreferences:{},calibration:[],enabledSoundLabels:[],
  processingReport:{old:true},latestEventId:'old',sessionEventCount:4,ignoredEventCount:2,appearance:'dark',vibrationFeedback:false,vibrationRejected:true,
  getActiveGun:jest.fn(async()=>gun),getGuns:jest.fn(async()=>gun?[gun]:[]),
  getExamples:jest.fn(async()=>[{label:'trigger',gunId:'a'}]),getCustomDrills:jest.fn(async()=>[]),getOutdatedExampleCount:jest.fn(async()=>2),
  getGunSetting:jest.fn(async(key,fallback)=>({maxResults:75,sensitivity:'high',selectedDrill:'valid',audioPreferences:{noiseFilter:false},enabledSoundLabels:['trigger','rack']})[key]??fallback),
  getCalibrationExamples:jest.fn(async()=>[{kind:'noise'}]),getSetting:jest.fn(async(key)=>key==='appearance'?'light':true),
  normalizeAudioPreferences,normalizeEnabledLabels,initialEnabledLabels,normalizeMaxResults,currentDrill:id=>id==='valid'?{id}:null,
  sessionController:{reset:jest.fn()},practiceController:{reset:jest.fn()},customEditor:{reset:jest.fn()},DRILLS:[{id:'valid',title:'Valid sequence'}],
  applyAppearance:jest.fn(),selectDrillCollection:jest.fn(),renderGunControls:jest.fn(),renderClassCards:jest.fn(),renderDrillCatalog:jest.fn(),
  renderCustomCatalog:jest.fn(),resetDrill:jest.fn(),renderPreferences:jest.fn(),renderHome:jest.fn(async()=>{}),
 };
 const load=vm.runInNewContext(extract('async function loadDevicePreferences()','function renderPreferences()')+'\n'+extract('function renderModelNotice(', 'function learningProps(')+'\n'+extract('async function loadActiveGun()','function openGunSetup(')+'\nloadActiveGun;',context);
 return{context,load};
}
test('profile loading preserves owned values, preference normalization and final reset/render state',async()=>{
 const {context:c,load}=setup();await load();
 expect(c.activeGun.id).toBe('a');expect(c.guns).toEqual([c.activeGun]);
 for(const getter of ['getExamples','getCustomDrills','getOutdatedExampleCount','getCalibrationExamples'])expect(c[getter]).toHaveBeenCalledWith('a');
 expect(document.querySelector('#maxResults').value).toBe('75');expect(document.querySelector('#sensitivity').value).toBe('high');
 expect(c.selectedTimedDrillId).toBe('valid');expect(c.audioPreferences.noiseFilter).toBe(false);expect(c.enabledSoundLabels).toEqual(['rack','trigger']);
 expect(c.appearance).toBe('light');expect(c.vibrationFeedback).toBe(true);expect(c.vibrationRejected).toBe(false);expect(c.applyAppearance).toHaveBeenCalledTimes(1);
 expect(c.processingReport).toBeNull();expect(c.latestEventId).toBeNull();expect(c.sessionEventCount).toBe(0);expect(c.ignoredEventCount).toBe(0);
 expect(c.sessionController.reset).toHaveBeenCalledTimes(1);expect(c.practiceController.reset).toHaveBeenCalledTimes(1);
 expect(c.renderHome).toHaveBeenCalledTimes(1);
});
test('empty libraries retain defaults without requesting another gun’s records',async()=>{
 const {context:c,load}=setup(null);await load();
 for(const getter of ['getExamples','getCustomDrills','getOutdatedExampleCount','getGunSetting','getCalibrationExamples'])expect(c[getter]).not.toHaveBeenCalled();
 expect(c.examples).toEqual([]);expect(c.calibration).toEqual([]);expect(c.customDrills).toEqual([]);
 expect(document.querySelector('#maxResults').value).toBe('50');expect(document.querySelector('#sensitivity').value).toBe('normal');
 expect(c.enabledSoundLabels).toEqual(['trigger']);expect(c.renderHome).toHaveBeenCalledTimes(1);
});
test('profile reads failing before presentation do not render a partially loaded profile',async()=>{
 const {context:c,load}=setup();c.getExamples.mockRejectedValue(new Error('read failed'));
 await expect(load()).rejects.toThrow('read failed');expect(c.renderHome).not.toHaveBeenCalled();expect(c.renderGunControls).not.toHaveBeenCalled();
});
test('gun library and selection reads start independently, with rendering held until both finish',async()=>{
 const {context:c,load}=setup(),selection=deferred();c.getActiveGun.mockReturnValue(selection.promise);
 const pending=load();
 try{expect(c.getGuns).toHaveBeenCalledTimes(1);expect(c.renderGunControls).not.toHaveBeenCalled();}
 finally{selection.resolve({id:'a',name:'Test',type:'Handguns'});await pending;}
});
test('independent device preference reads start together and apply only after both resolve',async()=>{
 const {context:c,load}=setup(),appearance=deferred(),requested=deferred();
 c.getSetting.mockImplementation(key=>{if(key==='appearance'){requested.resolve();return appearance.promise;}return Promise.resolve(true);});
 const pending=load();await requested.promise;
 try{expect(c.getSetting).toHaveBeenCalledWith('vibrationFeedback',false);expect(c.applyAppearance).not.toHaveBeenCalled();}
 finally{appearance.resolve('light');await pending;}
});

test('device preferences can load while gun selection is pending without presenting a profile',async()=>{
 const {context:c,load}=setup(),selection=deferred();c.getActiveGun.mockReturnValue(selection.promise);
 const pending=load();
 try{expect(c.getSetting).toHaveBeenCalledWith('appearance','dark');expect(c.renderGunControls).not.toHaveBeenCalled();}
 finally{selection.resolve({id:'a',name:'Test',type:'Handguns'});await pending;}
});
