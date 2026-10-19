import {preferencePresentation,type PreferencePresentationInput} from './preferencePresentation.ts';
const input=():PreferencePresentationInput=>({capabilities:{noiseFilter:true,autoGain:true},audioPreferences:{noiseFilter:true,autoGain:false},appearance:'system',gunAvailable:true,locked:false,deviceLocked:false,vibrationFeedback:false,vibrationSupported:true,vibrationRejected:false});
test('current saved switch state remains independent of the last track result',()=>{
 const state=input();state.processingReport={noiseFilter:{status:'confirmed',applied:false}};
 const view=preferencePresentation(state);expect(view.audio[0].checked).toBe(true);expect(view.audio[0].status).toBe('Last capture: Off, confirmed by the audio track.');expect(view.appearance.value).toBe('system');
});
test('presentation snapshots preferences without mutating or retaining mutable setting fields',()=>{
 const state=input();Object.freeze(state.capabilities);const original={...state.audioPreferences};const view=preferencePresentation(state);
 expect(state.audioPreferences).toEqual(original);state.audioPreferences.noiseFilter=false;state.appearance='dark';expect(view.audio[0].checked).toBe(true);expect(view.audio[0].status).toBe('Saved On · applies to the next capture.');expect(view.appearance.value).toBe('system');
});
