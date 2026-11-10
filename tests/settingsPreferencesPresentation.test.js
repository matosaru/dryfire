/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {bindPreferenceContext} from './helpers/preferenceContext.js';
import '@dryfire/testing/setup';
import {setNodeText,setNodeDisabled} from '../src/domUpdates.js';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {preferencePresentation} from '../apps/web/src/features/settings/preferencePresentation.ts';
import {renderNativeSettingsPreferences} from '../src/optional/settingsPreferences.js';
import {renderPageTemplates} from '../tools/page-templates.mjs';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const body=source.slice(source.indexOf('function renderPreferences()'),source.indexOf('function reportAudioProcessing('));
function setup(){
 document.body.innerHTML=renderPageTemplates('{{app}}');
 const context={document,setNodeText,setNodeDisabled,settingsPage:null,presentSettingsPreferences:preferencePresentation,nativeSettingsPreferences:{renderNativeSettingsPreferences},$:selector=>document.querySelector(selector),previewTesting:{render:jest.fn()},getAudioCapabilities:()=>({noiseFilter:true,autoGain:true}),
  activeView:'settings',activeGun:{id:'a'},profileLocked:()=>false,audioPreferences:{noiseFilter:true,autoGain:false},processingReport:null,appearance:'light',measurementSystem:'imperial',busy:false,profileLoading:false,preferencePending:false,vibrationFeedback:true,vibrationRejected:false,getVibrationCapability:()=>true};
 bindPreferenceContext(context);
 const render=vm.runInNewContext(body+'\nrenderPreferences;',context);return{context,render};
}
const mountModel=(context)=>{context.settingsPage={update:jest.fn()};return context.settingsPage;};
const latest=(page)=>page.update.mock.calls.at(-1)[0].preferences;
test('saved preferences retain gun/device ownership and next-capture messaging',()=>{
 const {context,render}=setup();const page=mountModel(context);render();const view=latest(page);
 expect(context.previewTesting.render).toHaveBeenCalledTimes(1);expect(view.audio[0]).toMatchObject({checked:true,disabled:false,status:'Saved On · applies to the next capture.'});expect(view.audio[1]).toMatchObject({checked:false,disabled:false,status:'Saved Off · applies to the next capture.'});expect(view.appearance).toEqual({value:'light',disabled:false});expect(view.measurementSystem).toEqual({value:'imperial',disabled:false});expect(view.vibration).toMatchObject({checked:true,disabled:false});expect(view.vibration.status).toContain('Device output is not verified.');
});
test('unsupported Safari-style capabilities disable preferences without claiming recording is unavailable',()=>{
 const {context,render}=setup();const page=mountModel(context);context.getAudioCapabilities=()=>({noiseFilter:false,autoGain:false});context.getVibrationCapability=()=>false;render();const view=latest(page);for(const item of view.audio)expect(item.disabled).toBe(true);expect(view.audio[0].status).toBe('Unsupported by this browser. Recording remains available.');expect(view.vibration.disabled).toBe(true);expect(view.vibration.status).toBe('Vibration is unavailable in this browser.');expect(view.appearance.disabled).toBe(false);
});
test('actual track reports distinguish confirmed, rejected and unconfirmed processing',()=>{
 const {context,render}=setup();const page=mountModel(context);context.processingReport={noiseFilter:{status:'confirmed',applied:true},autoGain:{status:'not-applied',requested:false}};render();expect(latest(page).audio.map(item=>item.status)).toEqual(['Last capture: On, confirmed by the audio track.','The last audio track did not apply the requested Off setting.']);
 context.processingReport={noiseFilter:{status:'confirmed',applied:false},autoGain:{status:'unconfirmed'}};render();expect(latest(page).audio.map(item=>item.status)).toEqual(['Last capture: Off, confirmed by the audio track.','The browser did not confirm this setting on the last audio track.']);
 context.processingReport={autoGain:{status:'not-applied',requested:true}};render();expect(latest(page).audio[1].status).toContain('requested On setting.');
});
test('no/incomplete gun blocks audio preferences while device appearance remains available',()=>{
 const {context,render}=setup();const page=mountModel(context);for(const gun of [null,{id:'a',needsDetails:true}]){context.activeGun=gun;render();expect(latest(page).audio.every(item=>item.disabled)).toBe(true);expect(latest(page).appearance.disabled).toBe(false);}
});
test('capture/profile/preference locks and rejected vibration retain their separate scopes',()=>{
 const {context,render}=setup();const page=mountModel(context);context.profileLocked=()=>true;context.busy=true;render();expect(latest(page).audio.every(item=>item.disabled)).toBe(true);expect(latest(page).appearance.disabled).toBe(true);expect(latest(page).vibration.disabled).toBe(true);
 context.profileLocked=()=>false;context.busy=false;context.profileLoading=true;render();expect(latest(page).appearance.disabled).toBe(true);context.profileLoading=false;context.preferencePending=true;render();expect(latest(page).appearance.disabled).toBe(true);
 context.preferencePending=false;context.vibrationRejected=true;render();expect(latest(page).vibration.disabled).toBe(true);expect(latest(page).vibration.status).toContain('browser declined vibration');context.vibrationRejected=false;context.vibrationFeedback=false;render();expect(latest(page).vibration.status).toContain('Off · requests vibration');
});
test('mounted Settings receives the shared preference model without competing native writes',()=>{
 const {context,render}=setup();const page=mountModel(context);render();expect(page.update).toHaveBeenCalledWith({preferences:preferencePresentation({capabilities:context.getAudioCapabilities(),audioPreferences:context.audioPreferences,processingReport:null,appearance:'light',measurementSystem:'imperial',gunAvailable:true,locked:false,deviceLocked:false,vibrationFeedback:true,vibrationSupported:true,vibrationRejected:false})});
});
test('unchanged native preferences avoid property setters and style invalidation',()=>{
 const {render}=setup();render();
 const spies=[[HTMLInputElement.prototype,'checked'],[HTMLInputElement.prototype,'disabled'],[HTMLSelectElement.prototype,'value'],[HTMLSelectElement.prototype,'disabled']].map(([prototype,key])=>jest.spyOn(prototype,key,'set'));
 try{render();for(const spy of spies)expect(spy).not.toHaveBeenCalled();}finally{for(const spy of spies)spy.mockRestore();}
});
