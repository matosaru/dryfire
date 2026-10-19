import { readFileSync } from 'node:fs';
import { renderLearnPage } from '../apps/web/src/app/renderLearnPage.tsx';
import { renderSettingsPage } from '../apps/web/src/app/renderSettingsPage.tsx';
import { renderGunSetupPage } from '../apps/web/src/app/renderGunSetupPage.tsx';
import { renderHomePage } from '../apps/web/src/app/renderHomePage.tsx';
import { renderGunsPage } from '../apps/web/src/app/renderGunsPage.tsx';
import { renderInformationPage } from '../apps/web/src/app/renderInformationPages.tsx';
import { renderCalibrationCatalog } from '../apps/web/src/app/renderCalibrationCatalog.tsx';
import { renderAppShell } from '../apps/web/src/app/renderAppShell.tsx';
import { renderNumberInput } from '../apps/web/src/app/renderNumberInput.tsx';
import { renderPracticeCatalog } from '../apps/web/src/app/renderPracticeCatalog.tsx';
import { PRACTICE_MODES } from '../src/practiceSession.js';
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
const numberInputs = Object.fromEntries([
  ['practiceRepetitions', '10'],
  ['practiceDuration', '60'],
  ['practicePar', '1.5'],
  ['practiceFixedDelay', '3'],
  ['practiceMinDelay', '2'],
  ['practiceMaxDelay', '5'],
  ['sessionRepetitions', '10', 'repetitions'],
  ['sessionFixedDelay', '3', 'fixedDelay'],
  ['sessionMinDelay', '2', 'minDelay'],
  ['sessionMaxDelay', '5', 'maxDelay'],
  ['maxResults', '50']
].map(([id, value, name]) => [id + 'Input', renderNumberInput(id, value, name)]));
const fragments = { ...runFragments, ...numberInputs, calibrationCatalog: renderCalibrationCatalog(), practiceCatalog: renderPracticeCatalog(PRACTICE_MODES) };
const content = id => id === 'learn' ? renderLearnPage(fragments.calibrationCatalog) : id === 'settings' ? renderSettingsPage(read('shared/preview-testing')) : id === 'gunSetup' ? renderGunSetupPage() : id === 'home' ? renderHomePage() : id === 'guns' ? renderGunsPage() : ['about', 'contact'].includes(id) ? renderInformationPage(id) : fill(read(`pages/${id}`), fragments);

// Only trusted, repository-owned templates are compiled. User data still uses
// the application's existing textContent/form APIs after the page is loaded.
export function renderPageTemplates(html) {
  if (html.split('{{app}}').length !== 2) throw new Error('The HTML entry must contain exactly one {{app}} layout mount.');
  const wrapper = read('view');
  const pages = PAGE_DEFINITIONS.map(({ id, titleId }) => fill(wrapper, {
    id, titleId, visibility: id === 'home' ? '' : 'hidden', content: content(id),
  })).join('\n');
  const layout = fill(renderAppShell(), { pages,
    footerNotice: '<!-- private-preview:start --><p id="previewModeBadge" class="preview-mode-badge" role="status">Private preview · Free mode</p><!-- private-preview:end -->',
  });
  return html.replace('{{app}}', () => layout);
}
