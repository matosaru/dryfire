import { renderToStaticMarkup } from 'react-dom/server';
import { AboutPage } from '../pages/AboutPage/index.ts';
import { ContactPage } from '../pages/ContactPage/index.ts';

/** Prerender the same components used by the browser; no parallel HTML copy. */
export function renderInformationPage(id: string) {
  if (id === 'about') return renderToStaticMarkup(<AboutPage />);
  if (id === 'contact') return renderToStaticMarkup(<ContactPage />);
  throw new Error(`Not an informational page: ${id}`);
}
