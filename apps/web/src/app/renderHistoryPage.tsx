import {renderToStaticMarkup} from 'react-dom/server';
import {HistoryPage} from '../pages/HistoryPage/index.ts';
export function renderHistoryPage(progress:string,limit:string,limitLabel='Keep last N recognition results'){return renderToStaticMarkup(<HistoryPage progress="{{historyProgress}}" limit={<div className="settings-row"><label htmlFor="maxResults">{'{{historyLimitLabel}}'}</label>{'{{historyLimit}}'}</div>}/>).replace('{{historyProgress}}',()=>progress).replace('{{historyLimit}}',()=>limit).replace('{{historyLimitLabel}}',()=>limitLabel);}
