import type { ReactNode } from 'react';
export type InfoFooterProps = {
  view?: string;
  onNavigate?: (view: 'about' | 'contact') => void;
  notice?: ReactNode;
};

export function InfoFooterLinks({ view = 'home', onNavigate }: Pick<InfoFooterProps, 'view' | 'onNavigate'>) {
  return <>
      <button id="aboutBtn" className="text-button footer-page-link" type="button" aria-current={view === 'about' ? 'page' : undefined} onClick={() => onNavigate?.('about')}>About</button>
      <button id="contactBtn" className="text-button footer-page-link" type="button" aria-current={view === 'contact' ? 'page' : undefined} onClick={() => onNavigate?.('contact')}>Contact</button>
  </>;
}

export function InfoFooter({ view = 'home', onNavigate, notice }: InfoFooterProps) {
  return <footer>
    <nav className="footer-links" aria-label="Information"><InfoFooterLinks view={view} onNavigate={onNavigate} /></nav>
    {"Microphone access stops when you stop or pause capture, leave recognition or a drill session, or the page becomes hidden. Gun profiles, numeric learned features, custom drills, recognition results, saved sessions and preferences are stored in this browser's IndexedDB. No raw audio is saved or uploaded. Clearing browser storage erases local data."}
    <p className="copyright">© 2026 Dry Fire With Ease. All rights reserved.</p>
    {notice}
  </footer>;
}
