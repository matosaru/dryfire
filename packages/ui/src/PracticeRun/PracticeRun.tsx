export type PracticeRunProps={prefix?:string;onAction?:(id:string)=>void};
/** Shared live/example structure; capture, timers, state transitions and saving remain controller-owned. */
export function PracticeRun({prefix='',onAction}:PracticeRunProps){
 const id=(value:string)=>prefix+value;
 return (
<div id={id('practiceRun')} className="hidden">
        <div className="practice-counters"><div><span id={id('practiceCompletedLabel')}>Attempts</span><strong id={id('practiceCompleted')}>0</strong></div><div><span>Shots</span><strong id={id('practiceShots')}>0</strong></div><div><span id={id('practiceRemainingLabel')}>Left</span><strong id={id('practiceRemaining')}>10</strong></div></div>
        <div className="session-countdown-panel">
          <div id={id('practiceSignal')} className="session-countdown" role="timer" aria-live="off">—</div>
          <button id={id('practiceStopBtn')} className="button primary practice-stop hidden" type="button" aria-label="Stop practice and save results" onClick={()=>onAction?.('practiceStopBtn')}>STOP</button>
          <div id={id('practiceLevelPanel')} className="practice-level-panel hidden">
            <p className="practice-level-label"><svg className="practice-mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg><span>MICROPHONE INPUT</span></p>
            <div id={id('practiceLevelMeter')} className="practice-level-track" role="meter" aria-label="Microphone input level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><div id={id('practiceLevelFill')} className="practice-level-fill"></div></div>
            <p className="practice-level-value"><strong id={id('practiceLevelValue')}>0</strong><span>relative level</span></p>
            <p id={id('practiceInputState')} className="muted small">Waiting for audio input…</p>
          </div>
          <p id={id('practiceAnnouncement')} className="session-announcement" role="status"></p>
          <p id={id('practiceInputFeedback')} className="practice-input-feedback" role="status"></p>
          <p id={id('practiceMicrophone')} className="listening-indicator" role="status"></p><p className="muted small">Active time <strong id={id('practiceElapsed')}>0.00 s</strong></p>
        </div>
        <div id={id('practiceLatest')} className="session-result-card"></div>
        <div className="session-run-actions"><button id={id('practicePauseBtn')} className="button secondary" type="button" onClick={()=>onAction?.('practicePauseBtn')}>Pause</button><button id={id('practiceResumeBtn')} className="button primary hidden" type="button" onClick={()=>onAction?.('practiceResumeBtn')}>Resume</button><button id={id('practiceNextBtn')} className="button primary hidden" type="button" onClick={()=>onAction?.('practiceNextBtn')}>Next repetition</button><button id={id('practiceEndBtn')} className="button secondary" type="button" onClick={()=>onAction?.('practiceEndBtn')}>End Practice</button></div>
      </div>
 );
}
