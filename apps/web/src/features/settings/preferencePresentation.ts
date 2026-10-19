type AudioKey='noiseFilter'|'autoGain';
export type PreferencePresentationInput={
 capabilities:Record<AudioKey,boolean>;audioPreferences:Record<AudioKey,boolean>;
 processingReport?:Partial<Record<AudioKey,{status:string;applied?:boolean;requested?:boolean}>>|null;
 appearance:string;gunAvailable:boolean;locked:boolean;deviceLocked:boolean;
 vibrationFeedback:boolean;vibrationSupported:boolean;vibrationRejected:boolean;
};
/** Pure, shared Settings presentation; platform capabilities and persistence remain injected. */
export function preferencePresentation(input:PreferencePresentationInput){
 const audio=([['noiseFilter','noiseFilter','noiseFilterStatus'],['autoGain','autoGainControl','autoGainStatus']] as const).map(([key,inputId,statusId])=>{
  const report=input.processingReport?.[key];
  return{inputId,statusId,checked:input.audioPreferences[key],disabled:!input.gunAvailable||input.locked||!input.capabilities[key],
   status:!input.capabilities[key]?'Unsupported by this browser. Recording remains available.'
    :report?.status==='confirmed'?`Last capture: ${report.applied?'On':'Off'}, confirmed by the audio track.`
    :report?.status==='not-applied'?`The last audio track did not apply the requested ${report.requested?'On':'Off'} setting.`
    :report?.status==='unconfirmed'?'The browser did not confirm this setting on the last audio track.'
    :`Saved ${input.audioPreferences[key]?'On':'Off'} · applies to the next capture.`};
 });
 return{audio,appearance:{value:input.appearance,disabled:input.deviceLocked},
  vibration:{checked:input.vibrationFeedback,disabled:!input.vibrationSupported||input.vibrationRejected||input.locked,
   status:!input.vibrationSupported?'Vibration is unavailable in this browser.'
    :input.vibrationRejected?'The browser declined vibration. Visual feedback remains available.'
    :`${input.vibrationFeedback?'On':'Off'} · requests vibration at GO and repetition completion. Device output is not verified.`}};
}
