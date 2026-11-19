import {StrictMode} from 'react';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {SettingsPage,type SettingsPageProps,type SettingsState} from '../pages/SettingsPage/index.ts';
import type {preferencePresentation} from '../features/settings/preferencePresentation.ts';
type Preferences=ReturnType<typeof preferencePresentation>;
type Update=SettingsState&{preferences?:Preferences};
export function mountSettingsPage(host:Element,callbacks:Pick<SettingsPageProps,'onAction'|'onPreference'|'onBack'>){
 const get=<T extends HTMLElement>(id:string)=>host.querySelector<T>('#'+id)!;
 const file=get<HTMLInputElement>('importFile'),preview=get<HTMLElement>('previewTestingSection');
 const texts=Object.fromEntries(['installStatus','deviceCheck','soundResetSummary','soundResetOutcome'].map(id=>[id,get(id).textContent!]));
 const disabled=Object.fromEntries(['resetModelBtn','exportBtn','importBtn','resetLibraryBtn'].map(id=>[id,get<HTMLButtonElement>(id).disabled]));
 const values=['noiseFilter','autoGainControl','appearance','measurementSystem','language','vibrationFeedback'].map(id=>{const input=get<HTMLInputElement>(id);return{id,value:input.value,checked:input.checked,disabled:input.disabled};});
 let state:SettingsState={texts,disabled,language:get<HTMLSelectElement>('language').value as 'en'|'de'|'nl',gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),installationOpen:host.querySelector('details')!.open};
 const backup=[...host.childNodes],fileParent=file.parentNode!,fileNext=file.nextSibling,previewParent=preview?.parentNode,previewNext=preview?.nextSibling;
 const active=host.ownerDocument.activeElement as HTMLElement|null,focusId=host.contains(active)?active?.id:undefined;
 let disposed=false,failure:unknown;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><SettingsPage {...callbacks} state={state} fileInput={<RetainedNode node={file}/>} preview={preview?<RetainedNode node={preview}/>:undefined}/></StrictMode>));if(failure)throw failure;};
 try{render();host.setAttribute('data-react-settings','');for(const item of values){const input=get<HTMLInputElement>(item.id);input.value=item.value;input.checked=item.checked;input.disabled=item.disabled;}if(focusId)get(focusId).focus();}
 catch(error){host.removeAttribute('data-react-settings');flushSync(()=>root.unmount());host.replaceChildren(...backup);fileParent.insertBefore(file,fileNext);if(preview)previewParent!.insertBefore(preview,previewNext);active?.focus();throw error;}
 return{
  update(next:Update){if(disposed)return;const view=next.preferences;const preferenceTexts:Record<string,string>=view?{noiseFilterStatus:view.audio.find(item=>item.inputId==='noiseFilter')?.status??'',autoGainStatus:view.audio.find(item=>item.inputId==='autoGainControl')?.status??'',vibrationStatus:view.vibration.status}:{};state={...state,...next,language:view?.language.value??next.language??state.language,texts:{...state.texts,...next.texts,...preferenceTexts},disabled:{...state.disabled,...next.disabled}};render();
   if(view){for(const item of view.audio){const input=get<HTMLInputElement>(item.inputId);input.checked=item.checked;input.disabled=item.disabled;}get<HTMLSelectElement>('appearance').value=view.appearance.value;get<HTMLSelectElement>('appearance').disabled=view.appearance.disabled;get<HTMLSelectElement>('measurementSystem').value=view.measurementSystem.value;get<HTMLSelectElement>('measurementSystem').disabled=view.measurementSystem.disabled;get<HTMLSelectElement>('language').value=view.language.value;get<HTMLSelectElement>('language').disabled=view.language.disabled;const vibration=get<HTMLInputElement>('vibrationFeedback');vibration.checked=view.vibration.checked;vibration.disabled=view.vibration.disabled;}
  },
  dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-settings');flushSync(()=>root.unmount());},
 };
}
