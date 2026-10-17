/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { createChromeBridge, type ChromeFactory, type ChromeRenderer } from './chromeBridge.ts';
const fixture = readFileSync(new URL('../../../../tests/fixtures/legacy-shell.html', import.meta.url), 'utf8');
beforeEach(() => { document.body.innerHTML = fixture; });
const control = (selector: string) => document.querySelector<HTMLButtonElement>(selector)!;

test('all prerendered chrome actions work before the renderer exists, including nested glyphs', () => {
  const onNavigate = jest.fn(); const bridge = createChromeBridge(document,onNavigate);
  for (const selector of ['#settingsShortcut','#aboutBtn','#contactBtn','.tab[data-view="learn"]']) control(selector).click();
  document.querySelector<SVGElement>('.tab[data-view="drills"] path')!.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  document.querySelector('h1')!.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  expect(onNavigate.mock.calls).toEqual([['settings'],['about'],['contact'],['learn'],['drills']]);
  bridge.navigationDisabled(true);
  control('.tab[data-view="home"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  expect(onNavigate).toHaveBeenCalledTimes(5);
  bridge.navigationDisabled(false); control('.tab[data-view="home"]').click();
  expect(onNavigate).toHaveBeenLastCalledWith('home');
  bridge.dispose(); control('#aboutBtn').click(); expect(onNavigate).toHaveBeenCalledTimes(6);
});

test('native selection and live status retain all thirteen released route states', () => {
  const bridge = createChromeBridge(document,jest.fn());
  for (const view of ['home','learn','drills','recognize','history','practice','session','practiceGuide','about','contact','settings','guns','gunSetup']) {
    bridge.view(view);
    const parent = ['practice','session','practiceGuide'].includes(view) ? 'drills' : view;
    for (const tab of document.querySelectorAll<HTMLButtonElement>('.tab')) {
      expect(tab.classList.contains('active')).toBe(tab.dataset.view===parent);
      expect(tab.getAttribute('aria-current')).toBe(tab.dataset.view===parent ? 'page' : null);
    }
    for (const [id,route] of [['aboutBtn','about'],['contactBtn','contact'],['settingsShortcut','settings']]) {
      expect(control('#'+id).getAttribute('aria-current')).toBe(view===route ? 'page' : null);
    }
    expect(control('#settingsShortcut').classList.contains('active')).toBe(view==='settings');
  }
  bridge.status('Microphone connected'); expect(document.getElementById('statusPill')).toHaveTextContent('Microphone connected');
  bridge.dispose();
});

test('ownership transfers once with the latest snapshot and all later writes go to that renderer', () => {
  const renderer: ChromeRenderer = {update:jest.fn(),dispose:jest.fn()};
  const onNavigate = jest.fn(), mount = jest.fn<ChromeFactory>(()=>renderer), bridge = createChromeBridge(document,onNavigate);
  bridge.view('practiceGuide'); bridge.status('Ready'); bridge.navigationDisabled(true);
  bridge.enhance(mount); bridge.enhance(mount);
  expect(mount).toHaveBeenCalledTimes(1);
  expect(mount.mock.calls[0][0]).toEqual({doc:document,initial:{view:'practiceGuide',status:'Ready',navigationDisabled:true},onNavigate});
  control('#aboutBtn').click(); expect(onNavigate).not.toHaveBeenCalled();
  bridge.view('settings'); bridge.status('Listening'); bridge.navigationDisabled(false);
  expect(renderer.update).toHaveBeenLastCalledWith({view:'settings',status:'Listening',navigationDisabled:false});
  expect(document.getElementById('statusPill')).toHaveTextContent('Ready'); // Native writer was retired.
  bridge.dispose(); bridge.dispose(); bridge.view('home'); bridge.status('ignored'); bridge.navigationDisabled(true); bridge.enhance(mount);
  expect(renderer.dispose).toHaveBeenCalledTimes(1);
  expect(renderer.update).toHaveBeenCalledTimes(3);
});

test('failed setup retains native actions and disposal before enhancement never mounts a renderer', () => {
  const onNavigate = jest.fn(), bridge = createChromeBridge(document,onNavigate);
  expect(()=>bridge.enhance(()=>{throw new Error('unavailable renderer');})).toThrow('unavailable renderer');
  control('#aboutBtn').click(); expect(onNavigate).toHaveBeenCalledWith('about');
  const mount = jest.fn<ChromeFactory>(()=>{ throw new Error('disposed bridge must not mount'); }); bridge.dispose(); bridge.enhance(mount); expect(mount).not.toHaveBeenCalled();
  document.querySelector('.tabs')!.remove();
  expect(()=>createChromeBridge(document,onNavigate)).toThrow('regions are missing');
});
