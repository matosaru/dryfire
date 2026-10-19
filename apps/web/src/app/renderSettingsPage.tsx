import {renderToStaticMarkup} from 'react-dom/server';
import {SettingsPage} from '../pages/SettingsPage/index.ts';
/** Private controls remain an explicit native island until their runtime handoff. */
export function renderSettingsPage(preview:string){
 return renderToStaticMarkup(<SettingsPage preview="{{previewControls}}"/>).replace('{{previewControls}}',()=>preview);
}
