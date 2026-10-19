import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {LiveListenPage,type LiveListenState,type LiveListenPageProps} from '../pages/LiveListenPage/index.ts';
const textIds=['drill-heading','drillProgressBadge','drillExplanation','drillCompleted','drillIncorrect','drillUnknown','drillFeedback','trainingSummary','listeningIndicator','listenNote','eventCounter','predictionEmpty','predictionLabel','predictionConfidence','predictionScore','listenBtn'];
const controls=['listenBtn','singleShotBtn','changeDrillBtn','resetDrillBtn','verifyLatestBtn','sensitivity','drillSelect','latestActual'];
const hiddenIds=['drillStats','resetDrillBtn','predictionCard','predictionEmpty'];
const selectIds=['sensitivity','drillSelect','latestActual'];
type Callbacks=Pick<LiveListenPageProps,'onAction'|'onChange'|'onBack'>;
export function mountLiveListenPage(host:Element,callbacks:Callbacks){
 const get=<T extends HTMLElement>(id:string)=>host.querySelector<T>('#'+id)!;
 let state:LiveListenState={
  gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),
  texts:Object.fromEntries(textIds.map(id=>[id,get(id).textContent!])),disabled:Object.fromEntries(controls.map(id=>[id,get<HTMLButtonElement>(id).disabled])),hidden:Object.fromEntries(hiddenIds.map(id=>[id,get(id).classList.contains('hidden')])),selects:Object.fromEntries(selectIds.map(id=>[id,get<HTMLSelectElement>(id).value])),listening:get('listenBtn').classList.contains('listening'),
  options:[...get<HTMLSelectElement>('drillSelect').options].map(option=>({value:option.value,title:option.text})),
  steps:[...get('drillSteps').children].map(row=>({className:row.className,number:row.children[0].textContent!,title:row.children[1].textContent!})),
  distances:[...get('distanceBars').children].map(row=>({title:row.querySelector('.distance-label')!.children[0].textContent!,value:row.querySelector('.distance-label')!.children[1].textContent!,width:row.querySelector<HTMLElement>('.bar span')!.style.width})),
  timeline:[...get('sessionTimeline').children].map(row=>({name:row.children[0].textContent!,detail:row.children[1].textContent!})),
 };
 const meterWidth=get('meterFill').style.width,backup=[...host.childNodes],active=host.ownerDocument.activeElement as HTMLElement|null;
 const focusId=host.contains(active)?active?.id:undefined;
 let disposed=false,failure:unknown;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><LiveListenPage {...callbacks} state={state}/></StrictMode>));if(failure)throw failure;};
 try{render();get('meterFill').style.width=meterWidth;host.setAttribute('data-react-live-listen','');if(focusId)get(focusId).focus();}
 catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{
  update(next:LiveListenState){if(disposed)return;state={...state,...next,texts:{...state.texts,...next.texts},disabled:{...state.disabled,...next.disabled},hidden:{...state.hidden,...next.hidden},selects:{...state.selects,...next.selects}};render();for(const[id,value]of Object.entries(next.selects??{}))get<HTMLSelectElement>(id).value=value;},
  setLevel(width:string){if(!disposed)get('meterFill').style.width=width;},
  prepend(row:{name:string;detail:string}){if(disposed)return;state={...state,timeline:[row,...state.timeline!].slice(0,12)};render();},
  dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-live-listen');flushSync(()=>root.unmount());},
 };
}
