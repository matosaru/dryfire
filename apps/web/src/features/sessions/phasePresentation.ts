import type {PracticeRepetition,SequenceRepetition} from './resultPresentation';
import {formatLocaleDate,formatLocaleNumber,translate} from '../../localization/runtime.ts';
const tr=(key:string,parameters:Record<string,string|number>={})=>translate('common',`sessionUi.${key}`,parameters);
const seconds=(value:number|null|undefined)=>Number.isFinite(value)?`${formatLocaleNumber(value!/1000,{minimumFractionDigits:2,maximumFractionDigits:2})} s`:'—';
export type ClassToggle={id:string;token:string;enabled:boolean};
type Config={repetitions:number};
type State<Row>={phase:string;completed:number;remaining:number|null;revision:number;config:Config;repetitions:Row[];countdownEndsAtMs:number|null};
type PracticeState=State<PracticeRepetition>&{shots:number};
type SequenceState=State<SequenceRepetition>&{drillSteps:string[];current:{stepIndex:number}|null};
/** Pure view calculations. Clocks/config/domain statistics are supplied by the controller boundary. */
export function practiceRunPresentation({state,mode,pending,clock,microphone,readConfig,elapsed,continuous,interruption,closing,saving,inputFeedback}:{state:PracticeState|null;mode:string;pending:boolean;clock:()=>number;microphone:boolean;readConfig:()=>Config;elapsed:number;continuous:boolean;interruption:boolean;closing:boolean;saving:boolean;inputFeedback:string}){
 const phase=pending?'connecting':state?.phase;
 const showInput=['countdown','active','await-cue'].includes(phase??''),showStop=showInput||phase==='countdown';
 const remaining=state?.remaining??readConfig().repetitions;
 const signal=phase==='countdown'?String(Math.max(0,Math.ceil((state!.countdownEndsAtMs!-clock())/1000))):({connecting:'…','await-cue':'WAIT',result:'NEXT',paused:'PAUSED',closing:'TIME'} as Record<string,string>)[phase??'']||'—';
 const countdownText=phase==='countdown'?tr('practiceCountdown',{seconds:formatLocaleNumber(Math.max(0,(state!.countdownEndsAtMs!-clock())/1000),{minimumFractionDigits:1,maximumFractionDigits:1})}):'';
 const announcements:Record<string,string>={connecting:tr('practiceConnecting'),countdown:countdownText,active:tr('practiceActive'), 'await-cue':tr('practiceAwaitCue'),result:mode==='single'?(state?.repetitions.at(-1)?.reason==='early'?tr('practiceEarlyResult'):tr('practiceClickResult')):tr('practiceNextResult'),paused:tr('practicePaused'),closing:tr('practiceClosing')};
 const classes:ClassToggle[]=[{id:'practiceStopBtn',token:'hidden',enabled:!showStop},{id:'practiceLevelPanel',token:'hidden',enabled:!showInput},{id:'practiceSignal',token:'hidden',enabled:phase==='active'||phase==='await-cue'},{id:'practiceSignal',token:'is-paused',enabled:phase==='paused'},{id:'practicePauseBtn',token:'hidden',enabled:phase==='paused'},{id:'practiceResumeBtn',token:'hidden',enabled:phase!=='paused'},{id:'practiceNextBtn',token:'hidden',enabled:phase!=='result'||mode==='single'},{id:'practiceEndBtn',token:'hidden',enabled:showStop}];
 const blocked=pending||saving||interruption;
 return{phase:phase||'idle',classes,texts:{practiceCompletedLabel:continuous?tr('clicks'):tr('attempts'),practiceCompleted:formatLocaleNumber(state?.completed??0),practiceShots:formatLocaleNumber(state?.shots??0),practiceRemainingLabel:tr('left'),practiceRemaining:formatLocaleNumber(remaining),practiceElapsed:seconds(elapsed),practiceSignal:signal,practiceAnnouncement:announcements[phase??'']||'',practiceMicrophone:microphone?`● ${tr('microphoneConnected')}`:tr('microphoneInactive'),practiceInputFeedback:inputFeedback},disabled:{practiceStopBtn:interruption||closing,practicePauseBtn:blocked,practiceResumeBtn:blocked,practiceNextBtn:blocked,practiceEndBtn:interruption||closing},latest:state?.repetitions.filter(row=>row.status!=='partial').at(-1)};
}
export function sequenceRunPresentation({state,pending,clock,microphone,readConfig,savedRevision,titleFor}:{state:SequenceState|null;pending:boolean;clock:()=>number;microphone:boolean;readConfig:()=>Config;savedRevision:number|null;titleFor:(label:string)=>string}){
 const config=state?.config||readConfig();
 const classes:ClassToggle[]=[{id:'sessionCountdown',token:'is-go',enabled:state?.phase==='active'&&!pending},{id:'sessionCountdown',token:'is-paused',enabled:state?.phase==='paused'},{id:'sessionCountdown',token:'is-connecting',enabled:pending},{id:'sessionMicrophoneStatus',token:'is-live',enabled:microphone},{id:'pauseSessionBtn',token:'hidden',enabled:state?.phase==='paused'},{id:'resumeSessionBtn',token:'hidden',enabled:state?.phase!=='paused'}];
 let countdown:string,announcement:string;
 if(pending){countdown=tr('connecting');announcement=tr('sequenceConnecting');}
 else if(state!.phase==='countdown'){const remaining=Math.max(0,state!.countdownEndsAtMs!-clock());countdown=formatLocaleNumber(remaining/1000,{minimumFractionDigits:1,maximumFractionDigits:1});announcement=tr('sequenceCountdown',{count:formatLocaleNumber(Math.ceil(remaining/1000))});}
 else if(state!.phase==='active'){countdown='GO';announcement=tr('sequenceActive',{step:titleFor(state!.drillSteps[state!.current!.stepIndex])});}
 else if(state!.phase==='paused'){countdown=tr('paused');announcement=tr('sequencePaused');}
 else{const durable=savedRevision===state!.revision;countdown=durable?tr('saved'):tr('saving');announcement=durable?tr('sequenceSaved'):tr('sequenceSaving');}
 return{classes,texts:{sessionCompletedCount:String(state?.completed??0),sessionLeftCount:String(state?.remaining??config.repetitions),sessionCountdown:countdown,sessionMicrophoneStatus:microphone?`● ${tr('microphoneActive')}`:pending?tr('microphoneConnecting'):tr('microphoneInactive')},progress:{max:config.repetitions,value:state?.completed??0},disabled:{pauseSessionBtn:pending||!state||state.completed===config.repetitions,resumeSessionBtn:pending,endSessionBtn:false},announcement,latest:state?.repetitions.filter(row=>row.status==='completed').at(-1)};
}
type Paragraph={text:string;className:string};
type ReviewContext={state:{revision:number}|null;savedRevision:number|null;saveError:boolean;saving:boolean;locked:boolean;gunId:string|undefined};
type PracticeRecord={status:string;shots:number;gunId:string;gunName:string;elapsedMs:number;startedAt:number;practiceMode:string;config:{startSource?:string;soundAtStart:boolean;parSeconds:number};repetitions:(PracticeRepetition&{goAt:number|null})[]};
type PracticeStats={hits:number;misses:number;intervalMeanMs:number|null;intervalMinMs:number|null;intervalMaxMs:number|null;intervalSpreadMs:number|null};
export function practiceReviewPresentation(record:PracticeRecord,{state,savedRevision,saveError,saving,locked,gunId,interruption,continuous,stats}:ReviewContext&{interruption:boolean;continuous:boolean;stats:PracticeStats}){
 const started=record.repetitions.some(row=>row.goAt!==null);
 const summary:Paragraph[]=[{text:tr('acceptedShots',{count:record.shots}),className:'session-summary-count'},{text:tr('recognizedAttempts',{hits:formatLocaleNumber(stats.hits),misses:formatLocaleNumber(stats.misses)}),className:'muted small'},{text:tr('gunActiveTime',{gun:record.gunName,time:seconds(record.elapsedMs)}),className:'muted small'},{text:tr('startedTiming',{date:formatLocaleDate(record.startedAt,{year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit'}),timing:!started?tr('noGoSignal'):record.config.startSource==='external'?tr('externalCueTiming'):tr('scheduledGoTiming')}),className:'muted small'}];
 if(continuous&&stats.intervalMeanMs!==null)summary.push({text:tr('clickIntervals',{mean:seconds(stats.intervalMeanMs),min:seconds(stats.intervalMinMs),max:seconds(stats.intervalMaxMs),spread:seconds(stats.intervalSpreadMs)}),className:'muted small'});
 if(record.practiceMode==='par')summary.push({text:tr('parTiming',{seconds:record.config.parSeconds.toFixed(1)}),className:'muted small'});
 if(record.config.startSource==='app'&&record.config.soundAtStart&&started)summary.push({text:tr('beepTimingNote'),className:'muted small'});
 const status=tr(record.status==='completed'?'statusCompleted':'statusEnded');
 return{status:record.status,title:tr('practiceTitle',{status}),summary,savedNote:saveError?tr('practiceSaveError'):state&&savedRevision!==state.revision?tr('savingDevice'):tr('savedDevice'),retryHidden:!saveError,retryDisabled:saving||interruption,repeatDisabled:locked||record.gunId!==gunId,results:record.repetitions};
}
type SequenceRecord={status:string;completed:number;remaining:number;gunId:string;gunName:string;startedAt:number;config:{repetitions:number};repetitions:SequenceRepetition[]};
export function sequenceReviewPresentation(record:SequenceRecord,{state,savedRevision,saveError,saving,locked,gunId,pending}:ReviewContext&{pending:boolean}){
 const durable=!state||savedRevision===state.revision;
 const status=tr(record.status==='completed'?'statusCompleted':'statusEnded');
 const summary:Paragraph[]=[{text:`${formatLocaleNumber(record.completed)} / ${formatLocaleNumber(record.config.repetitions)}`,className:'session-summary-count'},{text:tr('sequenceCompletion',{completed:formatLocaleNumber(record.completed),left:formatLocaleNumber(record.remaining)}),className:'muted small'},{text:tr('gunSessionDate',{gun:record.gunName,date:formatLocaleDate(record.startedAt,{year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit'})}),className:'muted small'}];
 return{status:record.status,title:record.status==='completed'?tr('sessionCompletedTitle'):tr('sessionTitle',{status}),summary,savedNote:saveError?tr('sequenceSaveError'):durable?tr('savedDevice'):tr('savingSessionResults'),retryHidden:!saveError,retryDisabled:saving||pending,repeatDisabled:locked||saveError||gunId!==record.gunId,results:record.repetitions};
}
