import type {ReactNode} from 'react';
export type SessionControlView={texts?:Record<string,string>;classNames?:Record<string,string>;disabled?:Record<string,boolean>};
export type PracticeRunProps={prefix?:string;onAction?:(id:string)=>void;view?:SessionControlView;latest?:ReactNode;meter?:ReactNode;phase?:string;silent?:boolean};
/** Shared live/example structure; outer visibility and capture remain feature-owned. */
export function PracticeRun(props:PracticeRunProps){const {prefix=''}=props;return <div id={prefix+'practiceRun'} className="hidden" data-phase={props.phase}><PracticeRunContents {...props}/></div>;}
export function PracticeRunContents({prefix='',onAction,view,latest,meter,silent=false}:PracticeRunProps){const id=(value:string)=>prefix+value;return <>

        <div className="practice-counters"><div><span id={id('practiceCompletedLabel')}>{view?.texts?.practiceCompletedLabel??'Attempts'}</span><strong id={id('practiceCompleted')}>{view?.texts?.practiceCompleted??'0'}</strong></div><div><span>Shots</span><strong id={id('practiceShots')}>{view?.texts?.practiceShots??'0'}</strong></div><div><span id={id('practiceRemainingLabel')}>{view?.texts?.practiceRemainingLabel??'Left'}</span><strong id={id('practiceRemaining')}>{view?.texts?.practiceRemaining??'10'}</strong></div></div>
        <div className="session-countdown-panel">
          <div id={id('practiceSignal')} className={view?.classNames?.practiceSignal??'session-countdown'} role="timer" aria-live="off">{view?.texts?.practiceSignal??'—'}</div>
          <button id={id('practiceStopBtn')} disabled={view?.disabled?.practiceStopBtn} className={view?.classNames?.practiceStopBtn??'button primary practice-stop hidden'} type="button" aria-label={silent?'Stop example':'Stop practice and save results'} onClick={()=>onAction?.('practiceStopBtn')}>STOP</button>
          {meter??(<div id={id('practiceLevelPanel')} className={view?.classNames?.practiceLevelPanel??'practice-level-panel hidden'}>
            <p className="practice-level-label"><svg className="practice-mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="8" y="2" width="8" height="13" rx="4"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg><span>MICROPHONE INPUT</span></p>
            <div id={id('practiceLevelMeter')} className="practice-level-track" role="meter" aria-label="Microphone input level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}><div id={id('practiceLevelFill')} className="practice-level-fill"></div></div>
            <p className="practice-level-value"><strong id={id('practiceLevelValue')}>0</strong><span>relative level</span></p>
            <p id={id('practiceInputState')} className="muted small">Waiting for audio input…</p>
          </div>)}
          <p id={id('practiceAnnouncement')} className="session-announcement" role="status" aria-live={silent?'off':undefined}>{view?.texts?.practiceAnnouncement??''}</p>
          <p id={id('practiceInputFeedback')} className="practice-input-feedback" role="status" aria-live={silent?'off':undefined}>{view?.texts?.practiceInputFeedback??''}</p>
          <p id={id('practiceMicrophone')} className="listening-indicator" role="status" aria-live={silent?'off':undefined}>{view?.texts?.practiceMicrophone??''}</p><p className="muted small">Active time <strong id={id('practiceElapsed')}>{view?.texts?.practiceElapsed??'0.00 s'}</strong></p>
        </div>
        <div id={id('practiceLatest')} className="session-result-card">{latest??(view?<p className="muted small">Recognized clicks and repetition outcomes appear here.</p>:null)}</div>
        <div className="session-run-actions"><button id={id('practicePauseBtn')} disabled={view?.disabled?.practicePauseBtn} className={view?.classNames?.practicePauseBtn??'button secondary'} type="button" onClick={()=>onAction?.('practicePauseBtn')}>Pause</button><button id={id('practiceResumeBtn')} disabled={view?.disabled?.practiceResumeBtn} className={view?.classNames?.practiceResumeBtn??'button primary hidden'} type="button" onClick={()=>onAction?.('practiceResumeBtn')}>Resume</button><button id={id('practiceNextBtn')} disabled={view?.disabled?.practiceNextBtn} className={view?.classNames?.practiceNextBtn??'button primary hidden'} type="button" onClick={()=>onAction?.('practiceNextBtn')}>Next repetition</button><button id={id('practiceEndBtn')} disabled={view?.disabled?.practiceEndBtn} className={view?.classNames?.practiceEndBtn??'button secondary'} type="button" onClick={()=>onAction?.('practiceEndBtn')}>End Practice</button></div>

</>;}
