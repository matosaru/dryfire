type Drill={steps:string[]};
type State={stepIndex:number;completed:number;incorrect:number;unknown:number;lastOutcome?:string};
export function distancePresentation(labels:string[],distances:Record<string,number>,titleFor:(label:string)=>string){
 const maximum=Math.max(...Object.values(distances).filter(Number.isFinite),1);
 return labels.map(label=>({title:titleFor(label),value:Number.isFinite(distances[label])?distances[label].toFixed(2):'not learned',width:`${Number.isFinite(distances[label])?Math.max(0,100-distances[label]/maximum*85):0}%`}));
}
/** Pure ordered-feedback view. The session engine remains the only owner of transitions. */
export function liveDrillPresentation(drill:Drill|null|undefined,state:State|null,titleFor:(label:string)=>string){
 const hidden={drillStats:!drill,resetDrillBtn:!drill};
 if(!drill)return{hidden,steps:[],texts:{'drillProgressBadge':'Free listen','drill-heading':'Free listening','drillExplanation':'Select a preset to track its ordered sound detections while the microphone stays active.','drillFeedback':''}};
 const current=state!;
 const outcomes:Record<string,string>={ready:`Ready · awaiting ${titleFor(drill.steps[0])}.`,matched:`Recognized · next: ${titleFor(drill.steps[current.stepIndex])}.`,completed:`Sequence recognized (${current.completed} completed). Listening for the next attempt.`,incorrect:`Unexpected action · restarted. Awaiting ${titleFor(drill.steps[current.stepIndex])}.`,unknown:`Unknown sound · keep listening for ${titleFor(drill.steps[current.stepIndex])}.`};
 return{hidden,texts:{'drill-heading':'Drill Session',drillProgressBadge:`Step ${(current.stepIndex)+1} / ${drill.steps.length}`,drillExplanation:'Detect the ordered sound sequence below. Counts reflect acoustic recognition, not verified physical actions.',drillCompleted:String(current.completed),drillIncorrect:String(current.incorrect),drillUnknown:String(current.unknown),drillFeedback:outcomes[current.lastOutcome??'ready']},steps:drill.steps.map((label,index)=>({className:index<(current.stepIndex)?'drill-step done':index===(current.stepIndex)?'drill-step current':'drill-step',number:index<(current.stepIndex)?'✓':String(index+1),title:titleFor(label)}))};
}
