import {GunContext} from '@dryfire/ui/GunContext';
import type {ReactNode} from 'react';
import {PageHeading} from '@dryfire/ui/PageHeading';
import {SavedSessionList,type SavedSessionSummary} from '@dryfire/ui/SavedSessionList';
import {RecognitionList,type RecognitionRow} from '@dryfire/ui/RecognitionList';
import {EvaluationPanel,type Evaluation} from '@dryfire/ui/EvaluationPanel';
export type HistoryState={gunName?:string;contextHidden?:boolean;sessions?:SavedSessionSummary[];rows?:RecognitionRow[];options?:{value:string;title:string}[];evaluation?:Evaluation;texts?:Record<string,string>;disabled?:Record<string,boolean>};
export type HistoryPageProps={state?:HistoryState;limit?:ReactNode;progress?:ReactNode;onBack?:()=>void;onAction?:(id:string)=>void;onOpen?:(record:SavedSessionSummary)=>void;onVerify?:(id:string,value:string)=>void;onDeleteSession?:(record:SavedSessionSummary)=>void;onDeleteEvent?:(row:RecognitionRow)=>void};
export function HistoryPage({state,limit,progress,onBack,onAction,onOpen,onVerify,onDeleteSession,onDeleteEvent}:HistoryPageProps){return <>
<PageHeading id="history-title" title="History" eyebrow="04 / LOCAL DATA" reactBack={false} onBack={onBack}/>
<GunContext name={state?.gunName} hidden={state?.contextHidden} prefix="Saved results for " suffix="."/>
{progress}
<section className="saved-sessions-section" aria-labelledby="savedSessionsTitle"><h3 id="savedSessionsTitle">Drill sessions</h3><p className="muted small">Open a session to review it, or delete one saved session. Clear saved sessions removes all this gun’s practice and sequence results and progress statistics; learned sounds and recognition history stay saved.</p><button id="clearSessionsBtn" disabled={state?.disabled?.clearSessionsBtn} className="button danger" type="button" onClick={()=>onAction?.('clearSessionsBtn')}>Clear saved sessions</button><p id="sessionsClearOutcome" className="muted small" role="status">{state?.texts?.sessionsClearOutcome}</p><div id="savedSessions" className="session-result-list">{state?.sessions&&<SavedSessionList records={state.sessions} onOpen={record=>onOpen?.(record)} onDelete={onDeleteSession} disabled={state?.disabled?.historyRecordActions}/>}</div></section>
<h3 className="recognition-history-heading">Recent recognition results</h3>
{limit}
<p className="muted small">Changing N trims recent recognition history; learned sounds and saved drill sessions stay intact. Label each result to evaluate recognition on your own real-world samples.</p>
<EvaluationPanel value={state?.evaluation}/>
<div id="historyList" className="history-list"><RecognitionList rows={state?.rows} options={state?.options??[]} onVerify={onVerify} onDelete={onDeleteEvent} disabled={state?.disabled?.historyRecordActions}/></div>
<button id="clearHistoryBtn" disabled={state?.disabled?.clearHistoryBtn} className="button secondary" type="button" onClick={()=>onAction?.('clearHistoryBtn')}>Clear recognition history</button>
<p id="historyClearOutcome" className="muted small" role="status">{state?.texts?.historyClearOutcome}</p>
</>;}
