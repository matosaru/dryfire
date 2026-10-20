import {Fragment} from 'react';
export type ProgressModel={empty?:string;timing?:string;cards?:{label:string;value:string}[];trend?:string;metric?:string;chart?:{label:string;grid:{y:number;label:string}[];line:string;dots:{x:number;y:number;title:string}[];dates:{x:number;anchor:'start'|'end';text:string}[];note:string;rows:string[][]}};
/** Stateless chart, accessible table and summary; no grouping, storage or feature entitlement. */
export function ProgressContent({model}:{model:ProgressModel}){const chart=model.chart;return <>
{model.timing!==undefined&&<p className="muted small">{model.timing}</p>}
{model.cards&&<div className="progress-stats">{model.cards.map(card=><div className="" key={card.label}><span className="">{card.label}</span><strong className="">{card.value}</strong></div>)}</div>}
{model.trend!==undefined&&<p className="progress-trend">{model.trend}</p>}
{model.metric!==undefined&&<h4 className="">{model.metric}</h4>}
{model.empty&&<p className="empty-state">{model.empty}</p>}
{chart&&<><svg viewBox="0 0 600 230" role="img" aria-label={chart.label} className="progress-chart">
{chart.grid.map((row,index)=><Fragment key={index}><line x1="72" x2="576" y1={row.y} y2={row.y} className="progress-gridline"/><text x="64" y={row.y+4} textAnchor="end">{row.label}</text></Fragment>)}
<polyline points={chart.line} fill="none" className="progress-line"/>
{chart.dots.map((dot,index)=><circle key={index} cx={dot.x} cy={dot.y} r="5" className="progress-dot"><title>{dot.title}</title></circle>)}
{chart.dates.map((date,index)=><text key={index} x={date.x} y="209" textAnchor={date.anchor}>{date.text}</text>)}
</svg><p className="muted small">{chart.note}</p><details className="progress-data"><summary className="">View values and sample counts</summary><table className=""><thead className=""><tr className="">{['Session date',model.metric,'Timed samples','Hits / misses'].map(title=><th className="" scope="col" key={title}>{title}</th>)}</tr></thead><tbody className="">{chart.rows.map((row,index)=><tr className="" key={index}>{row.map((value,index)=><td className="" key={index}>{value}</td>)}</tr>)}</tbody></table></details></>}
</>;}
