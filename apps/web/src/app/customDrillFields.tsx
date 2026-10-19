import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {CustomDrillFields,type CustomDrillFieldsProps} from '@dryfire/ui/CustomDrillEditor';
type State=Omit<CustomDrillFieldsProps,'onAdd'|'onCancel'|'onStep'>;
type Actions=Pick<CustomDrillFieldsProps,'onAdd'|'onCancel'|'onStep'>;
/** Keep the native form/submit lifetime while moving its field presentation to one owner. */
export function mountCustomDrillFields(host:Element,initial:State,actions:Actions){
 let state={...initial},epoch=0,disposed=false,failure:unknown;
 const backup=[...host.childNodes],active=host.ownerDocument.activeElement as HTMLElement|null,focusId=host.contains(active)?active?.id:undefined;
 const selection=active instanceof HTMLInputElement&&active.type==='text'?{start:active.selectionStart,end:active.selectionEnd}:null;
 const root=createRoot(host,{onUncaughtError(error){failure=error;}});
 const render=()=>{flushSync(()=>root.render(<StrictMode><CustomDrillFields key={epoch} {...state} {...actions}/></StrictMode>));if(failure)throw failure;};
 try{render();host.setAttribute('data-react-custom-editor','');if(focusId){const input=host.querySelector<HTMLElement>('#'+focusId)!;input.focus();if(selection)(input as HTMLInputElement).setSelectionRange(selection.start,selection.end);}}
 catch(error){flushSync(()=>root.unmount());host.replaceChildren(...backup);active?.focus();throw error;}
 return{
  update(next:State){if(disposed)return;state={...state,...next};render();},
  reset(next:State){if(disposed)return;const actionValue=next.actionValue??host.querySelector<HTMLSelectElement>('#customAction')!.value;state={...state,...next,actionValue};epoch++;render();},
  dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-custom-editor');flushSync(()=>root.unmount());},
 };
}
