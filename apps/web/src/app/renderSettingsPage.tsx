import {renderToStaticMarkup} from 'react-dom/server';
import {SettingsPage} from '../pages/SettingsPage/index.ts';
import {LocalizationProvider} from '../localization/runtime.ts';
import english from '../localization/generated/catalog.en.ts';
/** Private controls remain an explicit native island until their runtime handoff. */
export function renderSettingsPage(preview:string){
 return renderToStaticMarkup(<LocalizationProvider value={{locale:'en',catalog:english}}><SettingsPage preview="{{previewControls}}"/></LocalizationProvider>).replace('{{previewControls}}',()=>preview);
}
