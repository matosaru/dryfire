export type SequenceRunProps={prefix?:string;onAction?:(id:string)=>void};
/** Shared live/example structure; capture, timers, state transitions and saving remain controller-owned. */
export function SequenceRun({prefix='',onAction}:SequenceRunProps){
 const id=(value:string)=>prefix+value;
 return (
<div id={id('sessionRun')} className="hidden">
        <div className="session-progress" aria-label="Session progress">
          <div><span>Completed</span><strong id={id('sessionCompletedCount')}>0</strong></div>
          <progress id={id('sessionProgressMeter')} max="10" value="0" aria-label="Completed repetitions"></progress>
          <div><span>Left</span><strong id={id('sessionLeftCount')}>10</strong></div>
        </div>
        <div className="session-countdown-panel">
          <p className="eyebrow">Current repetition</p>
          <div id={id('sessionCountdown')} className="session-countdown" role="timer" aria-live="off">—</div>
          <p id={id('sessionAnnouncement')} className="session-announcement" role="status" aria-live="polite">Get ready…</p>
          <p id={id('sessionMicrophoneStatus')} className="listening-indicator" role="status">Microphone inactive</p>
        </div>
        <section className="session-latest" aria-labelledby={id('sessionLatestTitle')}><h3 id={id('sessionLatestTitle')}>Latest repetition</h3><div id={id('sessionLatestResult')} className="session-result-card"><p className="muted small">Your completed repetition will appear here.</p></div></section>
        <div className="session-run-actions"><button id={id('pauseSessionBtn')} type="button" className="button secondary" onClick={()=>onAction?.('pauseSessionBtn')}>Pause</button><button id={id('resumeSessionBtn')} type="button" className="button primary hidden" onClick={()=>onAction?.('resumeSessionBtn')}>Resume</button><button id={id('endSessionBtn')} type="button" className="button secondary" onClick={()=>onAction?.('endSessionBtn')}>End Session</button></div>
        <p className="muted small session-timing-note">Pause releases the microphone and restarts the unfinished repetition with a fresh countdown on Resume.</p>
      </div>
 );
}
