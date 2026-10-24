import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {HomePage,type HomePageProps} from '../pages/HomePage/index.ts';
export function mountHomePage(host:Element,onNavigate:(view:string)=>void){
 let state:HomePageProps={
  gunName:host.querySelector('.gun-context-name')!.textContent!,contextHidden:host.querySelector('.gun-context')!.classList.contains('hidden'),
  training:host.querySelector('#homeExamples')!.textContent!,events:Number(host.querySelector('#homeEvents')!.textContent),accuracy:host.querySelector('#homeAccuracy')!.textContent!,
  listenDisabled:(host.querySelector('#homeListenBtn') as HTMLButtonElement).disabled,onNavigate,
 };
 const backup=[...host.childNodes],active=host.ownerDocument.activeElement as HTMLElement|null;
 const focusId=host.contains(active)?active?.id:undefined;
 let disposed=false,failure:unknown;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=(props:HomePageProps)=>{flushSync(()=>root.render(<StrictMode><HomePage {...props}/></StrictMode>));if(failure)throw failure;};
 try{render(state);if(focusId)host.querySelector<HTMLElement>(`#${focusId}`)?.focus();}
 catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{update(props:HomePageProps){if(!disposed){state={...state,...props};render(state);}},dispose(){if(disposed)return;disposed=true;flushSync(()=>root.unmount());}};
}
