import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
import type {SavedSessionSummary} from '@dryfire/ui/SavedSessionList';
import {HistoryPage,type HistoryState} from '../pages/HistoryPage';
import {recognitionRows,evaluationPresentation,type RetainedEvent,type EvaluationStats} from '../features/history/presentation';
type Data={rows:RetainedEvent[];sessions:SavedSessionSummary[];stats:EvaluationStats;gunId:string|undefined};
type Actions={onBack:()=>void;onAction:(id:string)=>void;onOpen:(record:SavedSessionSummary)=>void;onVerify:(id:string,value:string,gunId:string|undefined)=>void;titleFor:(label:string)=>string;drillTitleFor:(id:string|undefined)=>string|undefined;labels:string[];actual:string[];predicted:string[]};
/** History owns result presentation; exact numeric drafts and optional graph/filter lifetimes are retained. */
export function mountHistoryPage(host:Element,initial:Data,actions:Actions){
 const get=<T extends HTMLElement>(id:string)=>host.querySelector<T>('#'+id)!;
 const limit=get('maxResults').closest<HTMLElement>('.settings-row')!,progress=get('progressSection');
 const backup=[...host.childNodes],active=host.ownerDocument.activeElement as HTMLElement|null;
 const selectIndex=[...host.querySelectorAll('select[aria-label^="Actual sound for "]')].indexOf(active as HTMLSelectElement);
 const selections=[...host.querySelectorAll<HTMLSelectElement>('select[aria-label^="Actual sound for "]')].map(node=>node.value);
 let owner=initial.gunId,disposed=false,failure:unknown;
 let state:HistoryState={gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),texts:Object.fromEntries(['historyClearOutcome','sessionsClearOutcome'].map(id=>[id,get(id).textContent!])),disabled:Object.fromEntries(['clearHistoryBtn','clearSessionsBtn'].map(id=>[id,(get(id) as HTMLButtonElement).disabled])),options:[{value:'',title:'Not verified'},...actions.labels.map(value=>({value,title:actions.titleFor(value)})),{value:'other',title:'Other / noise'}]};
 const results=(data:Data)=>({sessions:data.sessions,rows:recognitionRows(data.rows,actions.titleFor,actions.drillTitleFor),evaluation:evaluationPresentation(data.stats,actions.actual,actions.predicted)});
 state={...state,...results(initial)};
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><HistoryPage state={state} limit={<RetainedNode node={limit}/>} progress={<RetainedNode node={progress}/>} onBack={actions.onBack} onAction={actions.onAction} onOpen={actions.onOpen} onVerify={(id,value)=>actions.onVerify(id,value,owner)}/></StrictMode>));if(failure)throw failure;};
 try{render();host.setAttribute('data-react-history','');const selects=[...host.querySelectorAll<HTMLSelectElement>('select[aria-label^="Actual sound for "]')];selections.forEach((value,index)=>{if(selects[index])selects[index].value=value;});if(active&&host.contains(active))active.focus();else if(selectIndex>=0)selects[selectIndex]?.focus();}
 catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{
  update(next:HistoryState){if(disposed)return;state={...state,...next,texts:{...state.texts,...next.texts},disabled:{...state.disabled,...next.disabled}};render();},
  setResults(data:Data){if(disposed)return;owner=data.gunId;state={...state,...results(data)};render();},
  dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-history');flushSync(()=>root.unmount());},
 };
}
