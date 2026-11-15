import {createSoundCheck,beginSoundCheckAttempt,recordSoundCheckDetection,finishSoundCheckAttempt,buildSoundCheckReport,soundCheckSummary} from './soundCheck.js';
import {recognizeRecording} from './recognition.js';
import {recognizeRecordingV3} from './recognitionV3.js';
import {recognitionOptions} from './calibration.js';
import {analyzeRecording} from './audio.js';
import {extractSpectralFeatures} from './spectralFeatures.js';

const title={trigger:'Trigger pull',other:'Other / background sound',rack:'Rack slide',reload:'Change magazine',draw:'Draw from holster'};
export function createSoundCheckController({doc=document,startContinuousListening,examples,calibration,enabledLabels,audioPreferences,onError,download,startGuard=action=>action()}){
 const $=id=>doc.getElementById(id),setup=$('soundCheckSetup'),run=$('soundCheckRun'),review=$('soundCheckReview');
 let check,session,timer,disposed=false,ready=false,starting=false,startAbort=null,operation=0;
 const show=(node,visible)=>node.classList.toggle('hidden',!visible);
 const status=text=>{$('soundCheckStatus').textContent=text;};
 function updateStartControl(){
  const button=$('soundCheckStartBtn');
  if(button)button.disabled=starting||!!session||disposed;
 }
 async function stop(){
  operation++;
  clearTimeout(timer);timer=null;
  const abort=startAbort;startAbort=null;starting=false;abort?.abort();
  const active=session;session=null;ready=false;updateStartControl();
  if(active)await active.stop();
 }
 function reset(){void stop();check=null;show(setup,true);show(run,false);show(review,false);$('soundCheckAttemptBtn').disabled=true;status('Ready to start. Safety confirmation and microphone permission follow.');}
 function renderProgress(){const completed=check?.attempts.length??0;$('soundCheckProgress').textContent=`${completed} / ${check?.targetAttempts??10}`;const actual=$('soundCheckRunActual').value;$('soundCheckExpected').textContent=title[actual];}
 function renderReview(){const summary=soundCheckSummary(check),v2=summary.v2,v3=summary.v3;$('soundCheckMatched').textContent=String(v2.matchedTriggers);$('soundCheckMissed').textContent=String(v2.misses);$('soundCheckFalse').textContent=String(v2.falseShots);$('soundCheckDuplicates').textContent=String(v2.duplicates);const candidate=examples.filter(row=>row.spectralFeatureVersion===3&&row.spectralFeatures?.length===23).length>=3;$('soundCheckCandidate').textContent=candidate?`Candidate comparison: ${v3.matchedTriggers} matched, ${v3.misses} missed, ${v3.falseShots} false and ${v3.duplicates} duplicate.`:'Candidate comparison needs at least three newly recorded spectral trigger samples.';show(run,false);show(review,true);}
 async function completeAttempt(){if(!check?.active)return;session.disarmDetection();check=finishSoundCheckAttempt(check,{actualLabel:$('soundCheckRunActual').value,endedAt:session.nowMs()});renderProgress();if(check.attempts.length>=check.targetAttempts){await stop();renderReview();return;}status('Attempt saved. Choose the next sound, then begin.');$('soundCheckAttemptBtn').disabled=false;}
 async function start(){
  if(starting||session||disposed)return;
  const token=++operation;starting=true;startAbort=new AbortController();updateStartControl();
  try{
   const count=Number($('soundCheckAttempts').value);
   check=createSoundCheck({attempts:count,metadata:{room:$('soundCheckRoom').value,distance:$('soundCheckDistance').value}});
   $('soundCheckRunActual').value=$('soundCheckActual').value;show(setup,false);show(review,false);show(run,true);renderProgress();status('Preparing microphone…');
   const acquired=await startContinuousListening({detectionEnabled:false,audioPreferences,signal:startAbort.signal,
    onState:text=>{if(token===operation&&!ready)status(text);},
    onLevel:level=>{if(token!==operation)return;const fill=$('soundCheckLevel');fill.style.width=`${level}%`;fill.parentElement.setAttribute('aria-valuenow',String(level));},
    onEvent:(pcm,sampleRate)=>{if(token!==operation||!check?.active)return;let v2=null,v3=null,features={};try{const options=recognitionOptions(calibration,enabledLabels),analysis=analyzeRecording(pcm,sampleRate);features={v2:analysis.features,v3:extractSpectralFeatures(pcm,sampleRate)};v2=recognizeRecording(examples,pcm,sampleRate,options);v3=recognizeRecordingV3(examples,pcm,sampleRate,options);}catch(error){status(`Sound detected but could not be analyzed: ${error.message}`);}check=recordSoundCheckDetection(check,v2,v3,session?.nowMs(),features);},
    onError:error=>{if(token!==operation)return;void stop().then(()=>reset());onError(error);},
   });
   if(token!==operation||disposed){await acquired.stop();return;}
   session=acquired;updateStartControl();
   await session.waitForInput();
   if(token!==operation||disposed)return;
   ready=true;status('Microphone ready. Begin when you are prepared.');$('soundCheckAttemptBtn').disabled=false;
  }catch(error){
   if(token===operation){await stop();reset();if(error?.name!=='AbortError')onError(error);}
  }finally{
   if(token===operation){starting=false;startAbort=null;updateStartControl();}
  }
 }
 function begin(){if(!session||!ready||check?.active)return;check=beginSoundCheckAttempt(check,session.nowMs());session.armDetection();$('soundCheckAttemptBtn').disabled=true;status(`Listening for one ${title[$('soundCheckRunActual').value].toLowerCase()}…`);timer=setTimeout(()=>{void completeAttempt();},2000);}
 function exportReport(){try{const report=buildSoundCheckReport(check,{userAgent:globalThis.navigator?.userAgent??'unknown'});const json=JSON.stringify(report,null,2);if(download)download(json);else{const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),link=doc.createElement('a');link.href=url;link.download=`dryfire-sound-check-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url);}}catch(error){onError(error);}}
 const listeners=[[ $('soundCheckStartBtn'),'click',()=>{if(starting||session)return;startGuard(()=>{void start();});}],[ $('soundCheckAttemptBtn'),'click',begin],[ $('soundCheckStopBtn'),'click',reset],[ $('soundCheckAgainBtn'),'click',reset],[ $('soundCheckExportBtn'),'click',exportReport],[ $('soundCheckRunActual'),'change',renderProgress]];
 for(const[node,event,handler]of listeners)node?.addEventListener(event,handler);
 $('soundCheckStartBtn').disabled=false;$('soundCheckSetupHint').textContent='Ready to start. Safety confirmation and microphone permission follow.';
 return{locked(){return starting||!!session;},stop,dispose(){if(disposed)return;disposed=true;void stop();for(const[node,event,handler]of listeners)node?.removeEventListener(event,handler);}};
}
