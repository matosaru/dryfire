import { renderToStaticMarkup } from 'react-dom/server';
import { AppShell } from '@dryfire/ui/AppShell';
import { GunSwitcher } from '@dryfire/ui/GunSwitcher';
import { SafetyDisclosure } from '@dryfire/ui/SafetyDisclosure';
import { SafetyDialog } from '@dryfire/ui/SafetyDialog';

/** Trusted page/footer slots preserve mounted native section/draft nodes.
 * Safety and gun-context behavior stay with their existing native owners. */
export function renderAppShell() {
  const context = <>
    <SafetyDisclosure />
    <p id="appMessage" className="app-message hidden" role="alert" />
    <p className="startup-message" role="status">Opening your saved gun profiles…</p>
    <GunSwitcher />
  </>;
  const html = renderToStaticMarkup(<AppShell safety={<SafetyDialog />} context={context} footerNotice="{{footerNotice}}">{'{{pages}}'}</AppShell>);
  // Omit React's automatic image hints to retain the released request graph.
  return html.replace('<link rel="preload" as="image" href="/logo.svg"/>', '')
    .replace('<link rel="preload" as="image" href="/gun-types/unknown.svg"/>', '');
}
