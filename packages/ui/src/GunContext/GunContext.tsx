export type GunContextProps={name?:string;hidden?:boolean;prefix:string;suffix?:string};
/** Shared text only; the application owns selection, readiness and persistence. */
export function GunContext({name,hidden=false,prefix,suffix='.'}:GunContextProps){return <p className={'gun-context'+(hidden?' hidden':'')}>{prefix}<strong className="gun-context-name">{name}</strong>{suffix}</p>;}
