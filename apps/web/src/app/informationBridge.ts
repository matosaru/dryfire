import { aboutFeatureSummary } from '../pages/AboutPage/AboutPage.copy.ts';
import type { mountInformationPages } from './informationPages.tsx';
type Pages = ReturnType<typeof mountInformationPages>;
type Module = { mountInformationPages: typeof mountInformationPages };

/** Keep the initial practice bundle independent of React during migration.
 * Static content and delegated Back work before a chunk resolves or offline. */
export function createInformationBridge({ onBack, onError, doc = document,
  load = () => import('./informationPages.tsx'),
}: { onBack: () => void; onError: (error: unknown) => void; doc?: Document; load?: () => Promise<Module> }) {
  let pages: Pages | undefined, pending: Promise<void> | undefined;
  let full = false, disposed = false;
  const fallback = (event: Event) => {
    const target = event.target;
    if (!pages && target instanceof Element && target.closest('[data-react-back]')) onBack();
  };
  const hosts = [doc.getElementById('aboutView'), doc.getElementById('contactView')];
  hosts.forEach(host => host?.addEventListener('click', fallback));
  return {
    show(view: string) {
      if (disposed || pages || pending || !['about', 'contact'].includes(view)) return;
      pending = load().then(module => {
        if (disposed) return;
        pages = module.mountInformationPages({ onBack, doc, full });
        pages.setFull(full);
      }).catch(error => { if (!disposed) onError(error); }).finally(() => { pending = undefined; });
    },
    setFull(value: boolean) {
      full = value;
      if (disposed) return;
      if (pages) pages.setFull(value);
      else {
        // Until the roots mount, this boundary owns only the prerendered copy.
        const summary = doc.getElementById('aboutFeatureSummary');
        if (summary) summary.textContent = aboutFeatureSummary(value);
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      hosts.forEach(host => host?.removeEventListener('click', fallback));
      pages?.dispose();
    },
  };
}
