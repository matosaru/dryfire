import type {ClassToggle} from './phasePresentation';
/** Mirror DOMTokenList toggles without losing existing token order or mutating the snapshot. */
export function applyControlClasses(previous:Readonly<Record<string,string>>,toggles:readonly ClassToggle[]){const next={...previous};for(const {id,token,enabled}of toggles){const current=next[id]??'',tokens=current.split(/\s+/).filter(Boolean),present=tokens.includes(token);if(present===enabled)continue;next[id]=enabled?[...tokens,token].join(' '):tokens.filter(value=>value!==token).join(' ');}return next;}
