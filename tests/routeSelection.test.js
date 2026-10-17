/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { PAGE_IDS } from '../src/pageDefinitions.js';

// Exercise the released chrome behavior before P2 moves its writer.
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const source = main.slice(main.indexOf("  document.querySelectorAll('.tab').forEach(tab=>{"), main.indexOf('  setMessage();', main.indexOf('function displayView(')));
const select = name => runInNewContext(source, { name, document, PAGE_IDS: [], $: selector => document.querySelector(selector) });

test('all screens transfer active/aria-current state without touching unrelated classes', () => {
  document.body.innerHTML = ['header', 'footer', 'navigation'].map(name =>
    readFileSync(new URL(`../src/templates/shared/${name}.html`, import.meta.url), 'utf8')).join('');
  const settings = document.getElementById('settingsShortcut');
  const footer = ['about', 'contact'].map(id => document.getElementById(id + 'Btn'));
  for (const name of [...PAGE_IDS, ...PAGE_IDS.toReversed()]) {
    select(name);
    for (const tab of document.querySelectorAll('.tab')) {
      const active = tab.dataset.view === (['session', 'practice', 'practiceGuide'].includes(name) ? 'drills' : name);
      expect(tab.classList.contains('active')).toBe(active);
      expect(tab.getAttribute('aria-current')).toBe(active ? 'page' : null);
      expect(tab.classList.contains('tab')).toBe(true);
    }
    expect(settings.classList.contains('active')).toBe(name === 'settings');
    expect(settings.getAttribute('aria-current')).toBe(name === 'settings' ? 'page' : null);
    footer.forEach((link, index) => {
      expect(link.getAttribute('aria-current')).toBe(name === ['about', 'contact'][index] ? 'page' : null);
      expect(link.classList.contains('active')).toBe(false);
    });
  }
});
