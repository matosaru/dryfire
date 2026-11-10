import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {flushSync} from 'react-dom';
import {SoundCheckPage} from '../pages/SoundCheckPage/index.ts';

/** Sound Check is loaded only when opened so its diagnostic form does not delay Home. */
export function mountSoundCheckPage(host:Element,gunName?:string,initialMeasurementSystem='metric'){
 let disposed=false;
 const root=createRoot(host);
 let measurementSystem=initialMeasurementSystem;
 const render=()=>flushSync(()=>root.render(<StrictMode><SoundCheckPage gunName={gunName} measurementSystem={measurementSystem}/></StrictMode>));
 render();
 host.setAttribute('data-react-sound-check','');
 return{updateUnits(value:string){if(disposed)return;measurementSystem=value;render();},dispose(){if(disposed)return;disposed=true;host.removeAttribute('data-react-sound-check');flushSync(()=>root.unmount());}};
}
