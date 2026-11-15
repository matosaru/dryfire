import './GunContext.css';

export type GunContextProps={name?:string;hidden?:boolean;prefix:string;suffix?:string};
/** Shared text only; the application owns selection, readiness and persistence. */
export function GunContext({name,hidden=false,prefix,suffix='.'}:GunContextProps){return <p className={'gun-context'+(hidden?' hidden':'')}>{prefix}<span className="gun-context-name">{name}</span>{suffix}</p>;}
