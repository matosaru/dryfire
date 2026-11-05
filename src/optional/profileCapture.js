import{extractSpectralFeatures}from'../spectralFeatures.js';

/** Feature-v3 capture stays outside Home and loads only for Learn actions. */
export async function recordProfileFeature(recordFeatureVector,setStatus,audioPreferences,onProcessing){
 let spectralFeatures;
 const features=await recordFeatureVector(setStatus,{audioPreferences,onProcessing,onAnalysis:value=>{spectralFeatures=value?.spectralFeatures;},featureExtractor:extractSpectralFeatures});
 return{features,spectralFeatures};
}

/** Learn-only explicit replacement flow. */
export async function replaceSoundProfile(label,locked,labels,confirm,titleFor,ownerId,capture,record,replace,load,onExamples,setStatus,setMessage){
 if(locked||!labels.includes(label)||!confirm(`Record one new ${titleFor(label)} sample, then replace all existing ${titleFor(label)} samples for this gun? Other sounds and history stay saved.`))return;
 const gunId=ownerId();
 await capture(async()=>{
  const sample=await record();
  await replace(label,sample.features,gunId,{spectralFeatures:sample.spectralFeatures});
  onExamples(await load(gunId));
  setStatus(`${titleFor(label)} profile replaced`);
  setMessage(`Existing ${titleFor(label)} samples were replaced only after the new capture succeeded.`);
 });
}
