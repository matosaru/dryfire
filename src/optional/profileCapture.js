import{extractSpectralFeatures}from'../spectralFeatures.js';
import{translate}from'../../apps/web/src/localization/runtime.ts';

/** Feature-v3 capture stays outside Home and loads only for Learn actions. */
export async function recordProfileFeature(recordFeatureVector,setStatus,audioPreferences,onProcessing){
 let spectralFeatures;
 const features=await recordFeatureVector(setStatus,{audioPreferences,onProcessing,onAnalysis:value=>{spectralFeatures=value?.spectralFeatures;},featureExtractor:extractSpectralFeatures});
 return{features,spectralFeatures};
}

/** Learn-only explicit replacement flow. */
export async function replaceSoundProfile(label,locked,labels,confirm,titleFor,ownerId,capture,record,replace,load,onExamples,setStatus,setMessage){
 if(locked||!labels.includes(label)||!confirm(translate('common','runtimeMain.replaceSamplesConfirm',{sound:titleFor(label)})))return;
 const gunId=ownerId();
 await capture(async()=>{
  const sample=await record();
  await replace(label,sample.features,gunId,{spectralFeatures:sample.spectralFeatures});
  onExamples(await load(gunId));
  setStatus(translate('common','runtimeMain.soundProfileReplaced',{sound:titleFor(label)}));
  setMessage(translate('common','runtimeMain.samplesReplaceSuccess',{sound:titleFor(label)}));
 });
}
