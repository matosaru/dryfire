import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {SavedSessionList,type SavedSessionSummary} from '@dryfire/ui/SavedSessionList';
import {RecognitionList,type RecognitionRow} from '@dryfire/ui/RecognitionList';
import {EvaluationPanel,type Evaluation} from '@dryfire/ui/EvaluationPanel';
export type HistoryState={gunName?:string;contextHidden?:boolean;sessions?:SavedSessionSummary[];rows?:RecognitionRow[];options?:{value:string;title:string}[];evaluation?:Evaluation;texts?:Record<string,string>;disabled?:Record<string,boolean>};
export type HistoryPageProps={state?:HistoryState;limit?:ReactNode;progress?:ReactNode;onBack?:()=>void;onAction?:(id:string)=>void;onOpen?:(record:SavedSessionSummary)=>void;onVerify?:(id:string,value:string)=>void};
export function HistoryPage({state,limit,progress,onBack,onAction,onOpen,onVerify}:HistoryPageProps){return <>
<PageHeading id="history-title" title="History" eyebrow="04 / LOCAL DATA" reactBack={false} onBack={onBack}/>
<p className={'gun-context'+(state?.contextHidden?' hidden':'')}>Saved results for <strong className="gun-context-name">{state?.gunName}</strong>.</p>
{progress}
<section className="saved-sessions-section" aria-labelledby="savedSessionsTitle"><h3 id="savedSessionsTitle">Drill sessions</h3><p className="muted small">Open a session to review completed and interrupted repetitions. Clear saved sessions removes this gun’s practice and sequence results and progress statistics; learned sounds and recognition history stay saved.</p><button id="clearSessionsBtn" disabled={state?.disabled?.clearSessionsBtn} className="button danger" type="button" onClick={()=>onAction?.('clearSessionsBtn')}>Clear saved sessions</button><p id="sessionsClearOutcome" className="muted small" role="status">{state?.texts?.sessionsClearOutcome}</p><div id="savedSessions" className="session-result-list">{state?.sessions&&<SavedSessionList records={state.sessions} onOpen={record=>onOpen?.(record)}/>}</div></section>
<h3 className="recognition-history-heading">Recent recognition results</h3>
{limit}
<p className="muted small">Changing N trims recent recognition history; learned sounds and saved drill sessions stay intact. Label each result to evaluate recognition on your own real-world samples.</p>
<EvaluationPanel value={state?.evaluation}/>
<div id="historyList" className="history-list"><RecognitionList rows={state?.rows} options={state?.options??[]} onVerify={onVerify}/></div>
<button id="clearHistoryBtn" disabled={state?.disabled?.clearHistoryBtn} className="button secondary" type="button" onClick={()=>onAction?.('clearHistoryBtn')}>Clear recognition history</button>
<p id="historyClearOutcome" className="muted small" role="status">{state?.texts?.historyClearOutcome}</p>
</>;}
