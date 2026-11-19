import {translate} from '../../localization/runtime.ts';
type AudioKey='noiseFilter'|'autoGain';
export type PreferencePresentationInput={
 capabilities:Record<AudioKey,boolean>;audioPreferences:Record<AudioKey,boolean>;
 processingReport?:Partial<Record<AudioKey,{status:string;applied?:boolean;requested?:boolean}>>|null;
 appearance:string;measurementSystem:string;gunAvailable:boolean;locked:boolean;deviceLocked:boolean;
 vibrationFeedback:boolean;vibrationSupported:boolean;vibrationRejected:boolean;language:'en'|'de'|'nl';
};
/** Pure, shared Settings presentation; platform capabilities and persistence remain injected. */
export function preferencePresentation(input:PreferencePresentationInput){
 const audio=([['noiseFilter','noiseFilter','noiseFilterStatus'],['autoGain','autoGainControl','autoGainStatus']] as const).map(([key,inputId,statusId])=>{
  const report=input.processingReport?.[key];
  return{inputId,statusId,checked:input.audioPreferences[key],disabled:!input.gunAvailable||input.locked||!input.capabilities[key],
   status:!input.capabilities[key]?translate('settings','audioStatus.unsupported')
    :report?.status==='confirmed'?translate('settings','audioStatus.confirmed',{setting:translate('settings',report.applied?'setting.on':'setting.off')})
    :report?.status==='not-applied'?translate('settings','audioStatus.notApplied',{setting:translate('settings',report.requested?'setting.on':'setting.off')})
    :report?.status==='unconfirmed'?translate('settings','audioStatus.unconfirmed')
    :translate('settings','audioStatus.saved',{setting:translate('settings',input.audioPreferences[key]?'setting.on':'setting.off')})};
 });
 return{audio,appearance:{value:input.appearance,disabled:input.deviceLocked},measurementSystem:{value:input.measurementSystem,disabled:input.deviceLocked},language:{value:input.language,disabled:input.deviceLocked},
  vibration:{checked:input.vibrationFeedback,disabled:!input.vibrationSupported||input.vibrationRejected||input.locked,
   status:!input.vibrationSupported?translate('settings','vibrationStatus.unsupported')
    :input.vibrationRejected?translate('settings','vibrationStatus.rejected')
    :translate('settings','vibrationStatus.active',{setting:translate('settings',input.vibrationFeedback?'setting.on':'setting.off')})}};
}
