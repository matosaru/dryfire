import {renderToStaticMarkup} from 'react-dom/server';
import {LearnPage} from '../pages/LearnPage/index.ts';
export function renderLearnPage(calibration:string){return renderToStaticMarkup(<LearnPage calibration="{{calibrationCatalog}}"/>).replace('{{calibrationCatalog}}',()=>calibration);}
