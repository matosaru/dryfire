import { readFileSync } from 'node:fs';
import { renderInformationPage } from '../apps/web/src/app/renderInformationPages.tsx';
import { PAGE_DEFINITIONS } from '../src/pageDefinitions.js';

const read = name => readFileSync(new URL(`../src/templates/${name}.html`, import.meta.url), 'utf8');
const fill = (template, slots) => template.replace(/\{\{([a-zA-Z]+)\}\}/g, (_, name) => {
  if (!Object.hasOwn(slots, name)) throw new Error(`Unknown page template slot: ${name}`);
  return slots[name];
});

const runFragments = Object.fromEntries(['practice', 'session'].flatMap(name => ['run', 'review'].flatMap(state => {
  const html = read(`shared/${name}-${state}`).trim();
  const example = html.replace(/\bid="([^"]+)"/g, (_, id) => `id="example-${id}"`)
    .replace(/\b(aria-labelledby|aria-describedby|for)="([^"]+)"/g, (_, attr, ids) => `${attr}="${ids.split(' ').map(id => `example-${id}`).join(' ')}"`);
  const slot = name + state[0].toUpperCase() + state.slice(1);
  return [[slot, html], ['example' + slot[0].toUpperCase() + slot.slice(1), example]];
})));
const content = id => ['about', 'contact'].includes(id) ? renderInformationPage(id) : fill(read(`pages/${id}`), runFragments);

// Only trusted, repository-owned templates are compiled. User data still uses
// the application's existing textContent/form APIs after the page is loaded.
export function renderPageTemplates(html) {
  if (html.split('{{app}}').length !== 2) throw new Error('The HTML entry must contain exactly one {{app}} layout mount.');
  const wrapper = read('view');
  const pages = PAGE_DEFINITIONS.map(({ id, titleId }) => fill(wrapper, {
    id, titleId, visibility: id === 'home' ? '' : 'hidden', content: content(id),
  })).join('\n');
  const layout = fill(read('layout'), { pages,
    header: read('shared/header'), context: read('shared/context'),
    footer: read('shared/footer'), navigation: read('shared/navigation'), safetyModal: read('shared/safety-modal'),
  });
  return html.replace('{{app}}', () => layout);
}
