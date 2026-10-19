import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {LearnPage,type LearnPageProps} from '../pages/LearnPage/index.ts';
import {CalibrationCatalog,type CalibrationCatalogProps} from '@dryfire/ui/CalibrationCatalog';
export type LearnRuntimeProps=Omit<LearnPageProps,'calibration'>&{calibrationProps?:CalibrationCatalogProps};
/** Capture/storage remain controller-owned; stable React keys retain focused controls and disclosure drafts. */
export function mountLearnPage(host:Element,initial:LearnRuntimeProps){
 const disclosures=host.querySelectorAll<HTMLDetailsElement>('details.optional-sounds');
 let state:LearnRuntimeProps={gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),notice:host.querySelector('#modelNotice')!.textContent!,noticeHidden:host.querySelector('#modelNotice')!.classList.contains('hidden'),optionalOpen:disclosures[0].open,calibrationOpen:disclosures[1].open,...initial};
 const backup=[...host.childNodes],active=host.ownerDocument.activeElement as HTMLElement|null,focusId=host.contains(active)?active?.id:undefined;
 const focusKind=host.contains(active)?active?.getAttribute('data-calibration-kind'):null,focusName=host.contains(active)?active?.getAttribute('aria-label'):null;
 let disposed=false,failure:unknown;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><LearnPage {...state} calibration={<CalibrationCatalog {...state.calibrationProps}/>}/></StrictMode>));if(failure)throw failure;};
 try{render();host.setAttribute('data-react-learn','');if(host.contains(active)||focusId||focusKind||focusName){const controls=[...host.querySelectorAll<HTMLElement>('button,input,select,summary')];const target=(focusId?controls.find(node=>node.id===focusId):undefined)??(focusKind?controls.find(node=>node.getAttribute('data-calibration-kind')===focusKind):undefined)??(focusName?controls.find(node=>node.getAttribute('aria-label')===focusName):undefined);target?.focus();}}
 catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{
  update(next:LearnRuntimeProps){if(disposed)return;state={...state,...next};render();},
  dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-learn');flushSync(()=>root.unmount());},
 };
}
