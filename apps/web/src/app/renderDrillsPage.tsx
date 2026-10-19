import {renderToStaticMarkup} from 'react-dom/server';
import {DrillsPage} from '../pages/DrillsPage/index.ts';
export function renderDrillsPage(practice:string,editor:string){return renderToStaticMarkup(<DrillsPage practice="{{practiceCatalog}}" editor="{{customEditor}}"/>).replace('{{practiceCatalog}}',()=>practice).replace('{{customEditor}}',()=>editor);}
