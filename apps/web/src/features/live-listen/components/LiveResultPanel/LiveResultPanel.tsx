import type {LiveListenPanelProps} from '../../index.ts';
export function LiveResultPanel({state,onAction,onChange}:LiveListenPanelProps){return <><div id="predictionEmpty" className={'prediction empty'+((state?.hidden?.predictionEmpty??false)?' hidden':'')}>{state?.texts?.['predictionEmpty']??'Your next recognition result will appear here.'}</div>
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
      </div></>;}
