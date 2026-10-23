import type {ReactNode} from 'react';
export type DrillSetupProps={prefix:'practice'|'session';legend:string;children:ReactNode;footer:ReactNode};
/** Shared configuration geometry; controllers retain native form ownership. */
export function DrillSetup({prefix,legend,children,footer}:DrillSetupProps){return <form id={`${prefix}ConfigForm`} className="session-config-form"><fieldset id={`${prefix}ConfigFields`} className="session-config-fields"><legend>{legend}</legend>{children}</fieldset>{footer}</form>;}
export function DrillSetupCount({id,inputId,label,hidden=false,children}:{id?:string;inputId:string;label:ReactNode;hidden?:boolean;children:ReactNode}){return <label id={id} className={`session-field session-repetition-field${hidden?' hidden':''}`} htmlFor={inputId}>{label}{children}</label>;}
export function DrillSetupSteps({id,label,children}:{id:string;label:string;children?:ReactNode}){return <ol id={id} className="drill-steps session-sequence" aria-label={label}>{children}</ol>;}
