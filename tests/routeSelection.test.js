/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import { renderPageTemplates } from '../tools/page-templates.mjs';
import { createChromeBridge } from '../apps/web/src/app/chromeBridge.ts';
import { PAGE_IDS } from '../src/pageDefinitions.js';

// The same matrix passed before P2 moved the writer out of main.js.

test('all screens transfer active/aria-current state without touching unrelated classes', () => {
  document.body.innerHTML = renderPageTemplates('{{app}}');
  const bridge = createChromeBridge(document, () => {});
  const select = view => bridge.view(view);
  const settings = document.getElementById('settingsShortcut');
  const information = ['about', 'contact'].map(id => document.getElementById(id + 'Btn'));
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
    information.forEach((link, index) => {
      expect(link.getAttribute('aria-current')).toBe(name === ['about', 'contact'][index] ? 'page' : null);
      expect(link.classList.contains('active')).toBe(name === ['about', 'contact'][index]);
    });
  }
  bridge.dispose();
});
