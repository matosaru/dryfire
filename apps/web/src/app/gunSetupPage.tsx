import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {GunSetupPage,type GunSetupPageProps} from '../pages/GunSetupPage/index.ts';
/** A new explicit Add/Edit action resets the form. Saving/notice updates retain its native draft nodes. */
export function mountGunSetupPage(doc:Document,initial:GunSetupPageProps){
 const host=doc.getElementById('gunSetupView');if(!host)throw new Error('Gun setup mount is missing.');
 const backup=[...host.childNodes],active=doc.activeElement as HTMLElement|null;
 let state={notice:doc.getElementById('gunCapacityNotice')?.textContent ?? undefined,...initial},epoch=0,disposed=false,failure:unknown;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><GunSetupPage key={epoch} {...state}/></StrictMode>));if(failure)throw failure;};
 try{render();}catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{
  reset(next:GunSetupPageProps){if(disposed)return;state={...state,...next};epoch++;render();},
  setSaving(saving:boolean){if(disposed||state.saving===saving)return;state={...state,saving};render();},
  setNotice(notice:string){if(disposed||state.notice===notice)return;state={...state,notice};render();},
  dispose(){if(disposed)return;disposed=true;flushSync(()=>root.unmount());},
 };
}
