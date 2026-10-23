/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {setNodeText} from '../src/domUpdates.js';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {preferencePresentation} from '../apps/web/src/features/settings/preferencePresentation.ts';
import {renderPageTemplates} from '../tools/page-templates.mjs';
const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const body=source.slice(source.indexOf('function renderPreferences()'),source.indexOf('function reportAudioProcessing('));
function setup(){
 document.body.innerHTML=renderPageTemplates('{{app}}');
 const context={setNodeText,settingsPage:null,preferencePresentation,$:selector=>document.querySelector(selector),previewTesting:{render:jest.fn()},getAudioCapabilities:()=>({noiseFilter:true,autoGain:true}),
  activeGun:{id:'a'},profileLocked:()=>false,audioPreferences:{noiseFilter:true,autoGain:false},processingReport:null,appearance:'light',busy:false,profileLoading:false,preferencePending:false,vibrationFeedback:true,vibrationRejected:false,getVibrationCapability:()=>true};
 const render=vm.runInNewContext(body+'\nrenderPreferences;',context);return{context,render};
}
test('saved preferences retain gun/device ownership and next-capture messaging',()=>{
 const {context,render}=setup();render();expect(context.previewTesting.render).toHaveBeenCalledTimes(1);expect(document.querySelector('#noiseFilter')).toBeChecked();expect(document.querySelector('#autoGainControl')).not.toBeChecked();expect(document.querySelector('#appearance')).toHaveValue('light');expect(document.querySelector('#noiseFilterStatus')).toHaveTextContent('Saved On · applies to the next capture.');expect(document.querySelector('#autoGainStatus')).toHaveTextContent('Saved Off · applies to the next capture.');expect(document.querySelector('#vibrationFeedback')).toBeChecked();expect(document.querySelector('#vibrationStatus')).toHaveTextContent('Device output is not verified.');
});
test('unsupported Safari-style capabilities disable preferences without claiming recording is unavailable',()=>{
 const {context,render}=setup();context.getAudioCapabilities=()=>({noiseFilter:false,autoGain:false});context.getVibrationCapability=()=>false;render();for(const id of ['noiseFilter','autoGainControl','vibrationFeedback'])expect(document.querySelector('#'+id)).toBeDisabled();expect(document.querySelector('#noiseFilterStatus')).toHaveTextContent('Unsupported by this browser. Recording remains available.');expect(document.querySelector('#vibrationStatus')).toHaveTextContent('Vibration is unavailable in this browser.');expect(document.querySelector('#appearance')).not.toBeDisabled();
});
test('actual track reports distinguish confirmed, rejected and unconfirmed processing',()=>{
 const {context,render}=setup();context.processingReport={noiseFilter:{status:'confirmed',applied:true},autoGain:{status:'not-applied',requested:false}};render();expect(document.querySelector('#noiseFilterStatus')).toHaveTextContent('Last capture: On, confirmed by the audio track.');expect(document.querySelector('#autoGainStatus')).toHaveTextContent('did not apply the requested Off setting.');
 context.processingReport={noiseFilter:{status:'confirmed',applied:false},autoGain:{status:'unconfirmed'}};render();expect(document.querySelector('#noiseFilterStatus')).toHaveTextContent('Last capture: Off, confirmed by the audio track.');expect(document.querySelector('#autoGainStatus')).toHaveTextContent('did not confirm this setting');
 context.processingReport={autoGain:{status:'not-applied',requested:true}};render();expect(document.querySelector('#autoGainStatus')).toHaveTextContent('requested On setting.');
});
test('no/incomplete gun blocks audio preferences while device appearance remains available',()=>{
 const {context,render}=setup();for(const gun of [null,{id:'a',needsDetails:true}]){context.activeGun=gun;render();expect(document.querySelector('#noiseFilter')).toBeDisabled();expect(document.querySelector('#autoGainControl')).toBeDisabled();expect(document.querySelector('#appearance')).not.toBeDisabled();}
});
test('capture/profile/preference locks and rejected vibration retain their separate scopes',()=>{
 const {context,render}=setup();context.profileLocked=()=>true;context.busy=true;render();for(const id of ['noiseFilter','autoGainControl','appearance','vibrationFeedback'])expect(document.querySelector('#'+id)).toBeDisabled();
 context.profileLocked=()=>false;context.busy=false;context.profileLoading=true;render();expect(document.querySelector('#appearance')).toBeDisabled();context.profileLoading=false;context.preferencePending=true;render();expect(document.querySelector('#appearance')).toBeDisabled();
 context.preferencePending=false;context.vibrationRejected=true;render();expect(document.querySelector('#vibrationFeedback')).toBeDisabled();expect(document.querySelector('#vibrationStatus')).toHaveTextContent('browser declined vibration');context.vibrationRejected=false;context.vibrationFeedback=false;render();expect(document.querySelector('#vibrationStatus')).toHaveTextContent('Off · requests vibration');
});

test('mounted Settings receives the preference model without competing native writes',()=>{
 const {context,render}=setup();context.settingsPage={update:jest.fn()};render();expect(context.settingsPage.update).toHaveBeenCalledWith({preferences:preferencePresentation({capabilities:context.getAudioCapabilities(),audioPreferences:context.audioPreferences,processingReport:null,appearance:'light',gunAvailable:true,locked:false,deviceLocked:false,vibrationFeedback:true,vibrationSupported:true,vibrationRejected:false})});expect(document.querySelector('#noiseFilterStatus')).toHaveTextContent('Checking browser support');
});
