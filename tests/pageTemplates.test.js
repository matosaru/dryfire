import {renderSessionFragments} from '@dryfire/testing/session-fragments';
import { readFileSync } from 'node:fs';
import { renderPageTemplates } from '../tools/page-templates.mjs';
import { PAGE_DEFINITIONS, PAGE_IDS } from '../src/pageDefinitions.js';

test('route IDs and build-time heading metadata preserve the released screen order', () => {
  expect(Object.isFrozen(PAGE_IDS)).toBe(true);
  expect(Object.isFrozen(PAGE_DEFINITIONS)).toBe(true);
  expect(PAGE_DEFINITIONS).toEqual([
    ['gunSetup', 'gunSetupTitle'], ['guns', 'gunsTitle'], ['home', 'home-title'],
    ['learn', 'learn-title'], ['drills', 'drills-title'], ['practice', 'practice-title'],
    ['session', 'session-title'], ['practiceGuide', 'practiceGuide-title'],
    ['recognize', 'recognize-title'], ['history', 'history-title'],
    ['settings', 'settings-title'], ['about', 'about-title'], ['contact', 'contact-title'],
  ].map(([id, titleId]) => ({ id, titleId })));
  expect(PAGE_IDS).toEqual(PAGE_DEFINITIONS.map(page => page.id));
});

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

test('guide examples compile the exact live run and review fragments with unique IDs', () => {
  const html = renderPageTemplates('{{app}}');
  // Production compiler and both live/example branches use the same typed owner.
  // Independent frozen native DOM and complete-frame parity live in component/sharedSessionFragments tests.
  for (const fragment of Object.values(renderSessionFragments())) expect(html).toContain(fragment);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  expect(new Set(ids).size).toBe(ids.length);
});
