export type BrandHeaderProps = {
  status?: string;
  settingsHref?: string;
  brandHeading?: 'h1'|'p';
  view?: string;
  onSettings?: () => void;
};

/** Presentation only; the application owns status, navigation and capture. */
export function BrandHeaderContent({ status = 'Loading…', view = 'home', onSettings, settingsHref, brandHeading = 'h1' }: BrandHeaderProps) {
  const Heading=brandHeading;
  return <>
    <img className="brand-logo" src="/logo.svg" width="47" height="47" alt="" />
    <div className="hero-copy">
      <div className="brand-heading"><Heading className="brand-name" aria-label="Dry Fire With Ease"><span className="brand-eyebrow">DRY <span>FIRE</span></span><span className="brand-tagline">WITH EASE</span></Heading><span className="beta-badge" aria-label="Beta version">BETA</span></div>
    </div>
    <div className="header-actions"><div id="statusPill" className="status-pill" role="status" aria-live="polite">{status}</div>{settingsHref?<a className="icon-button" href={settingsHref} aria-label="Open settings" title="Settings">⚙</a>:<button id="settingsShortcut" className={`icon-button${view === 'settings' ? ' active' : ''}`} type="button" aria-label="Open settings" title="Settings" aria-current={view === 'settings' ? 'page' : undefined} onClick={onSettings}>⚙</button>}</div>
  </>;
}

export function BrandHeader(props: BrandHeaderProps) {
  return <header className="hero"><BrandHeaderContent {...props} /></header>;
}
