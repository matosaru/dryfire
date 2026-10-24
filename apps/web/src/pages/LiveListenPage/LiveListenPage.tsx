import {PageHeading} from '@dryfire/ui/PageHeading';
export type LiveListenState={gunName?:string;contextHidden?:boolean;texts?:Record<string,string>;disabled?:Record<string,boolean>;hidden?:Record<string,boolean>;selects?:Record<string,string>;listening?:boolean;options?:{value:string;title:string}[];steps?:{className:string;number:string;title:string}[];distances?:{title:string;value:string;width:string}[];timeline?:{name:string;detail:string}[]};
export type LiveListenPageProps={state?:LiveListenState;onBack?:()=>void;onAction?:(id:string)=>void;onChange?:(id:string)=>void};
/** Live presentation only: microphone, recognition, persistence and timing remain feature-owned. */
export function LiveListenPage({state,onBack,onAction,onChange}:LiveListenPageProps){return <>
<PageHeading id="recognize-title" title="Live Listen" eyebrow="03 / REAL-TIME DETECTION" reactBack={false} onBack={onBack}/>
      <p className={state?.contextHidden?"gun-context hidden":"gun-context"}>Listening uses the learned sounds of <strong className="gun-context-name">{state?.gunName}</strong>.</p>
      <section className="drill-panel" aria-labelledby="drill-heading">
        <div className="drill-panel-head">
          <div><p className="eyebrow">CURRENT MODE</p><h3 id="drill-heading">{state?.texts?.['drill-heading']??'Free listening'}</h3></div>
          <span id="drillProgressBadge" className="drill-badge">{state?.texts?.['drillProgressBadge']??'Free listen'}</span>
        </div>
        <label className="drill-select-label hidden" htmlFor="drillSelect">Training mode
          <select id="drillSelect" disabled={state?.disabled?.drillSelect} defaultValue={state?.selects?.drillSelect} onChange={()=>onChange?.('drillSelect')}>{state?.options?state.options.map(option=><option key={option.value} value={option.value}>{option.title}</option>):<>
            <option value="">Free listen · recognize any sound</option>
            <option value="trigger-only">1 · Trigger pull</option>
            <option value="rack-trigger">2 · Rack slide → Trigger pull</option>
            <option value="mag-trigger">3 · Magazine change → Trigger pull</option>
            <option value="draw-mag-trigger">4 · Draw from holster → Magazine change → Trigger pull</option>
          </>}</select>
        </label>
        <p id="drillExplanation" className="muted small">{state?.texts?.['drillExplanation']??'Classify each separate sound as it happens.'}</p>
        <button id="changeDrillBtn" disabled={state?.disabled?.changeDrillBtn} onClick={()=>onAction?.('changeDrillBtn')} className="button secondary drill-change" type="button">Change mode / choose drill</button>
        <ol id="drillSteps" className="drill-steps" aria-label="Expected sound sequence">{state?.steps?.map((step,index)=><li key={index} className={step.className}><span className="step-number">{step.number}</span><span>{step.title}</span></li>)}</ol>
        <div id="drillStats" className={'drill-stats'+((state?.hidden?.drillStats??true)?' hidden':'')} aria-live="polite">
          <span><strong id="drillCompleted">{state?.texts?.['drillCompleted']??'0'}</strong> completed</span>
          <span><strong id="drillIncorrect">{state?.texts?.['drillIncorrect']??'0'}</strong> out of order</span>
          <span><strong id="drillUnknown">{state?.texts?.['drillUnknown']??'0'}</strong> unknown</span>
        </div>
        <p id="drillFeedback" className="drill-feedback" role="status" aria-live="polite">{state?.texts?.['drillFeedback']??''}</p>
        <button id="resetDrillBtn" disabled={state?.disabled?.resetDrillBtn} onClick={()=>onAction?.('resetDrillBtn')} type="button" className={'button secondary'+((state?.hidden?.resetDrillBtn??true)?' hidden':'')}>Reset drill counters</button>
        <p className="muted small">A completed drill means the app detected the selected sequence in order, not that the actions were physically verified. Unknown sounds do not advance the sequence.</p>
      </section>
      <div className="listen-panel">
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
      </div>
      <div id="predictionEmpty" className={'prediction empty'+((state?.hidden?.predictionEmpty??false)?' hidden':'')}>{state?.texts?.['predictionEmpty']??'Your next recognition result will appear here.'}</div>
      <div id="predictionCard" className={'prediction'+((state?.hidden?.predictionCard??true)?' hidden':'')} aria-live="polite">
        <p className="eyebrow">LATEST RESULT</p>
        <div className="prediction-row"><div><h3 id="predictionLabel">{state?.texts?.['predictionLabel']??'—'}</h3><p id="predictionConfidence" className="muted">{state?.texts?.['predictionConfidence']??'—'}</p></div><div id="predictionScore" className="score">{state?.texts?.['predictionScore']??'—'}</div></div>
        <div id="distanceBars" className="distance-list">{state?.distances?.map(row=><div key={row.title} className="distance-row"><div className="distance-label"><span>{row.title}</span><span>{row.value}</span></div><div className="bar"><span style={{width:row.width}}/></div></div>)}</div>
        <p className="small muted">Scores and similarity distances are experimental and are <strong>not calibrated probabilities</strong>. Confirm matches yourself.</p>
        <div className="verify-inline">
          <label htmlFor="latestActual">What sound did you actually make?</label>
          <div className="verify-inline-controls">
            <select id="latestActual" disabled={state?.disabled?.latestActual} defaultValue={state?.selects?.latestActual} onChange={()=>onChange?.('latestActual')}>
              <option value="">Choose actual sound…</option>
              <option value="draw">Draw from holster</option><option value="rack">Rack slide</option>
              <option value="trigger">Trigger pull</option><option value="reload">Change magazine</option>
              <option value="other">Other / background noise</option>
            </select>
            <button id="verifyLatestBtn" disabled={state?.disabled?.verifyLatestBtn} onClick={()=>onAction?.('verifyLatestBtn')} type="button" className="button secondary">Verify</button>
          </div>
          <p className="small muted">Verification labels are used for accuracy evaluation, not automatic retraining.</p>
        </div>
      </div>
</>;}
