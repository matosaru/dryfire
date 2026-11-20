import type {LiveListenPanelProps} from '../../index.ts';
export function LiveResultPanel({state,copy,onAction,onChange}:LiveListenPanelProps){return <><div id="predictionEmpty" className={'prediction empty'+((state?.hidden?.predictionEmpty??false)?' hidden':'')}>{state?.texts?.['predictionEmpty']??copy.result.empty}</div>
      <div id="predictionCard" className={'prediction'+((state?.hidden?.predictionCard??true)?' hidden':'')} aria-live="polite">
        <p className="eyebrow">{copy.result.latest}</p>
        <div className="prediction-row"><div><h3 id="predictionLabel">{state?.texts?.['predictionLabel']??'—'}</h3><p id="predictionConfidence" className="muted">{state?.texts?.['predictionConfidence']??'—'}</p></div><div id="predictionScore" className="score">{state?.texts?.['predictionScore']??'—'}</div></div>
        <div id="distanceBars" className="distance-list">{state?.distances?.map(row=><div key={row.title} className="distance-row"><div className="distance-label"><span>{row.title}</span><span>{row.value}</span></div><div className="bar"><span style={{width:row.width}}/></div></div>)}</div>
        <p className="small muted">{copy.result.noteBefore} <strong>{copy.result.noteEmphasis}</strong>{copy.result.noteAfter}</p>
        <div className="verify-inline">
          <label htmlFor="latestActual">{copy.timeline.actual}</label>
          <div className="verify-inline-controls">
            <select id="latestActual" disabled={state?.disabled?.latestActual} defaultValue={state?.selects?.latestActual} onChange={()=>onChange?.('latestActual')}>
              <option value="">{copy.timeline.choose}</option>
              <option value="draw">{copy.timeline.draw}</option><option value="rack">{copy.timeline.rack}</option>
              <option value="trigger">{copy.timeline.trigger}</option><option value="reload">{copy.timeline.reload}</option>
              <option value="other">{copy.timeline.other}</option>
            </select>
            <button id="verifyLatestBtn" disabled={state?.disabled?.verifyLatestBtn} onClick={()=>onAction?.('verifyLatestBtn')} type="button" className="button secondary">{copy.timeline.verify}</button>
          </div>
          <p className="small muted">{copy.timeline.verificationNote}</p>
        </div>
      </div></>;}
