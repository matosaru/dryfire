export type TriggerProfileQuality={status:'needs-samples'|'variable'|'stable';sampleCount:number;needed:number;outlierIndexes:number[]};

/** Read-only learning guidance; sample ownership and capture remain feature-owned. */
export function TriggerProfileStatus({quality,onSoundCheck,disabled=false,eyebrow,action,title,message}:{quality:TriggerProfileQuality;onSoundCheck?:()=>void;disabled?:boolean;eyebrow:string;action:string;title:string;message:string}){
 const symbol=quality.status==='stable'?'✓':quality.status==='variable'?'!':'…';
 return <section id="triggerProfileStatus" className={`trigger-profile-status is-${quality.status}`} aria-labelledby="triggerProfileTitle">
   <div id="triggerProfileSymbol" className="trigger-profile-symbol" aria-hidden="true">{symbol}</div>
   <div><p className="eyebrow">{eyebrow}</p><h3 id="triggerProfileTitle">{title}</h3><p id="triggerProfileMessage">{message}</p><button id="runSoundCheckBtn" type="button" className="button secondary" disabled={disabled||quality.status==='needs-samples'} onClick={onSoundCheck}>{action}</button></div>
 </section>;
}
