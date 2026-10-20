import {sessionSeconds as seconds,type PracticeRepetition,type SequenceRepetition} from './resultPresentation';
export type ClassToggle={id:string;token:string;enabled:boolean};
type Config={repetitions:number;durationSeconds?:number};
type State<Row>={phase:string;completed:number;remaining:number|null;revision:number;config:Config;repetitions:Row[];countdownEndsAtMs:number|null};
type PracticeState=State<PracticeRepetition>&{shots:number};
type SequenceState=State<SequenceRepetition>&{drillSteps:string[];current:{stepIndex:number}|null};
/** Pure view calculations. Clocks/config/domain statistics are supplied by the controller boundary. */
export function practiceRunPresentation({state,mode,pending,clock,microphone,readConfig,elapsed,continuous,interruption,closing,saving,inputFeedback}:{state:PracticeState|null;mode:string;pending:boolean;clock:()=>number;microphone:boolean;readConfig:()=>Config;elapsed:number;continuous:boolean;interruption:boolean;closing:boolean;saving:boolean;inputFeedback:string}){
 const free=mode==='free',phase=pending?'connecting':state?.phase;
 const showInput=['countdown','active','await-cue'].includes(phase??''),showStop=showInput||phase==='countdown';
 const remaining=free?Math.ceil(Math.max(0,(state?.config.durationSeconds??60)-elapsed/1000)):state?.remaining??readConfig().repetitions;
 const signal=phase==='countdown'?String(Math.max(0,Math.ceil((state!.countdownEndsAtMs!-clock())/1000))):({connecting:'…','await-cue':'WAIT',result:'NEXT',paused:'PAUSED',closing:'TIME'} as Record<string,string>)[phase??'']||'—';
 const countdownText=phase==='countdown'?`Next signal in ${Math.max(0,(state!.countdownEndsAtMs!-clock())/1000).toFixed(1)} s. Get ready.`:'';
 const announcements:Record<string,string>={connecting:'Preparing microphone. Waiting for audio input before countdown…',countdown:countdownText,active:mode==='reload'?'Practice started. Follow the selected events in order.':'Practice started. Listening for trigger clicks.','await-cue':'Listening for your calibrated external beep.',result:mode==='single'?(state?.repetitions.at(-1)?.reason==='early'?'Early trigger saved as a miss. Preparing the next signal automatically.':'Click saved. Preparing the next signal automatically.'):'Reset when ready, then choose Next repetition.',paused:'Microphone released. Resume starts with a fresh signal.',closing:'Time limit reached. Finishing audio captured before the deadline.'};
 const classes:ClassToggle[]=[{id:'practiceStopBtn',token:'hidden',enabled:!showStop},{id:'practiceLevelPanel',token:'hidden',enabled:!showInput},{id:'practiceSignal',token:'hidden',enabled:phase==='active'||phase==='await-cue'},{id:'practiceSignal',token:'is-paused',enabled:phase==='paused'},{id:'practicePauseBtn',token:'hidden',enabled:phase==='paused'},{id:'practiceResumeBtn',token:'hidden',enabled:phase!=='paused'},{id:'practiceNextBtn',token:'hidden',enabled:phase!=='result'||mode==='single'},{id:'practiceEndBtn',token:'hidden',enabled:showStop}];
 const blocked=pending||saving||interruption;
 return{phase:phase||'idle',classes,texts:{practiceCompletedLabel:continuous?'Clicks':'Attempts',practiceCompleted:String(state?.completed??0),practiceShots:String(state?.shots??0),practiceRemainingLabel:free?'Seconds left':'Left',practiceRemaining:String(remaining),practiceElapsed:seconds(elapsed),practiceSignal:signal,practiceAnnouncement:announcements[phase??'']||'',practiceMicrophone:microphone?'● Microphone connected':'Microphone inactive',practiceInputFeedback:inputFeedback},disabled:{practiceStopBtn:interruption||closing,practicePauseBtn:blocked,practiceResumeBtn:blocked,practiceNextBtn:blocked,practiceEndBtn:interruption||closing},latest:state?.repetitions.filter(row=>row.status!=='partial').at(-1)};
}
export function sequenceRunPresentation({state,pending,clock,microphone,readConfig,savedRevision,titleFor}:{state:SequenceState|null;pending:boolean;clock:()=>number;microphone:boolean;readConfig:()=>Config;savedRevision:number|null;titleFor:(label:string)=>string}){
 const config=state?.config||readConfig();
 const classes:ClassToggle[]=[{id:'sessionCountdown',token:'is-go',enabled:state?.phase==='active'&&!pending},{id:'sessionCountdown',token:'is-paused',enabled:state?.phase==='paused'},{id:'sessionCountdown',token:'is-connecting',enabled:pending},{id:'sessionMicrophoneStatus',token:'is-live',enabled:microphone},{id:'pauseSessionBtn',token:'hidden',enabled:state?.phase==='paused'},{id:'resumeSessionBtn',token:'hidden',enabled:state?.phase!=='paused'}];
 let countdown:string,announcement:string;
 if(pending){countdown='Connecting';announcement='Waiting for microphone permission.';}
 else if(state!.phase==='countdown'){const remaining=Math.max(0,state!.countdownEndsAtMs!-clock());countdown=(remaining/1000).toFixed(1);announcement=`Get ready · ${Math.ceil(remaining/1000)} seconds.`;}
 else if(state!.phase==='active'){countdown='GO';announcement=`GO · awaiting ${titleFor(state!.drillSteps[state!.current!.stepIndex])}.`;}
 else if(state!.phase==='paused'){countdown='Paused';announcement='Paused. Resume starts a fresh countdown.';}
 else{const durable=savedRevision===state!.revision;countdown=durable?'Saved':'Saving';announcement=durable?'Repetition completed and saved.':'Repetition detected · saving results.';}
 return{classes,texts:{sessionCompletedCount:String(state?.completed??0),sessionLeftCount:String(state?.remaining??config.repetitions),sessionCountdown:countdown,sessionMicrophoneStatus:microphone?'● Microphone active':pending?'Connecting microphone…':'Microphone inactive'},progress:{max:config.repetitions,value:state?.completed??0},disabled:{pauseSessionBtn:pending||!state||state.completed===config.repetitions,resumeSessionBtn:pending,endSessionBtn:false},announcement,latest:state?.repetitions.filter(row=>row.status==='completed').at(-1)};
}
type Paragraph={text:string;className:string};
type ReviewContext={state:{revision:number}|null;savedRevision:number|null;saveError:boolean;saving:boolean;locked:boolean;gunId:string|undefined};
type PracticeRecord={status:string;shots:number;gunId:string;gunName:string;elapsedMs:number;startedAt:number;practiceMode:string;config:{startSource?:string;soundAtStart:boolean;parSeconds:number};repetitions:(PracticeRepetition&{goAt:number|null})[]};
type PracticeStats={hits:number;misses:number;intervalMeanMs:number|null;intervalMinMs:number|null;intervalMaxMs:number|null;intervalSpreadMs:number|null};
export function practiceReviewPresentation(record:PracticeRecord,{state,savedRevision,saveError,saving,locked,gunId,interruption,continuous,stats}:ReviewContext&{interruption:boolean;continuous:boolean;stats:PracticeStats}){
 const started=record.repetitions.some(row=>row.goAt!==null);
 const summary:Paragraph[]=[{text:`${record.shots} accepted shots`,className:'session-summary-count'},{text:`${stats.hits} recognized attempts · ${stats.misses} misses`,className:'muted small'},{text:`${record.gunName} · active ${seconds(record.elapsedMs)}`,className:'muted small'},{text:`${new Date(record.startedAt).toLocaleString()} · ${!started?'No GO signal':record.config.startSource==='external'?'External cue onset timing':'Scheduled GO timing'}`,className:'muted small'}];
 if(continuous&&stats.intervalMeanMs!==null)summary.push({text:`Click intervals · mean ${seconds(stats.intervalMeanMs)} · min ${seconds(stats.intervalMinMs)} · max ${seconds(stats.intervalMaxMs)} · spread ${seconds(stats.intervalSpreadMs)}`,className:'muted small'});
 if(record.practiceMode==='par')summary.push({text:`Par ${record.config.parSeconds.toFixed(1)} s · onset at the deadline is in time`,className:'muted small'});
 if(record.config.startSource==='app'&&record.config.soundAtStart&&started)summary.push({text:'Beep mode excluded the first 0.08 s after start. Audible speaker latency varies by device.',className:'muted small'});
 return{status:record.status,title:`Practice ${record.status}`,summary,savedNote:saveError?'Not saved. Keep this page open and retry saving.':state&&savedRevision!==state.revision?'Saving on this device…':'Saved on this device',retryHidden:!saveError,retryDisabled:saving||interruption,repeatDisabled:locked||record.gunId!==gunId,results:record.repetitions};
}
type SequenceRecord={status:string;completed:number;remaining:number;gunId:string;gunName:string;startedAt:number;config:{repetitions:number};repetitions:SequenceRepetition[]};
export function sequenceReviewPresentation(record:SequenceRecord,{state,savedRevision,saveError,saving,locked,gunId,pending}:ReviewContext&{pending:boolean}){
 const durable=!state||savedRevision===state.revision;
 const summary:Paragraph[]=[{text:`${record.completed} / ${record.config.repetitions}`,className:'session-summary-count'},{text:`${record.completed} completed · ${record.remaining} left`,className:'muted small'},{text:`${record.gunName} · ${new Date(record.startedAt).toLocaleString()}`,className:'muted small'}];
 return{status:record.status,title:record.status==='completed'?'Session completed':`Session ${record.status}`,summary,savedNote:saveError?'Results are not saved. Keep this page open and retry saving.':durable?'Saved on this device':'Saving results on this device…',retryHidden:!saveError,retryDisabled:saving||pending,repeatDisabled:locked||saveError||gunId!==record.gunId,results:record.repetitions};
}
