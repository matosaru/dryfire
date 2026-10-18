import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {GunsPage,type GunsPageProps} from '../pages/GunsPage/index.ts';

/** This root owns the entire library interior. No form or other page is replaced. */
export function mountGunsPage(doc:Document,initial:GunsPageProps){
 const host=doc.getElementById('gunsView');
 if(!host)throw new Error('Gun library mount is missing.');
 const backup=[...host.childNodes];
 const originalFocus=host.contains(doc.activeElement)?doc.activeElement as HTMLElement:null;
 let failure:unknown,disposed=false,state=initial;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{
  const active=doc.activeElement as HTMLElement|null;
  const focus=host.contains(active)?{id:active?.id,edit:active?.dataset.editGunId,remove:active?.dataset.deleteGunId,gun:active?.dataset.gunId}:null;
  flushSync(()=>root.render(<StrictMode><GunsPage {...state}/></StrictMode>));
  if(failure)throw failure;
  if(focus){
   const target=[...host.querySelectorAll<HTMLElement>('button')].find(node=>focus.id?node.id===focus.id:focus.edit?node.dataset.editGunId===focus.edit:focus.remove?node.dataset.deleteGunId===focus.remove:node.dataset.gunId===focus.gun);
   target?.focus();
  }
 };
 try{render();}catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);originalFocus?.focus();throw error;}
 return {
  update(next:GunsPageProps){if(disposed)return;state=next;render();},
  setLocked(locked:boolean){if(disposed||state.locked===locked)return;state={...state,locked};render();},
  dispose(){if(disposed)return;disposed=true;flushSync(()=>root.unmount());},
 };
}
