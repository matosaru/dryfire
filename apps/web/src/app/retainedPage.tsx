import {StrictMode,type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
/** Synchronous parent ownership; callers retain independent form/child-root nodes. */
export function mountRetainedPage<P extends object>(host:HTMLElement,initial:P,draw:(props:P)=>ReactNode,marker:string){
 let state=initial,disposed=false,failure:unknown,backup=[...host.childNodes];
 const active=host.ownerDocument.activeElement as HTMLElement|null,inside=!!active&&host.contains(active),focusId=inside?active?.id:undefined;
 const headings=[...host.querySelectorAll<HTMLElement>('h2[id]')].map(node=>({id:node.id,tabindex:node.getAttribute('tabindex')}));
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode>{draw(state)}</StrictMode>));if(failure)throw failure;};
 try{render();for(const heading of headings){if(heading.tabindex!==null)host.querySelector('#'+heading.id)?.setAttribute('tabindex',heading.tabindex);}if(inside){if(active?.isConnected)active.focus();else if(focusId)host.querySelector<HTMLElement>('#'+focusId)?.focus();}host.setAttribute(marker,'');backup=[];}
 catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{update(next:Partial<P>){if(disposed||Object.entries(next).every(([key,value])=>Object.is(state[key as keyof P],value)))return;state={...state,...next};render();},dispose(){if(disposed)return;disposed=true;host.removeAttribute(marker);flushSync(()=>root.unmount());}};
}
