import { readFileSync } from 'node:fs';
import { renderPageTemplates } from '../tools/page-templates.mjs';
import { PAGE_DEFINITIONS } from '../src/pageDefinitions.js';

test('all screen content uses one wrapper and one shared application layout', () => {
  const html = renderPageTemplates(readFileSync(new URL('../index.html', import.meta.url), 'utf8'));
  expect(PAGE_DEFINITIONS).toHaveLength(13);
  for (const { id, titleId } of PAGE_DEFINITIONS) {
    expect(html.match(new RegExp(`id="${id}View"`, 'g'))).toHaveLength(1);
    expect(html).toContain(`aria-labelledby="${titleId}"`);
  }
  for (const id of ['pageContent', 'settingsShortcut', 'aboutBtn', 'contactBtn', 'safetyModal']) {
    expect(html.match(new RegExp(`id="${id}"`, 'g'))).toHaveLength(1);
  }
  expect(html.match(/<main\b/g)).toHaveLength(1);
  expect(html.match(/<header\b/g)).toHaveLength(1);
  expect(html.match(/<footer\b/g)).toHaveLength(1);
  expect(html.indexOf('<header')).toBeLessThan(html.indexOf('<main'));
  expect(html.indexOf('</main>')).toBeLessThan(html.indexOf('<footer'));
  expect(html.indexOf('</footer>')).toBeLessThan(html.indexOf('aria-label="Main navigation"'));
  expect(html).not.toMatch(/\{\{[a-zA-Z]+\}\}/);
});
test('template compilation rejects missing or duplicate layout mounts', () => {
  expect(() => renderPageTemplates('<body></body>')).toThrow('exactly one');
  expect(() => renderPageTemplates('{{app}}{{app}}')).toThrow('exactly one');
});
test('the public/preview filter still has the private controls in its trusted source template', () => {
  const html = renderPageTemplates('{{app}}');
  expect(html).toContain('<!-- private-preview:start -->');
  expect(html).toContain('id="previewTestMode"');
  expect(html).toContain('id="previewModeBadge"');
});
