import type {LiveListenPanelProps} from '../../index.ts';
export function LiveCapturePanel({state,onAction,onChange}:LiveListenPanelProps){return <><div className="listen-panel">
        <div className="listen-visual" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
        <p id="trainingSummary" className="muted" role="status" aria-live="polite"
          data-reason-gun="Choose a gun before listening."
          data-reason-loading="Loading this gun's sound profiles. Please wait."
          data-reason-busy="Finish recording or testing the current sound before listening."
          data-reason-saving="Saving preferences. Please wait."
          data-reason-connecting="Connecting microphone… Allow permission or leave this screen to cancel."
          data-reason-unsaved="Save the pending drill results before listening. Use Retry on the results page."
          data-reason-session="Finish or leave the active drill before listening."
          data-reason-training="Learn at least {minimum} trigger examples ({count}/{minimum}) for this gun. Open Learn to record them. Other sound types are optional.">{state?.texts?.['trainingSummary']??'Checking sound profiles…'}</p>
        <div className="listener-control">
          <button id="listenBtn" aria-describedby="trainingSummary" disabled={state?.disabled?.listenBtn} onClick={()=>onAction?.('listenBtn')} className={'button primary'+(state?.listening?' listening':'')} type="button">{state?.texts?.['listenBtn']??'Start continuous listening'}</button>
          <button id="singleShotBtn" aria-describedby="trainingSummary" disabled={state?.disabled?.singleShotBtn} onClick={()=>onAction?.('singleShotBtn')} className="button secondary" type="button">Single sound test</button>
        </div>
        <label className="sensitivity-control" htmlFor="sensitivity">Detection sensitivity
          <select id="sensitivity" disabled={state?.disabled?.sensitivity} defaultValue={state?.selects?.sensitivity} onChange={()=>onChange?.('sensitivity')}><option value="normal">Normal</option><option value="high">High (quieter events)</option><option value="low">Low (noisier rooms)</option></select>
        </label>
        <p id="listeningIndicator" className={'listening-indicator'+(state?.listening?' is-live':'')} role="status" aria-live="polite">{state?.texts?.['listeningIndicator']??'Microphone inactive'}</p>
        <div className="meter-track" role="img" aria-label="Live microphone level"><div id="meterFill" className="meter-fill"></div></div>
        <p className="muted small" id="listenNote">{state?.texts?.['listenNote']??'Continuous mode stays active through multiple separate actions. Pause briefly between sounds; tap Stop when finished. Single sound test records one sound and stops.'}</p>
        <p id="eventCounter" className="eyebrow">{state?.texts?.['eventCounter']??'0 detected · 0 discarded'}</p>
        <h3 className="timeline-heading">Detected actions this session (newest first)</h3>
        <ol id="sessionTimeline" className="session-timeline" aria-live="polite">{state?.timeline?.map((row,index)=><li key={index}><strong>{row.name}</strong><span>{row.detail}</span></li>)}</ol>
      </div></>;}
