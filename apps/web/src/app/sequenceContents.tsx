import {mountSessionContents,type SequenceContents} from './sessionContents';
import {applyControlClasses} from '../features/sessions/controlClasses';
import type {sequenceRunPresentation,sequenceReviewPresentation} from '../features/sessions/phasePresentation';
import {sequenceResultPresentation} from '../features/sessions/resultPresentation';
import {RepetitionResult} from '@dryfire/ui/RepetitionResult';
type Run=ReturnType<typeof sequenceRunPresentation>;
type Review=ReturnType<typeof sequenceReviewPresentation>;
/** Lazy live presentation adapter; controller retains sequence/timer/save ownership. */
export function mountSequenceContents(runHost:HTMLElement,reviewHost:HTMLElement,{runModel,reviewModel,onAction,titleFor}:{runModel?:Run;reviewModel?:Review;onAction:(id:string)=>void;titleFor:(label:string)=>string}){
 let classes=Object.fromEntries([...runHost.querySelectorAll<HTMLElement>('[id]')].map(node=>[node.id,node.className]));
 const result=(row:Parameters<typeof sequenceResultPresentation>[0],index=0)=><RepetitionResult key={index} value={sequenceResultPresentation(row,titleFor)}/>;
 const model=():SequenceContents=>({kind:'sequence',run:{onAction,view:runModel?{...runModel,texts:{...runModel.texts,sessionAnnouncement:runModel.announcement},classNames:classes}:undefined,latest:runModel?.latest?result(runModel.latest):undefined},review:{onAction,withRetry:true,view:reviewModel,results:reviewModel?.results.length?reviewModel.results.map(result):undefined}});
 const view=mountSessionContents(runHost,reviewHost,model());
 return{setRun(next:Run){runModel=next;classes=applyControlClasses(classes,next.classes);view.update(model());},setReview(next:Review){reviewModel=next;view.update(model());},dispose(){view.dispose();}};
}
