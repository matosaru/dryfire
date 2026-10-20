import {mountSessionContents,type PracticeContents} from './sessionContents';
import {applyControlClasses} from '../features/sessions/controlClasses';
import type {practiceRunPresentation,practiceReviewPresentation} from '../features/sessions/phasePresentation';
import {practiceResultPresentation} from '../features/sessions/resultPresentation';
import {RepetitionResult} from '@dryfire/ui/RepetitionResult';
type Run=ReturnType<typeof practiceRunPresentation>;
type Review=ReturnType<typeof practiceReviewPresentation>;
/** Lazy live presentation adapter. No clocks, capture, storage or configuration ownership. */
export function mountPracticeContents(runHost:HTMLElement,reviewHost:HTMLElement,{runModel,reviewModel,onAction,titleFor}:{runModel?:Run;reviewModel?:Review;onAction:(id:string)=>void;titleFor:(label:string)=>string}){
 const meter=runHost.querySelector<HTMLElement>('#practiceLevelPanel')!;
 let classes=Object.fromEntries([...runHost.querySelectorAll<HTMLElement>('[id]')].map(node=>[node.id,node.className]));
 const result=(row:Parameters<typeof practiceResultPresentation>[0],index=0)=><RepetitionResult key={index} value={practiceResultPresentation(row,titleFor)}/>;
 const model=():PracticeContents=>({kind:'practice',meter,run:{onAction,view:runModel?{...runModel,classNames:classes}:undefined,latest:runModel?.latest?result(runModel.latest):undefined},review:{onAction,view:reviewModel,results:reviewModel?.results.length?reviewModel.results.map(result):undefined}});
 const view=mountSessionContents(runHost,reviewHost,model());
 return{
  setRun(next:Run){runModel=next;classes=applyControlClasses(classes,next.classes);view.update(model());meter.className=classes.practiceLevelPanel;},
  setReview(next:Review){reviewModel=next;view.update(model());},
  dispose(){view.dispose();}
 };
}
