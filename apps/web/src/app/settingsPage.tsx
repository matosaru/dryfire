import {StrictMode,useLayoutEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {SettingsPage,type SettingsPageProps,type SettingsState} from '../pages/SettingsPage/index.ts';
import type {preferencePresentation} from '../features/settings/preferencePresentation.ts';
type Preferences=ReturnType<typeof preferencePresentation>;
type Update=SettingsState&{preferences?:Preferences};
/** Platform-owned controls retain their exact nodes and listeners through page handoff. */
function NativeIsland({node}:{node:HTMLElement}){
 const ref=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{ref.current!.append(node);},[node]);
 return <div style={{display:'contents'}} ref={ref}/>;
}
export function mountSettingsPage(host:Element,callbacks:Pick<SettingsPageProps,'onAction'|'onPreference'|'onBack'>){
 const get=<T extends HTMLElement>(id:string)=>host.querySelector<T>('#'+id)!;
 const file=get<HTMLInputElement>('importFile'),preview=get<HTMLElement>('previewTestingSection');
 const texts=Object.fromEntries(['installStatus','deviceCheck','soundResetSummary','soundResetOutcome'].map(id=>[id,get(id).textContent!]));
 const disabled=Object.fromEntries(['resetModelBtn','exportBtn','importBtn','resetLibraryBtn'].map(id=>[id,get<HTMLButtonElement>(id).disabled]));
 const values=['noiseFilter','autoGainControl','appearance','vibrationFeedback'].map(id=>{const input=get<HTMLInputElement>(id);return{id,value:input.value,checked:input.checked,disabled:input.disabled};});
 const statuses=['noiseFilterStatus','autoGainStatus','vibrationStatus'].map(id=>({id,text:get(id).textContent!}));
 let state:SettingsState={texts,disabled,gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),installationOpen:host.querySelector('details')!.open};
 const backup=[...host.childNodes],fileParent=file.parentNode!,fileNext=file.nextSibling,previewParent=preview?.parentNode,previewNext=preview?.nextSibling;
 const active=host.ownerDocument.activeElement as HTMLElement|null,focusId=host.contains(active)?active?.id:undefined;
 let disposed=false,failure:unknown;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><SettingsPage {...callbacks} state={state} fileInput={<NativeIsland node={file}/>} preview={preview?<NativeIsland node={preview}/>:undefined}/></StrictMode>));if(failure)throw failure;};
 try{render();host.setAttribute('data-react-settings','');for(const item of values){const input=get<HTMLInputElement>(item.id);input.value=item.value;input.checked=item.checked;input.disabled=item.disabled;}for(const item of statuses)get(item.id).textContent=item.text;if(focusId)get(focusId).focus();}
 catch(error){host.removeAttribute('data-react-settings');flushSync(()=>root.unmount());host.replaceChildren(...backup);fileParent.insertBefore(file,fileNext);if(preview)previewParent!.insertBefore(preview,previewNext);active?.focus();throw error;}
 return{
  update(next:Update){if(disposed)return;state={...state,...next,texts:{...state.texts,...next.texts},disabled:{...state.disabled,...next.disabled}};render();
   const view=next.preferences;if(view){for(const item of view.audio){const input=get<HTMLInputElement>(item.inputId);input.checked=item.checked;input.disabled=item.disabled;get(item.statusId).textContent=item.status;}get<HTMLSelectElement>('appearance').value=view.appearance.value;get<HTMLSelectElement>('appearance').disabled=view.appearance.disabled;const vibration=get<HTMLInputElement>('vibrationFeedback');vibration.checked=view.vibration.checked;vibration.disabled=view.vibration.disabled;get('vibrationStatus').textContent=view.vibration.status;}
  },
  dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-settings');flushSync(()=>root.unmount());},
 };
}
