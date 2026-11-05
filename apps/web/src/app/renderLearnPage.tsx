import {renderToStaticMarkup} from 'react-dom/server';
import {LearnPage} from '../pages/LearnPage/index.ts';
export function renderLearnPage(calibration:string,profileCss?:string){return renderToStaticMarkup(<LearnPage profileCss={profileCss} calibration="{{calibrationCatalog}}"/>).replace('{{calibrationCatalog}}',()=>calibration);}
