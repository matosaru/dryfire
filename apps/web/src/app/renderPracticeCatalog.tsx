import { renderToStaticMarkup } from 'react-dom/server';
import { PracticeCatalog, type PracticeOption } from '@dryfire/ui/PracticeCatalog';

/** Build-only adapter; no React dependency is added to the startup graph. */
export function renderPracticeCatalog(modes: readonly PracticeOption[]) {
  return renderToStaticMarkup(<PracticeCatalog modes={modes} />);
}
