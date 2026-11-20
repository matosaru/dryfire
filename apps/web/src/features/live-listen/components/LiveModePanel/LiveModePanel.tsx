import type {LiveListenPanelProps} from '../../index.ts';
export function LiveModePanel({state,copy,onAction,onChange}:LiveListenPanelProps){return <><section className="drill-panel" aria-labelledby="drill-heading">
        <div className="drill-panel-head">
          <div><p className="eyebrow">{copy.mode.eyebrow}</p><h3 id="drill-heading">{state?.texts?.['drill-heading']??copy.mode.free}</h3></div>
          <span id="drillProgressBadge" className="drill-badge">{state?.texts?.['drillProgressBadge']??copy.mode.badge}</span>
        </div>
        <label className="drill-select-label hidden" htmlFor="drillSelect">{copy.mode.training}
          <select id="drillSelect" disabled={state?.disabled?.drillSelect} defaultValue={state?.selects?.drillSelect} onChange={()=>onChange?.('drillSelect')}>{state?.options?state.options.map(option=><option key={option.value} value={option.value}>{option.title}</option>):<>
            <option value="">{copy.mode.freeOption}</option>
            <option value="trigger-only">{copy.mode.trigger}</option>
            <option value="rack-trigger">{copy.mode.rack}</option>
            <option value="mag-trigger">{copy.mode.magazine}</option>
            <option value="draw-mag-trigger">{copy.mode.draw}</option>
          </>}</select>
        </label>
        <p id="drillExplanation" className="muted small">{state?.texts?.['drillExplanation']??copy.mode.explanation}</p>
        <button id="changeDrillBtn" disabled={state?.disabled?.changeDrillBtn} onClick={()=>onAction?.('changeDrillBtn')} className="button secondary drill-change" type="button">{copy.mode.change}</button>
        <ol id="drillSteps" className="drill-steps" aria-label={copy.mode.steps}>{state?.steps?.map((step,index)=><li key={index} className={step.className}><span className="step-number">{step.number}</span><span>{step.title}</span></li>)}</ol>
        <div id="drillStats" className={'drill-stats'+((state?.hidden?.drillStats??true)?' hidden':'')} aria-live="polite">
          <span><strong id="drillCompleted">{state?.texts?.['drillCompleted']??'0'}</strong> {copy.mode.completed}</span>
          <span><strong id="drillIncorrect">{state?.texts?.['drillIncorrect']??'0'}</strong> {copy.mode.outOfOrder}</span>
          <span><strong id="drillUnknown">{state?.texts?.['drillUnknown']??'0'}</strong> {copy.mode.unknown}</span>
        </div>
        <p id="drillFeedback" className="drill-feedback" role="status" aria-live="polite">{state?.texts?.['drillFeedback']??''}</p>
        <button id="resetDrillBtn" disabled={state?.disabled?.resetDrillBtn} onClick={()=>onAction?.('resetDrillBtn')} type="button" className={'button secondary'+((state?.hidden?.resetDrillBtn??true)?' hidden':'')}>{copy.mode.reset}</button>
        <p className="muted small">{copy.mode.note}</p>
      </section></>;}
