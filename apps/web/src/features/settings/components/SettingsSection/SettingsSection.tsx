import type {ReactNode} from 'react';
export type SettingsSectionProps={title:ReactNode;className?:string;children:ReactNode};
/** Presentation only; native children retain their identity and service ownership. */
export function SettingsSection({title,className,children}:SettingsSectionProps){return <div className={'settings-group'+(className?' '+className:'')}><h3>{title}</h3>{children}</div>;}
