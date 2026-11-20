import type {LiveListenPanelProps} from '../../index.ts';
export function LiveCapturePanel({state,copy,onAction,onChange}:LiveListenPanelProps){return <><div className="listen-panel">
        <div className="listen-visual" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
        <p id="trainingSummary" className="muted" role="status" aria-live="polite">{state?.texts?.['trainingSummary']??copy.capture.ready}</p>
        <div className="listener-control">
          <button id="listenBtn" aria-describedby="trainingSummary" disabled={state?.disabled?.listenBtn} onClick={()=>onAction?.('listenBtn')} className={'button primary'+(state?.listening?' listening':'')} type="button">{state?.texts?.['listenBtn']??(state?.listening?copy.capture.stop:copy.capture.start)}</button>
          <button id="singleShotBtn" aria-describedby="trainingSummary" disabled={state?.disabled?.singleShotBtn} onClick={()=>onAction?.('singleShotBtn')} className="button secondary" type="button">{copy.capture.single}</button>
        </div>
        <label className="sensitivity-control" htmlFor="sensitivity">{copy.capture.sensitivity}
          <select id="sensitivity" disabled={state?.disabled?.sensitivity} defaultValue={state?.selects?.sensitivity} onChange={()=>onChange?.('sensitivity')}><option value="normal">{copy.capture.normal}</option><option value="high">{copy.capture.high}</option><option value="low">{copy.capture.low}</option></select>
        </label>
        <p id="listeningIndicator" className={'listening-indicator'+(state?.listening?' is-live':'')} role="status" aria-live="polite">{state?.texts?.['listeningIndicator']??copy.capture.inactive}</p>
        <div className="meter-track" role="img" aria-label={copy.capture.meter}><div id="meterFill" className="meter-fill"></div></div>
        <p className="muted small" id="listenNote">{state?.texts?.['listenNote']??copy.capture.continuousNote}</p>
        <p id="eventCounter" className="eyebrow">{state?.texts?.['eventCounter']??copy.capture.eventCounter}</p>
        <h3 className="timeline-heading">{copy.capture.timeline}</h3>
        <ol id="sessionTimeline" className="session-timeline" aria-live="polite">{state?.timeline?.map((row,index)=><li key={index}><strong>{row.name}</strong><span>{row.detail}</span></li>)}</ol>
      </div></>;}
