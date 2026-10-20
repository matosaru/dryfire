export type PracticeReviewProps={prefix?:string;onAction?:(id:string)=>void};
/** Shared live/example structure; capture, timers, state transitions and saving remain controller-owned. */
export function PracticeReview({prefix='',onAction}:PracticeReviewProps){
 const id=(value:string)=>prefix+value;
 return (
<div id={id('practiceReview')} className="hidden"><section className="session-review-card"><h3 id={id('practiceReviewStatus')}>Practice review</h3><div id={id('practiceSummary')}></div><p id={id('practiceSaved')} className="session-saved-note"></p><button id={id('practiceRetryBtn')} type="button" className="button secondary wide-action hidden" onClick={()=>onAction?.('practiceRetryBtn')}>Retry saving results</button></section><div id={id('practiceResults')} className="session-result-list"></div><button id={id('practiceRepeatBtn')} type="button" className="button primary wide-action" onClick={()=>onAction?.('practiceRepeatBtn')}>Repeat Practice</button><button id={id('practiceDoneBtn')} type="button" className="button secondary wide-action" onClick={()=>onAction?.('practiceDoneBtn')}>Back to Drills</button></div>
 );
}
