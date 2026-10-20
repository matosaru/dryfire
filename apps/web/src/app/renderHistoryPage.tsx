import {renderToStaticMarkup} from 'react-dom/server';
import {HistoryPage} from '../pages/HistoryPage/index.ts';
export function renderHistoryPage(progress:string,limit:string){return renderToStaticMarkup(<HistoryPage progress="{{historyProgress}}" limit={<div className="settings-row"><label htmlFor="maxResults">Keep last N recognition results</label>{'{{historyLimit}}'}</div>}/>).replace('{{historyProgress}}',()=>progress).replace('{{historyLimit}}',()=>limit);}
