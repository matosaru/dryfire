import type { ReactNode } from 'react';
import { BrandHeader } from '../BrandHeader/index.ts';
import { InfoFooter } from '../InfoFooter/index.ts';
import { BottomNavigation, type Destination } from '../BottomNavigation/index.ts';
export type ShellDestination = Destination | 'about' | 'contact' | 'settings';
export type AppShellProps = {
  view?: string;
  links?:Record<Destination|'about'|'contact'|'settings',string>;
  status?: string;
  navigationDisabled?: boolean;
  onNavigate?: (view: ShellDestination) => void;
  footerNotice?: ReactNode;
  safety?: ReactNode;
  context?: ReactNode;
  children?: ReactNode;
};

/** No router, stores or effects. One view/callback source keeps every chrome
 * control coherent; opaque content slots keep page/form ownership explicit. */
export function AppShell({ view, status, navigationDisabled, onNavigate, footerNotice, safety, context, children, links }: AppShellProps) {
  return <div className="app-shell">
    <BrandHeader links={links} brandHeading={links?'p':'h1'} view={view} status={status} onNavigate={onNavigate} />
    {safety}
    <main id="pageContent" className="page-content">{context}{children}</main>
    <InfoFooter notice={footerNotice} />
    <BottomNavigation hrefs={links} view={view} disabled={navigationDisabled} onNavigate={onNavigate} />
  </div>;
}
