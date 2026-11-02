import {ACTUAL_CLASSES} from './evaluation.js';

const countFor=(attempt,key)=>attempt.detections.filter(row=>row[key]?.label==='trigger').length;
const summaryFor=(attempts,key)=>attempts.reduce((summary,attempt)=>{
 const triggers=countFor(attempt,key);
 if(attempt.actualLabel==='trigger'){
  summary.expectedTriggers+=1;
  if(triggers)summary.matchedTriggers+=1;else summary.misses+=1;
  summary.duplicates+=Math.max(0,triggers-1);
 }else summary.falseShots+=triggers;
 return summary;
},{expectedTriggers:0,matchedTriggers:0,misses:0,falseShots:0,duplicates:0});

export function createSoundCheck({attempts=10,metadata={}}={}){
 if(!Number.isInteger(attempts)||attempts<1||attempts>50)throw new RangeError('Sound check attempts must be a whole number from 1 to 50.');
 return Object.freeze({targetAttempts:attempts,metadata:{...metadata},attempts:Object.freeze([]),pending:Object.freeze([])});
}

const featureVector=(version,values,length)=>Array.isArray(values)&&values.length===length&&values.every(Number.isFinite)?Object.freeze({version,values:Object.freeze([...values])}):null;

export function recordSoundCheckDetection(check,v2,v3,detectedAt=Date.now(),features={}){
 if(!check?.active)return check;
 const row=Object.freeze({detectedAt:Number(detectedAt)||0,v2:v2?{label:v2.label??null,score:Number(v2.score)||0}:null,v3:v3?{label:v3.label??null,score:Number(v3.score)||0}:null,
  features:Object.freeze({v2:featureVector(2,features.v2,15),v3:featureVector(3,features.v3,23)})});
 return Object.freeze({...check,pending:Object.freeze([...check.pending,row])});
}

export function beginSoundCheckAttempt(check,startedAt=Date.now()){
 if(!check||check.active||check.attempts.length>=check.targetAttempts)throw new Error('Sound check is not ready for another attempt.');
 return Object.freeze({...check,active:Object.freeze({startedAt:Number(startedAt)||0}),pending:Object.freeze([])});
}

export function finishSoundCheckAttempt(check,{actualLabel,startedAt=check?.active?.startedAt??0,endedAt=Date.now()}={}){
 if(!ACTUAL_CLASSES.includes(actualLabel))throw new TypeError('Choose a supported actual sound.');
 const attempt=Object.freeze({number:check.attempts.length+1,actualLabel,startedAt:Number(startedAt)||0,endedAt:Number(endedAt)||0,detections:check.pending});
 return Object.freeze({...check,active:null,pending:Object.freeze([]),attempts:Object.freeze([...check.attempts,attempt])});
}

export function soundCheckSummary(check){return{v2:summaryFor(check.attempts,'v2'),v3:summaryFor(check.attempts,'v3')};}

export function buildSoundCheckReport(check,metadata={}){
 if(!check||check.active||check.attempts.length!==check.targetAttempts)throw new Error('Complete every sound check attempt before exporting.');
 return{format:'dryfire-sound-check',version:1,createdAt:new Date().toISOString(),targetAttempts:check.targetAttempts,
  metadata:{...check.metadata,...metadata},summary:soundCheckSummary(check),attempts:check.attempts.map(attempt=>({...attempt,detections:attempt.detections.map(row=>({...row}))}))};
}
