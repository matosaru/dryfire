export type SequenceReviewProps={prefix?:string;onAction?:(id:string)=>void};
/** Shared live/example structure; capture, timers, state transitions and saving remain controller-owned. */
export function SequenceReview({prefix='',onAction}:SequenceReviewProps){
 const id=(value:string)=>prefix+value;
 return (
<div id={id('sessionReview')} className="hidden">
        <section className="session-review-card" aria-labelledby={id('sessionReviewStatus')}><h3 id={id('sessionReviewStatus')}>Session review</h3><div id={id('sessionReviewSummary')}></div><p className="session-saved-note">Saved on this device</p></section>
        <section className="session-records" aria-labelledby={id('sessionRecordsTitle')}><h3 id={id('sessionRecordsTitle')}>Repetition results</h3><div id={id('sessionResultList')} className="session-result-list"></div></section>
        <div className="session-review-actions"><button id={id('repeatSessionBtn')} type="button" className="button primary wide-action" onClick={()=>onAction?.('repeatSessionBtn')}>Repeat Session</button><button id={id('backToDrillsBtn')} type="button" className="button secondary wide-action" onClick={()=>onAction?.('backToDrillsBtn')}>Back to Drills</button></div>
        <p className="muted small session-timing-note">Times reflect sound detection. The app cannot verify physical actions or whether a firearm is unloaded.</p>
      </div>
 );
}
