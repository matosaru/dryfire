import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {SoundCheckPage} from '../pages/SoundCheckPage/index.ts';

/** Sound Check is loaded only when opened so its diagnostic form does not delay Home. */
export function mountSoundCheckPage(host:Element,gunName?:string){
 let disposed=false;
 const root=createRoot(host);
 flushSync(()=>root.render(<StrictMode><SoundCheckPage gunName={gunName}/></StrictMode>));
 host.setAttribute('data-react-sound-check','');
 return{dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-sound-check');flushSync(()=>root.unmount());}};
}
