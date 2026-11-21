import type {ReactNode} from 'react';
import type {SessionControlView} from '../PracticeRun/PracticeRun.tsx';
export type SequenceRunProps={prefix?:string;onAction?:(id:string)=>void;view?:SessionControlView&{progress?:{max:number;value:number}};latest?:ReactNode;silent?:boolean;labels:Record<string,string>};
/** Shared live/example structure; outer visibility and capture remain feature-owned. */
export function SequenceRun(props:SequenceRunProps){const {prefix=''}=props;return <div id={prefix+'sessionRun'} className="hidden"><SequenceRunContents {...props}/></div>;}
export function SequenceRunContents({prefix='',onAction,view,latest,silent=false,labels}:SequenceRunProps){const id=(value:string)=>prefix+value;return <>

        <div className="session-progress" aria-label={labels.sessionProgress}>
          <div><span>{labels.completed}</span><strong id={id('sessionCompletedCount')}>{view?.texts?.sessionCompletedCount??'0'}</strong></div>
          <progress id={id('sessionProgressMeter')} max={view?.progress?.max??10} value={view?.progress?.value??0} aria-label={labels.completedRepetitions}></progress>
          <div><span>{labels.left}</span><strong id={id('sessionLeftCount')}>{view?.texts?.sessionLeftCount??'10'}</strong></div>
        </div>
        <div className="session-countdown-panel">
          <p className="eyebrow">{labels.currentRepetition}</p>
          <div id={id('sessionCountdown')} className={view?.classNames?.sessionCountdown??'session-countdown'} role="timer" aria-live="off">{view?.texts?.sessionCountdown??'—'}</div>
          <p id={id('sessionAnnouncement')} className="session-announcement" role="status" aria-live={silent?'off':'polite'}>{view?.texts?.sessionAnnouncement??labels.getReady}</p>
          <p id={id('sessionMicrophoneStatus')} className={view?.classNames?.sessionMicrophoneStatus??'listening-indicator'} role="status" aria-live={silent?'off':undefined}>{view?.texts?.sessionMicrophoneStatus??labels.microphoneInactive}</p>
        </div>
        <section className="session-latest" aria-labelledby={id('sessionLatestTitle')}><h3 id={id('sessionLatestTitle')}>{labels.latestRepetition}</h3><div id={id('sessionLatestResult')} className="session-result-card">{latest??<p className="muted small">{labels.latestEmpty}</p>}</div></section>
        <div className="session-run-actions"><button id={id('pauseSessionBtn')} disabled={view?.disabled?.pauseSessionBtn} type="button" className={view?.classNames?.pauseSessionBtn??'button secondary'} onClick={()=>onAction?.('pauseSessionBtn')}>{labels.pause}</button><button id={id('resumeSessionBtn')} disabled={view?.disabled?.resumeSessionBtn} type="button" className={view?.classNames?.resumeSessionBtn??'button primary hidden'} onClick={()=>onAction?.('resumeSessionBtn')}>{labels.resume}</button><button id={id('endSessionBtn')} disabled={view?.disabled?.endSessionBtn} type="button" className="button secondary" onClick={()=>onAction?.('endSessionBtn')}>{labels.endSession}</button></div>
        <p className="muted small session-timing-note">{labels.pauseNote}</p>

</>;}
