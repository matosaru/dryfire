import { renderToStaticMarkup } from 'react-dom/server';
import { PracticeCatalog, type PracticeOption } from '@dryfire/ui/PracticeCatalog';
import {translate} from '../localization/runtime.ts';

/** Build-only adapter; no React dependency is added to the startup graph. */
export function renderPracticeCatalog(modes: readonly ({id:string;title?:string;description?:string})[]) {
  const localized:PracticeOption[]=modes.map(({id,title,description})=>({id,
    title:title??translate('practice-guide',`manuals.${id}.title`),
    description:description??translate('drills',`modes.${id}Description`),
  }));
  return renderToStaticMarkup(<PracticeCatalog modes={localized} startLabel={translate('drills','cards.start')} />);
}
