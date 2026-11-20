type Drill={steps:string[]};
type State={stepIndex:number;completed:number;incorrect:number;unknown:number;lastOutcome?:string};
export function distancePresentation(labels:string[],distances:Record<string,number>,titleFor:(label:string)=>string,notLearned:string){
 const maximum=Math.max(...Object.values(distances).filter(Number.isFinite),1);
 return labels.map(label=>({title:titleFor(label),value:Number.isFinite(distances[label])?distances[label].toFixed(2):notLearned,width:`${Number.isFinite(distances[label])?Math.max(0,100-distances[label]/maximum*85):0}%`}));
}
/** Pure ordered-feedback view. The session engine remains the only owner of transitions. */
export function liveDrillPresentation(drill:Drill|null|undefined,state:State|null,titleFor:(label:string)=>string,message:(key:string,parameters?:Record<string,string|number>)=>string){
 const hidden={drillStats:!drill,resetDrillBtn:!drill};
 if(!drill)return{hidden,steps:[],texts:{'drillProgressBadge':message('mode.badge'),'drill-heading':message('mode.free'),'drillExplanation':message('drill.selectionExplanation'),'drillFeedback':''}};
 const current=state!;
 const outcomes:Record<string,string>={ready:message('drill.ready',{sound:titleFor(drill.steps[0])}),matched:message('drill.matched',{sound:titleFor(drill.steps[current.stepIndex])}),completed:message('drill.completed',{count:current.completed}),incorrect:message('drill.incorrect',{sound:titleFor(drill.steps[current.stepIndex])}),unknown:message('drill.unknown',{sound:titleFor(drill.steps[current.stepIndex])})};
 return{hidden,texts:{'drill-heading':message('drill.heading'),drillProgressBadge:message('mode.stepCount',{current:current.stepIndex+1,total:drill.steps.length}),drillExplanation:message('drill.orderedExplanation'),drillCompleted:String(current.completed),drillIncorrect:String(current.incorrect),drillUnknown:String(current.unknown),drillFeedback:outcomes[current.lastOutcome??'ready']},steps:drill.steps.map((label,index)=>({className:index<(current.stepIndex)?'drill-step done':index===(current.stepIndex)?'drill-step current':'drill-step',number:index<(current.stepIndex)?'✓':String(index+1),title:titleFor(label)}))};
}
