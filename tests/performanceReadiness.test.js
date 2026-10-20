/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {renderPageTemplates} from '../tools/page-templates.mjs';
import { usableInitialScreen } from '../tools/performance/readiness.mjs';

beforeEach(() => {
  document.body.innerHTML=renderPageTemplates('{{app}}');
  document.body.dataset.view = 'loading';
});

test('Ready alone never measures a still-queued startup transition as usable', () => {
  expect(usableInitialScreen(document)).toBe(false);
  document.getElementById('statusPill').textContent = 'Ready';
  expect(usableInitialScreen(document)).toBe(false);
  document.body.dataset.view = 'home';
  expect(usableInitialScreen(document)).toBe(true);
  document.getElementById('homeView').classList.add('hidden');
  expect(usableInitialScreen(document)).toBe(false);
  document.getElementById('homeView').remove();
  expect(usableInitialScreen(document)).toBe(false);
});

test('the initial gun form and returning Home both require usable controls', () => {
  document.getElementById('statusPill').textContent = 'Ready';
  document.body.dataset.view = 'home';
  document.getElementById('homeDrillsBtn').disabled = true;
  expect(usableInitialScreen(document)).toBe(false);
  document.body.dataset.view = 'gunSetup'; document.getElementById('gunSetupView').classList.remove('hidden');
  expect(usableInitialScreen(document)).toBe(true);
  for (const id of ['gunName','saveGunBtn']) {
    const control = document.getElementById(id); control.disabled = true;
    expect(usableInitialScreen(document)).toBe(false); control.disabled = false;
  }
  document.getElementById('gunName').remove();
  expect(usableInitialScreen(document)).toBe(false);
  document.getElementById('statusPill').remove();
  expect(usableInitialScreen(document)).toBe(false);
});
