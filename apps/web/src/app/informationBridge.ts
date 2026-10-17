import type { mountInformationPages } from './informationPages.tsx';
import { createChromeBridge, type ChromeFactory } from './chromeBridge.ts';
type Pages = ReturnType<typeof mountInformationPages>;
type Module = { mountInformationPages: typeof mountInformationPages; mountChrome: ChromeFactory };

/** Keep the initial practice bundle independent of React during migration.
 * Static content and delegated Back work before a chunk resolves or offline. */
export function createInformationBridge({ onBack, onError, doc = document,
  load = () => import('./informationPages.tsx'),
  onNavigate, canEnhance = () => true,
}: { onBack: () => void; onError: (error: unknown) => void; doc?: Document; load?: () => Promise<Module>;
  onNavigate: (view: string) => void; canEnhance?: () => boolean }) {
  let pages: Pages | undefined, pending: Promise<void> | undefined;
  let ready: Module | undefined;
  let full = false, disposed = false;
  const summary = doc.getElementById('aboutFeatureSummary');
  const freeSummary = summary?.textContent ?? '';
  const chrome = createChromeBridge(doc, onNavigate);
  const enhance = () => {
    if (disposed || !ready) return;
    try {
      if (!canEnhance()) return;
      pages ??= ready.mountInformationPages({ onBack, doc, full });
      chrome.enhance(ready.mountChrome);
    } catch (error) { ready=undefined; onError(error); }
  };
  const fallback = (event: Event) => {
    const target = event.target;
    if (!pages && target instanceof Element && target.closest('[data-react-back]')) onBack();
  };
  const hosts = [doc.getElementById('aboutView'), doc.getElementById('contactView')];
  hosts.forEach(host => host?.addEventListener('click', fallback));
  return {
    show(view: string) {
      chrome.view(view); enhance();
      if (disposed || ready || pending || !['about', 'contact'].includes(view)) return;
      pending = load().then(module => {
        if (disposed) return;
        ready=module; enhance();
      }).catch(error => { if (!disposed) onError(error); }).finally(() => { pending = undefined; });
    },
    setFull(value: boolean) {
      full = value;
      if (disposed) return;
      if (pages) pages.setFull(value);
      else {
        // Until the roots mount, this boundary owns only the prerendered copy.
        if (summary) summary.textContent = value ? summary.dataset.fullSummary! : freeSummary;
      }
      enhance();
    },
    setStatus(value: string) { chrome.status(value); enhance(); },
    setNavigationDisabled(value: boolean) { chrome.navigationDisabled(value); enhance(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      hosts.forEach(host => host?.removeEventListener('click', fallback));
      pages?.dispose();
      chrome.dispose(); ready=undefined;
    },
  };
}
