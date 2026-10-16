import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { AboutPage } from '../pages/AboutPage/index.ts';
import { ContactPage } from '../pages/ContactPage/index.ts';

/** Temporary, explicit boundary while the existing router migrates. Only these
 * two page interiors belong to React; the shared shell/router retain ownership. */
export function mountInformationPages({ onBack, doc = document }: { onBack: () => void; doc?: Document }) {
  const about = doc.getElementById('aboutView');
  const contact = doc.getElementById('contactView');
  if (!about || !contact) throw new Error('Informational page mounts are missing.');
  const roots: Root[] = [createRoot(about), createRoot(contact)];
  let disposed = false, currentFull = false;
  flushSync(() => {
    roots[0].render(<StrictMode><AboutPage onBack={onBack} /></StrictMode>);
    roots[1].render(<StrictMode><ContactPage onBack={onBack} /></StrictMode>);
  });
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
