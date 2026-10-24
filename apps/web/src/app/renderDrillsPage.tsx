import {renderToStaticMarkup} from 'react-dom/server';
import {DrillsPage} from '../pages/DrillsPage/index.ts';
import {CustomDrillEditor} from '@dryfire/ui/CustomDrillEditor';
export function renderDrillsPage(practice:string){return renderToStaticMarkup(<DrillsPage practice="{{practiceCatalog}}" editor={<CustomDrillEditor/>}/>).replace('{{practiceCatalog}}',()=>practice);}
