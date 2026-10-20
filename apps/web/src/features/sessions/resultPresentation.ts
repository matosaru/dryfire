import type {RepetitionDetails} from '@dryfire/ui/RepetitionResult';
type Step={label:string;offsetMs:number;splitMs:number};
type Detection={label:string;offsetMs:number;outcome:string;score:number};
export type Repetition={ordinal:number;status:string;reason?:string;elapsedMs:number|null;stepTimings:Step[];detections:Detection[]};
export type PracticeRepetition=Repetition&{intervalMs?:number|null};
export type SequenceRepetition=Repetition&{unknown:number;incorrect:number};
export const sessionSeconds=(value:number|null|undefined)=>Number.isFinite(value)?`${(value!/1000).toFixed(2)} s`:'—';
const detections=(rows:Detection[],titleFor:(label:string)=>string)=>rows.map(row=>`${titleFor(row.label)} · ${sessionSeconds(row.offsetMs)} · ${row.outcome} · score ${row.score}/100`);
/** Formatting only: the session engines remain the source of outcomes, intervals and acoustic timestamps. */
export function practiceResultPresentation(row:PracticeRepetition,titleFor:(label:string)=>string):RepetitionDetails{
 const status=row.status==='hit'?'Recognized':row.status==='miss'?(row.reason==='early'?'Miss · early trigger':row.reason==='late'?'Miss · late click':'Miss · no click'):`Partial · ${row.reason}`;
 const paragraphs:RepetitionDetails['paragraphs']=[];
 if(row.intervalMs!==null)paragraphs.push({text:`Interval since previous click: ${sessionSeconds(row.intervalMs)}`,className:'small'});
 for(const step of row.stepTimings)paragraphs.push({text:`${titleFor(step.label)} · ${sessionSeconds(step.offsetMs)} · split ${sessionSeconds(step.splitMs)}`,className:'small'});
 return{summary:`${row.ordinal} · ${status} · ${sessionSeconds(row.elapsedMs)}`,paragraphs,detections:detections(row.detections,titleFor)};
}
export function sequenceResultPresentation(row:SequenceRepetition,titleFor:(label:string)=>string):RepetitionDetails{
 const outcome=row.status==='completed'?'Completed':`Partial · ${row.reason||'interrupted'}`;
 return{summary:`Repetition ${row.ordinal} · ${outcome} · ${sessionSeconds(row.elapsedMs)}`,paragraphs:[{text:`${row.unknown} unknown · ${row.incorrect} out of order`,className:'muted small'},...row.stepTimings.map(step=>({text:`${titleFor(step.label)}: ${sessionSeconds(step.offsetMs)} from GO · split ${sessionSeconds(step.splitMs)}`,className:'small'}))],detections:detections(row.detections,titleFor)};
}
