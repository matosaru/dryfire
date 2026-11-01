export type TriggerProfileQuality={status:'needs-samples'|'variable'|'stable';title:string;message:string;sampleCount:number;needed:number;outlierIndexes:number[]};

/** Read-only learning guidance; sample ownership and capture remain feature-owned. */
export function TriggerProfileStatus({quality}:{quality:TriggerProfileQuality}){
 const symbol=quality.status==='stable'?'✓':quality.status==='variable'?'!':'…';
 return <section id="triggerProfileStatus" className={`trigger-profile-status is-${quality.status}`} aria-labelledby="triggerProfileTitle">
   <div id="triggerProfileSymbol" className="trigger-profile-symbol" aria-hidden="true">{symbol}</div>
   <div><p className="eyebrow">TRIGGER PROFILE</p><h3 id="triggerProfileTitle">{quality.title}</h3><p id="triggerProfileMessage">{quality.message}</p></div>
 </section>;
}
