import type { MouseEvent } from 'react';

export type BrandHeaderProps = {
  status?: string;
  links?: {home?:string;about:string;contact:string;settings:string};
  onNavigate?: (view: 'home'|'about'|'contact'|'settings') => void;
  brandHeading?: 'h1'|'p';
  view?: string;
};

type HeaderDestination = 'about'|'contact'|'settings';
const destinations: HeaderDestination[] = ['about','contact','settings'];

function HeaderLink({destination,view,href,onNavigate,action}:{destination:HeaderDestination;view:string;href:string;action:boolean;onNavigate?:(view:HeaderDestination)=>void}) {
  const label=destination[0].toUpperCase()+destination.slice(1);
  const activate=(event:MouseEvent<HTMLAnchorElement|HTMLButtonElement>)=>{
    if(!onNavigate)return;
    if(!action){if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();}
    onNavigate(destination);
  };
  const Control=action?'button':'a';
  return <Control type={action?'button':undefined} id={destination==='settings'?'settingsShortcut':destination+'Btn'} className={`header-link${view===destination?' active':''}`} data-icon={destination} href={action?undefined:href} aria-label={label} title={label} aria-current={view===destination?'page':undefined} onClick={activate}/>;
}

/** Presentation only; the application owns status, navigation and capture. */
export function BrandHeaderContent({ status = 'Loading…', view = 'home', links, onNavigate, brandHeading = 'h1' }: BrandHeaderProps) {
  const Heading=brandHeading;
  return <>
    <a id="brandHome" className="brand-home" href={links?.home??'/'} aria-label="Home — Dry Fire With Ease" aria-current={view==='home'?'page':undefined} onClick={event=>{
      if(!onNavigate||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();onNavigate('home');
    }}>
    <img className="brand-logo" src="/logo.svg" width="47" height="47" alt="" />
    <div className="hero-copy">
      <div className="brand-heading"><Heading className="brand-name" aria-label="Dry Fire With Ease"><span className="brand-eyebrow">DRY <span>FIRE</span></span><span className="brand-tagline">WITH EASE</span></Heading><span className="beta-badge" aria-label="Beta version">BETA</span></div>
    </div>
    </a>
    <div className="header-actions"><div id="statusPill" className="status-pill" role="status" aria-live="polite">{status}</div><nav className="header-links" aria-label="Information">{destinations.map(destination=><HeaderLink key={destination} destination={destination} action={destination==='settings'&&!links} view={view} href={links?.[destination]??`/${destination}/`} onNavigate={onNavigate}/>)}</nav></div>
  </>;
}

export function BrandHeader(props: BrandHeaderProps) {
  return <header className="hero"><BrandHeaderContent {...props} /></header>;
}
