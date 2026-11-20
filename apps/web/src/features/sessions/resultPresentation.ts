import type {RepetitionDetails} from '@dryfire/ui/RepetitionResult';
import {formatLocaleNumber,translate} from '../../localization/runtime.ts';
type Step={label:string;offsetMs:number;splitMs:number};
type Detection={label:string;offsetMs:number;outcome:string;score:number};
export type Repetition={ordinal:number;status:string;reason?:string;elapsedMs:number|null;stepTimings:Step[];detections:Detection[]};
export type PracticeRepetition=Repetition&{intervalMs?:number|null};
export type SequenceRepetition=Repetition&{unknown:number;incorrect:number};
export const sessionSeconds=(value:number|null|undefined)=>Number.isFinite(value)?`${formatLocaleNumber(value!/1000,{minimumFractionDigits:2,maximumFractionDigits:2})} s`:'—';
const tr=(key:string,parameters:Record<string,string|number>={})=>translate('common',`sessionResult.${key}`,parameters);
const detectionOutcome=(value:string)=>tr(`outcome.${value}`);
const detections=(rows:Detection[],titleFor:(label:string)=>string)=>rows.map(row=>tr('detection',{label:titleFor(row.label),time:sessionSeconds(row.offsetMs),outcome:detectionOutcome(row.outcome),score:formatLocaleNumber(row.score)}));
/** Formatting only: the session engines remain the source of outcomes, intervals and acoustic timestamps. */
export function practiceResultPresentation(row:PracticeRepetition,titleFor:(label:string)=>string):RepetitionDetails{
 const status=row.status==='hit'?tr('recognized'):row.status==='miss'?(row.reason==='early'?tr('earlyMiss'):row.reason==='late'?tr('lateMiss'):tr('noClickMiss')):tr('partial',{reason:tr(`reason.${row.reason??'undefined'}`)});
 const paragraphs:RepetitionDetails['paragraphs']=[];
 if(row.intervalMs!==null)paragraphs.push({text:tr('intervalSinceClick',{time:sessionSeconds(row.intervalMs)}),className:'small'});
 for(const step of row.stepTimings)paragraphs.push({text:tr('practiceStepTiming',{label:titleFor(step.label),time:sessionSeconds(step.offsetMs),split:sessionSeconds(step.splitMs)}),className:'small'});
 return{summary:tr('practiceSummary',{ordinal:formatLocaleNumber(row.ordinal),status,time:sessionSeconds(row.elapsedMs)}),paragraphs,detections:detections(row.detections,titleFor)};
}
export function sequenceResultPresentation(row:SequenceRepetition,titleFor:(label:string)=>string):RepetitionDetails{
 const outcome=row.status==='completed'?tr('completed'):tr('partial',{reason:tr(`reason.${row.reason||'interrupted'}`)});
 return{summary:tr('sequenceSummary',{ordinal:formatLocaleNumber(row.ordinal),outcome,time:sessionSeconds(row.elapsedMs)}),paragraphs:[{text:tr('sequenceCounts',{unknown:formatLocaleNumber(row.unknown),incorrect:formatLocaleNumber(row.incorrect)}),className:'muted small'},...row.stepTimings.map(step=>({text:tr('sequenceStepTiming',{label:titleFor(step.label),time:sessionSeconds(step.offsetMs),split:sessionSeconds(step.splitMs)}),className:'small'}))],detections:detections(row.detections,titleFor)};
}
