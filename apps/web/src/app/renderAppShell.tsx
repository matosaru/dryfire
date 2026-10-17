import { renderToStaticMarkup } from 'react-dom/server';
import { AppShell } from '@dryfire/ui/AppShell';

/** Trusted compiler slots preserve legacy-owned section/dialog nodes during
 * migration. No user HTML enters this build-only adapter. */
export function renderAppShell() {
  const html = renderToStaticMarkup(<AppShell safety="{{safetyModal}}" context="{{context}}" footerNotice="{{footerNotice}}">{'{{pages}}'}</AppShell>);
  // React emits a logo hint automatically; retain the released request graph.
  return html.replace('<link rel="preload" as="image" href="/logo.svg"/>', '');
}
