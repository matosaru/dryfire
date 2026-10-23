import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
import {PracticeCatalog} from '@dryfire/ui/PracticeCatalog';
import {DrillsPage,type DrillsPageProps} from '../pages/DrillsPage/index.ts';
export type DrillsRuntimeProps=Omit<DrillsPageProps,'practice'|'editor'>&{practiceDisabled?:boolean};
/** Preset cards and mode choices migrate while the independent editor retains its native draft/lifetime. */
export function mountDrillsPage(host:Element,initial:DrillsRuntimeProps,onPractice:(mode:string)=>void){
 const get=<T extends HTMLElement>(id:string)=>host.querySelector<T>('#'+id)!;
 const editor=get('customDrillForm');
 const modes=[...host.querySelectorAll('#practiceCatalog .preset-card')].map(card=>({id:card.querySelector<HTMLButtonElement>('[data-practice-mode]')!.dataset.practiceMode!,title:card.querySelector('h3')!.textContent!,description:card.querySelector('p')!.textContent!}));
 let state:DrillsRuntimeProps={sequenceDescription:get('sequenceDescription').textContent!,gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),collectionHidden:get('builtInDrillsTab').parentElement!.classList.contains('hidden'),customTabHidden:get('customDrillsTab').classList.contains('hidden'),customSelected:get('customDrillsTab').getAttribute('aria-pressed')==='true',createHidden:get('newCustomDrillBtn').classList.contains('hidden'),practiceDisabled:host.querySelector<HTMLButtonElement>('[data-practice-mode]')!.disabled,freeListenDisabled:get<HTMLButtonElement>('freeListenBtn').disabled,...initial};
 const backup=[...host.childNodes],active=host.ownerDocument.activeElement as HTMLElement|null,focusId=host.contains(active)?active?.id:undefined;
 const selection=active instanceof HTMLInputElement&&active.type==='text'?{start:active.selectionStart,end:active.selectionEnd}:null;
 let disposed=false,failure:unknown;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><DrillsPage {...state} practice={<PracticeCatalog modes={modes} disabled={state.practiceDisabled} onSelect={onPractice}/>} editor={<RetainedNode node={editor} className="custom-drill-editor"/>}/></StrictMode>));if(failure)throw failure;};
 try{render();host.setAttribute('data-react-drills','');if(focusId){const focused=get(focusId);focused.focus();if(selection)(focused as HTMLInputElement).setSelectionRange(selection.start,selection.end);}}
 catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{
  update(next:DrillsRuntimeProps){if(disposed)return;state={...state,...next};render();},
  dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-drills');flushSync(()=>root.unmount());},
 };
}
export {mountCustomDrillFields} from './customDrillFields.tsx';
