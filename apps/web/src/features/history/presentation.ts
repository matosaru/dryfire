import type {RecognitionRow} from '@dryfire/ui/RecognitionList';
import type {Evaluation} from '@dryfire/ui/EvaluationPanel';
import {formatLocaleDate,formatLocaleNumber,translate} from '../../localization/runtime.ts';
export type RetainedEvent={id:string;label:string;createdAt:number;score?:number;confidence?:number;actualLabel?:string|null;drillId?:string;drillTitle?:string;drillCompleted?:boolean;drillOutcome?:string};
export type EvaluationStats={verified:number;accuracy:number|null;otherFalsePositiveRate:number|null;matrix:Record<string,Record<string,number>>};
export function recognitionRows(events:RetainedEvent[],titleFor:(label:string)=>string,drillTitleFor:(id:string|undefined)=>string|undefined):RecognitionRow[]{
 return events.map(row=>{
  const title=row.drillTitle||drillTitleFor(row.drillId);
  const score=Number.isFinite(row.score)?row.score!:Math.round((row.confidence||0)*100);
  const sequenceMessage=row.drillCompleted?'recognition.sequenceRecognized':row.drillOutcome==='incorrect'?'recognition.outOfOrder':row.drillOutcome==='unknown'?'recognition.unknownSequenceSound':'recognition.stepDetected';
  return{id:row.id,title:titleFor(row.label),date:formatLocaleDate(row.createdAt,{year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'2-digit',second:'2-digit'}),score:`${formatLocaleNumber(Math.round(score))}/100`,actualLabel:row.actualLabel??'',sequence:row.drillId&&title?translate('history',sequenceMessage,{title}):undefined};
 });
}
export function evaluationPresentation(stats:EvaluationStats,actual:string[],predicted:string[]):Evaluation{return{verified:stats.verified,accuracy:stats.accuracy===null?'—':`${Math.round(stats.accuracy*100)}%`,falsePositive:stats.otherFalsePositiveRate===null?'—':`${Math.round(stats.otherFalsePositiveRate*100)}%`,actual,predicted,matrix:stats.matrix};}
