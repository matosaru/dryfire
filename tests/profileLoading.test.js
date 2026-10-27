/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {bindPreferenceContext} from './helpers/preferenceContext.js';

import {startGunPreferenceReads} from '../src/gunPreferenceReads.js';
import {setNodeText,setNodeDisabled} from '../src/domUpdates.js';

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
 const context={gunLibraryCoordinator:{invalidate:jest.fn()},startGunPreferenceReads,getLibraryOverview:jest.fn(async()=>({activeGun:gun,guns:gun?[gun]:[],devicePreferences:{appearance:'light',vibrationFeedback:true}})),setNodeText,setNodeDisabled,initializeTimedControllers:jest.fn(),historyPage:null,learnPage:null,livePage:null,document,Option,$:s=>document.querySelector(s),historyRenderToken:0,homeRenderToken:0,gunLibraryToken:0,
  activeGun:null,guns:[],examples:[],customDrills:[],audioPreferences:{},calibration:[],enabledSoundLabels:[],
  processingReport:{old:true},latestEventId:'old',sessionEventCount:4,ignoredEventCount:2,appearance:'dark',vibrationFeedback:false,vibrationRejected:true,
  getActiveGun:jest.fn(async()=>gun),getGuns:jest.fn(async()=>gun?[gun]:[]),
  getExamples:jest.fn(async()=>[{label:'trigger',gunId:'a'}]),getCustomDrills:jest.fn(async()=>[]),getOutdatedExampleCount:jest.fn(async()=>2),
  getGunSetting:jest.fn(async(key,fallback)=>({maxResults:75,sensitivity:'high',selectedDrill:'valid',audioPreferences:{noiseFilter:false},enabledSoundLabels:['trigger','rack']})[key]??fallback),
  getCalibrationExamples:jest.fn(async()=>[{kind:'noise'}]),getSetting:jest.fn(async(key)=>key==='appearance'?'light':true),
  normalizeAudioPreferences,normalizeEnabledLabels,initialEnabledLabels,normalizeMaxResults,currentDrill:jest.fn(id=>id==='valid'?{id}:null),
  sessionController:{reset:jest.fn()},practiceController:{reset:jest.fn()},customEditor:{reset:jest.fn()},DRILLS:[{id:'valid',title:'Valid sequence'}],
  applyAppearance:jest.fn(),selectDrillCollection:jest.fn(),renderGunControls:jest.fn(),renderClassCards:jest.fn(),renderDrillCatalog:jest.fn(),
  renderCustomCatalog:jest.fn(),resetDrill:jest.fn(),renderPreferences:jest.fn(),renderHome:jest.fn(async()=>{}),
 };
 bindPreferenceContext(context);
 const load=vm.runInNewContext(extract('function historyDisabled(', 'const liveHandlers')+'\n'+extract('function liveText(', 'function bindSettings(')+'\n'+extract('async function loadDevicePreferences()','function renderPreferences()')+'\n'+extract('function renderModelNotice(', 'function learningProps(')+'\n'+extract('async function loadActiveGun(','function openGunSetup(')+'\n({load:loadActiveGun,loadPreferences:loadDevicePreferences});',context);
 return{context,...load};
}
test('profile loading preserves owned values, preference normalization and final reset/render state',async()=>{
 const {context:c,load}=setup();await load();
 expect(c.initializeTimedControllers).toHaveBeenCalledTimes(1);expect(c.activeGun.id).toBe('a');expect(c.guns).toEqual([c.activeGun]);
 for(const getter of ['getExamples','getCustomDrills','getOutdatedExampleCount','getCalibrationExamples'])expect(c[getter]).toHaveBeenCalledWith('a');
 expect(document.querySelector('#maxResults').value).toBe('75');expect(document.querySelector('#sensitivity').value).toBe('high');
 expect(c.getGunSetting).toHaveBeenCalledWith('selectedDrill','','a');expect(c.currentDrill).toHaveBeenCalledWith('valid');expect(c.audioPreferences.noiseFilter).toBe(false);expect(c.enabledSoundLabels).toEqual(['rack','trigger']);
 expect(c.appearance).toBe('light');expect(c.vibrationFeedback).toBe(true);expect(c.vibrationRejected).toBe(false);expect(c.applyAppearance).toHaveBeenCalledTimes(1);
 expect(c.processingReport).toBeNull();expect(c.latestEventId).toBeNull();expect(c.sessionEventCount).toBe(0);expect(c.ignoredEventCount).toBe(0);
 expect(c.sessionController.reset).toHaveBeenCalledTimes(1);expect(c.practiceController.reset).toHaveBeenCalledTimes(1);
 expect(c.renderHome).toHaveBeenCalledTimes(1);
});
test('empty libraries retain defaults without requesting another gun’s records',async()=>{
 const {context:c,load}=setup(null);await load();
 for(const getter of ['getExamples','getCustomDrills','getOutdatedExampleCount','getGunSetting','getCalibrationExamples'])expect(c[getter]).not.toHaveBeenCalled();
 expect(c.initializeTimedControllers).not.toHaveBeenCalled();expect(c.examples).toEqual([]);expect(c.calibration).toEqual([]);expect(c.customDrills).toEqual([]);
 expect(document.querySelector('#maxResults').value).toBe('50');expect(document.querySelector('#sensitivity').value).toBe('normal');
 expect(c.enabledSoundLabels).toEqual(['trigger']);expect(c.renderHome).toHaveBeenCalledTimes(1);
});
test('profile reads failing before presentation do not render a partially loaded profile',async()=>{
 const {context:c,load}=setup();c.getExamples.mockRejectedValue(new Error('read failed'));
 await expect(load()).rejects.toThrow('read failed');expect(c.renderHome).not.toHaveBeenCalled();expect(c.renderGunControls).not.toHaveBeenCalled();
});
test('atomic library snapshot holds profile and preferences until the complete read resolves',async()=>{
 const {context:c,load}=setup(),snapshot=deferred();c.getLibraryOverview.mockReturnValue(snapshot.promise);
 const pending=load();expect(c.getLibraryOverview).toHaveBeenCalledTimes(1);expect(c.applyAppearance).not.toHaveBeenCalled();expect(c.renderGunControls).not.toHaveBeenCalled();
 snapshot.resolve({activeGun:{id:'a',name:'Test'},guns:[{id:'a'}],devicePreferences:{appearance:'light',vibrationFeedback:true}});await pending;expect(c.applyAppearance).toHaveBeenCalledTimes(1);
});
test('standalone preference reload still waits for both device settings',async()=>{
 const {context:c,loadPreferences}=setup(),appearance=deferred(),requested=deferred();
 c.getSetting.mockImplementation(key=>{if(key==='appearance'){requested.resolve();return appearance.promise;}return Promise.resolve(true);});
 const pending=loadPreferences();await requested.promise;expect(c.getSetting).toHaveBeenCalledWith('vibrationFeedback',false);expect(c.applyAppearance).not.toHaveBeenCalled();appearance.resolve('light');await pending;expect(c.appearance).toBe('light');
});
test('startup can reuse its complete snapshot without reopening the library',async()=>{
 const {context:c,load}=setup(null);await load({activeGun:null,guns:[],devicePreferences:{appearance:'invalid',vibrationFeedback:'true'}});expect(c.getLibraryOverview).not.toHaveBeenCalled();expect(c.appearance).toBe('dark');expect(c.vibrationFeedback).toBe(false);expect(c.getSetting).not.toHaveBeenCalled();
});
test('snapshot read failure preserves the current profile and prevents partial presentation',async()=>{
 const {context:c,load}=setup();c.getLibraryOverview.mockRejectedValue(new Error('read blocked'));await expect(load()).rejects.toThrow('read blocked');expect(c.activeGun).toBeNull();expect(c.applyAppearance).not.toHaveBeenCalled();expect(c.renderGunControls).not.toHaveBeenCalled();
});

test('saved-preset validation still fails before applying prefetched settings or profile presentation',async()=>{
 const {context:c,load}=setup();c.currentDrill.mockImplementation(()=>{throw new Error('invalid saved preset');});
 await expect(load()).rejects.toThrow('invalid saved preset');
 expect(c.getGunSetting).toHaveBeenCalledWith('selectedDrill','','a');
 expect(c.getGunSetting).toHaveBeenCalledWith('audioPreferences',{},'a');
 expect(c.audioPreferences).toEqual({});expect(c.calibration).toEqual([]);
 expect(c.renderHome).not.toHaveBeenCalled();expect(c.renderGunControls).not.toHaveBeenCalled();
});
test('saved-preset read failure takes precedence over validation and later prefetched failures',async()=>{
 const {context:c,load}=setup(),read=c.getGunSetting.getMockImplementation();
 c.getGunSetting.mockImplementation((...args)=>args[0]==='selectedDrill'?Promise.reject(new Error('preset read failed')):args[0]==='audioPreferences'?Promise.reject(new Error('later read failed')):read(...args));
 await expect(load()).rejects.toThrow('preset read failed');
 expect(c.currentDrill).not.toHaveBeenCalled();expect(c.renderHome).not.toHaveBeenCalled();
});
