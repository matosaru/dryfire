import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {ProgressContent,type ProgressModel} from '@dryfire/ui/ProgressContent';
/** Private-only dynamic entry; each refresh replaces details exactly as the original renderer did. */
export function mountProgressContent(host:Element,initial:ProgressModel){
 let model=initial,epoch=0,disposed=false,failure:unknown;
 const backup=[...host.childNodes],active=host.ownerDocument.activeElement as HTMLElement|null;
 const open=host.querySelector<HTMLDetailsElement>('details')?.open;
 const focusedSummary=active===host.querySelector('summary');
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><ProgressContent key={epoch} model={model}/></StrictMode>));if(failure)throw failure;};
 try{render();const details=host.querySelector<HTMLDetailsElement>('details');if(details&&open)details.open=true;if(focusedSummary)host.querySelector('summary')?.focus();host.setAttribute('data-react-progress','');}
 catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{update(next:ProgressModel){if(disposed)return;model=next;epoch++;render();},dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-progress');flushSync(()=>root.unmount());}};
}
