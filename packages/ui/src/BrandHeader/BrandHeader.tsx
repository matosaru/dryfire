import type { CSSProperties, MouseEvent } from 'react';

export type BrandHeaderProps = {
  status?: string;
  links?: {home?:string;about:string;contact:string;settings:string};
  onNavigate?: (view: 'home'|'about'|'contact'|'settings') => void;
  brandHeading?: 'h1'|'p';
  view?: string;
};

type HeaderDestination = 'about'|'contact'|'settings';
const destinations: HeaderDestination[] = ['about','contact','settings'];
const headerStyle={'--header-icons':'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMzIgMTc2IiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuOCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48ZGVmcz48ZyBpZD0iYSI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOSIvPjxwYXRoIGQ9Ik0xMiAxMXY2TTEyIDdoLjAxIi8+PC9nPjxnIGlkPSJjIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0Ii8+PHBhdGggZD0iTTE2IDh2NmEyIDIgMCAwIDAgNCAwdi0yYTggOCAwIDEgMC0zIDYuMjUiLz48L2c+PGcgaWQ9InMiPjxwYXRoIGQ9Im0xMCAzLS41IDItMiAuOC0xLjgtMS0yIDMuNCAxLjYgMS40LS4zIDIuNC0xLjYgMS40IDIgMy40IDItLjYgMS44IDEgLjUgMi4yaDRsLjUtMi4yIDEuOC0xLjIgMiAuNiAyLTMuNC0xLjYtMS40LS4zLTIuNCAxLjYtMS40LTItMy40LTEuOCAxLTItLjhMMTQgM1oiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjExIiByPSIzIi8+PC9nPjxnIGlkPSJyIj48dXNlIGhyZWY9IiNhIiB4PSIxMCIgeT0iMTAiLz48dXNlIGhyZWY9IiNjIiB4PSI1NCIgeT0iMTAiLz48dXNlIGhyZWY9IiNzIiB4PSI5OCIgeT0iMTAiLz48L2c+PC9kZWZzPjx1c2UgaHJlZj0iI3IiIHN0cm9rZT0iI2ZmZiIvPjxnIHN0cm9rZT0iI2ZmOTE0MSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCA0NCkiPjx1c2UgaHJlZj0iI3IiLz48L2c+PGcgc3Ryb2tlPSIjMjQzZDUxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIDg4KSI+PHVzZSBocmVmPSIjciIvPjwvZz48ZyBzdHJva2U9IiNhYzQ1MDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAgMTMyKSI+PHVzZSBocmVmPSIjciIvPjwvZz48L3N2Zz4K")'} as CSSProperties;

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
  return <header className="hero" style={headerStyle}><BrandHeaderContent {...props} /></header>;
}
