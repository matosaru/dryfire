import type {ReactNode} from 'react';
import type {SessionControlView} from '../PracticeRun/PracticeRun.tsx';
export type SequenceRunProps={prefix?:string;onAction?:(id:string)=>void;view?:SessionControlView&{progress?:{max:number;value:number}};latest?:ReactNode};
/** Shared live/example structure; outer visibility and capture remain feature-owned. */
export function SequenceRun(props:SequenceRunProps){const {prefix=''}=props;return <div id={prefix+'sessionRun'} className="hidden"><SequenceRunContents {...props}/></div>;}
export function SequenceRunContents({prefix='',onAction,view,latest}:SequenceRunProps){const id=(value:string)=>prefix+value;return <>

        <div className="session-progress" aria-label="Session progress">
          <div><span>Completed</span><strong id={id('sessionCompletedCount')}>{view?.texts?.sessionCompletedCount??'0'}</strong></div>
          <progress id={id('sessionProgressMeter')} max={view?.progress?.max??10} value={view?.progress?.value??0} aria-label="Completed repetitions"></progress>
          <div><span>Left</span><strong id={id('sessionLeftCount')}>{view?.texts?.sessionLeftCount??'10'}</strong></div>
        </div>
        <div className="session-countdown-panel">
          <p className="eyebrow">Current repetition</p>
          <div id={id('sessionCountdown')} className={view?.classNames?.sessionCountdown??'session-countdown'} role="timer" aria-live="off">{view?.texts?.sessionCountdown??'—'}</div>
          <p id={id('sessionAnnouncement')} className="session-announcement" role="status" aria-live="polite">{view?.texts?.sessionAnnouncement??'Get ready…'}</p>
          <p id={id('sessionMicrophoneStatus')} className={view?.classNames?.sessionMicrophoneStatus??'listening-indicator'} role="status">{view?.texts?.sessionMicrophoneStatus??'Microphone inactive'}</p>
        </div>
        <section className="session-latest" aria-labelledby={id('sessionLatestTitle')}><h3 id={id('sessionLatestTitle')}>Latest repetition</h3><div id={id('sessionLatestResult')} className="session-result-card">{latest??<p className="muted small">Your completed repetition will appear here.</p>}</div></section>
        <div className="session-run-actions"><button id={id('pauseSessionBtn')} disabled={view?.disabled?.pauseSessionBtn} type="button" className={view?.classNames?.pauseSessionBtn??'button secondary'} onClick={()=>onAction?.('pauseSessionBtn')}>Pause</button><button id={id('resumeSessionBtn')} disabled={view?.disabled?.resumeSessionBtn} type="button" className={view?.classNames?.resumeSessionBtn??'button primary hidden'} onClick={()=>onAction?.('resumeSessionBtn')}>Resume</button><button id={id('endSessionBtn')} disabled={view?.disabled?.endSessionBtn} type="button" className="button secondary" onClick={()=>onAction?.('endSessionBtn')}>End Session</button></div>
        <p className="muted small session-timing-note">Pause releases the microphone and restarts the unfinished repetition with a fresh countdown on Resume.</p>

</>;}
