import type {LiveListenPanelProps} from '../../index.ts';
export function LiveModePanel({state,onAction,onChange}:LiveListenPanelProps){return <><section className="drill-panel" aria-labelledby="drill-heading">
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
      </section></>;}
