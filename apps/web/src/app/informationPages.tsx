import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { AboutPage } from '../pages/AboutPage/index.ts';
import { ContactPage } from '../pages/ContactPage/index.ts';

/** Temporary, explicit boundary while the existing router migrates. Only these
 * two page interiors belong to React; the shared shell/router retain ownership. */
export function mountInformationPages({ onBack, doc = document, full = false }: { onBack: () => void; doc?: Document; full?: boolean }) {
  const about = doc.getElementById('aboutView');
  const contact = doc.getElementById('contactView');
  if (!about || !contact) throw new Error('Informational page mounts are missing.');
  const focusedBackHost = [about, contact].find(host => host.contains(doc.activeElement) && doc.activeElement?.matches('[data-react-back]'));
  const roots: Root[] = [createRoot(about), createRoot(contact)];
  let disposed = false, currentFull = full;
  flushSync(() => {
    roots[0].render(<StrictMode><AboutPage full={full} onBack={onBack} /></StrictMode>);
    roots[1].render(<StrictMode><ContactPage onBack={onBack} /></StrictMode>);
  });
  focusedBackHost?.querySelector<HTMLButtonElement>('[data-react-back]')?.focus();
  return {
    setFull(full: boolean) {
      if (disposed || currentFull === full) return;
      currentFull = full;
      flushSync(() => roots[0].render(<StrictMode><AboutPage full={full} onBack={onBack} /></StrictMode>));
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      flushSync(() => roots.forEach(root => root.unmount()));
    },
  };
}
