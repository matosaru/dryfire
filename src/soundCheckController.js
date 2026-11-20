import {createSoundCheck,beginSoundCheckAttempt,recordSoundCheckDetection,finishSoundCheckAttempt,buildSoundCheckReport,soundCheckSummary} from './soundCheck.js';
import {recognizeRecording} from './recognition.js';
import {recognizeRecordingV3} from './recognitionV3.js';
import {recognitionOptions} from './calibration.js';
import {analyzeRecording} from './audio.js';
import {extractSpectralFeatures} from './spectralFeatures.js';
import {translate} from '../apps/web/src/localization/runtime.ts';
import {translateAudioStatus} from './localizedAudioStatus.js';

const soundKeys={trigger:'trigger',other:'other',rack:'rack',reload:'reload',draw:'draw'};
export function createSoundCheckController({doc=document,startContinuousListening,examples,calibration,enabledLabels,audioPreferences,onError,download,startGuard=action=>action()}){
 const $=id=>doc.getElementById(id),setup=$('soundCheckSetup'),run=$('soundCheckRun'),review=$('soundCheckReview');
 let check,session,timer,disposed=false,ready=false,starting=false,startAbort=null,operation=0;
 const show=(node,visible)=>node.classList.toggle('hidden',!visible);
 let statusMessage={key:'status.ready',parameters:{},audioStatus:null};
 const say=(key,parameters={})=>{statusMessage={key,parameters,audioStatus:null};$('soundCheckStatus').textContent=translate('sound-check',key,parameters);};
 const soundTitle=label=>translate('sound-check',`sound.${soundKeys[label]??'other'}`);
 const refreshStatus=()=>{$('soundCheckStatus').textContent=statusMessage.audioStatus===null?translate('sound-check',statusMessage.key,statusMessage.parameters):translateAudioStatus(statusMessage.audioStatus);};
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
 function reset(){void stop();check=null;show(setup,true);show(run,false);show(review,false);$('soundCheckAttemptBtn').disabled=true;say('status.ready');}
 function renderProgress(){const completed=check?.attempts.length??0;$('soundCheckProgress').textContent=`${completed} / ${check?.targetAttempts??10}`;const actual=$('soundCheckRunActual').value;$('soundCheckExpected').textContent=soundTitle(actual);}
 function renderReview(){const summary=soundCheckSummary(check),v2=summary.v2,v3=summary.v3;$('soundCheckMatched').textContent=String(v2.matchedTriggers);$('soundCheckMissed').textContent=String(v2.misses);$('soundCheckFalse').textContent=String(v2.falseShots);$('soundCheckDuplicates').textContent=String(v2.duplicates);const candidate=examples.filter(row=>row.spectralFeatureVersion===3&&row.spectralFeatures?.length===23).length>=3;$('soundCheckCandidate').textContent=candidate?translate('sound-check','review.candidateComparison',{matched:v3.matchedTriggers,missed:v3.misses,falseShots:v3.falseShots,duplicates:v3.duplicates}):translate('sound-check','review.candidateNeedsSamples');show(run,false);show(review,true);}
 async function completeAttempt(){if(!check?.active)return;session.disarmDetection();check=finishSoundCheckAttempt(check,{actualLabel:$('soundCheckRunActual').value,endedAt:session.nowMs()});renderProgress();if(check.attempts.length>=check.targetAttempts){await stop();renderReview();return;}say('status.attemptSaved');$('soundCheckAttemptBtn').disabled=false;}
 async function start(){
  if(starting||session||disposed)return;
  const token=++operation;starting=true;startAbort=new AbortController();updateStartControl();
  try{
   const count=Number($('soundCheckAttempts').value);
   check=createSoundCheck({attempts:count,metadata:{room:$('soundCheckRoom').value,distance:$('soundCheckDistance').value}});
   $('soundCheckRunActual').value=$('soundCheckActual').value;show(setup,false);show(review,false);show(run,true);renderProgress();say('status.preparing');
   const acquired=await startContinuousListening({detectionEnabled:false,audioPreferences,signal:startAbort.signal,
    onState:text=>{if(token===operation&&!ready){statusMessage={audioStatus:text};refreshStatus();}},
    onLevel:level=>{if(token!==operation)return;const fill=$('soundCheckLevel');fill.style.width=`${level}%`;fill.parentElement.setAttribute('aria-valuenow',String(level));},
    onEvent:(pcm,sampleRate)=>{if(token!==operation||!check?.active)return;let v2=null,v3=null,features={};try{const options=recognitionOptions(calibration,enabledLabels),analysis=analyzeRecording(pcm,sampleRate);features={v2:analysis.features,v3:extractSpectralFeatures(pcm,sampleRate)};v2=recognizeRecording(examples,pcm,sampleRate,options);v3=recognizeRecordingV3(examples,pcm,sampleRate,options);}catch(error){say('status.analysisFailed',{message:error.message});}check=recordSoundCheckDetection(check,v2,v3,session?.nowMs(),features);},
    onError:error=>{if(token!==operation)return;void stop().then(()=>reset());onError(error);},
   });
   if(token!==operation||disposed){await acquired.stop();return;}
   session=acquired;updateStartControl();
   await session.waitForInput();
   if(token!==operation||disposed)return;
   ready=true;say('status.readyForAttempt');$('soundCheckAttemptBtn').disabled=false;
  }catch(error){
   if(token===operation){await stop();reset();if(error?.name!=='AbortError')onError(error);}
  }finally{
   if(token===operation){starting=false;startAbort=null;updateStartControl();}
  }
 }
 function begin(){if(!session||!ready||check?.active)return;check=beginSoundCheckAttempt(check,session.nowMs());session.armDetection();$('soundCheckAttemptBtn').disabled=true;say('status.listening',{sound:soundTitle($('soundCheckRunActual').value).toLowerCase()});timer=setTimeout(()=>{void completeAttempt();},2000);}
 function exportReport(){try{const report=buildSoundCheckReport(check,{userAgent:globalThis.navigator?.userAgent??'unknown'});const json=JSON.stringify(report,null,2);if(download)download(json);else{const url=URL.createObjectURL(new Blob([json],{type:'application/json'})),link=doc.createElement('a');link.href=url;link.download=`dryfire-sound-check-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url);}}catch(error){onError(error);}}
 const listeners=[[ $('soundCheckStartBtn'),'click',()=>{if(starting||session)return;startGuard(()=>{void start();});}],[ $('soundCheckAttemptBtn'),'click',begin],[ $('soundCheckStopBtn'),'click',reset],[ $('soundCheckAgainBtn'),'click',reset],[ $('soundCheckExportBtn'),'click',exportReport],[ $('soundCheckRunActual'),'change',renderProgress]];
 for(const[node,event,handler]of listeners)node?.addEventListener(event,handler);
 $('soundCheckStartBtn').disabled=false;$('soundCheckSetupHint').textContent=translate('sound-check','status.ready');
 return{locked(){return starting||!!session;},stop,updateLocale(){renderProgress();refreshStatus();if(!session&&!starting)$('soundCheckSetupHint').textContent=translate('sound-check','status.ready');if(check&&review&&!review.classList.contains('hidden'))renderReview();},dispose(){if(disposed)return;disposed=true;void stop();for(const[node,event,handler]of listeners)node?.removeEventListener(event,handler);}};
}
