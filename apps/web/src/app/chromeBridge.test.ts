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
  document.querySelector('header.hero')!.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  expect(onNavigate.mock.calls).toEqual([['settings'],['about'],['contact'],['learn'],['drills']]);
  bridge.navigationDisabled(true);
  control('.tab[data-view="home"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
  expect(onNavigate).toHaveBeenCalledTimes(5);
  bridge.navigationDisabled(false); control('.tab[data-view="home"]').click();
  expect(onNavigate).toHaveBeenLastCalledWith('home');
  bridge.dispose(); control('#aboutBtn').click(); expect(onNavigate).toHaveBeenCalledTimes(6);
});

test('native logo and wordmark return Home without hijacking modified clicks',()=>{
 const navigate=jest.fn(),bridge=createChromeBridge(document,navigate);
 const home=document.getElementById('brandHome')!;
 for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}]){
  const event=new MouseEvent('click',{bubbles:true,cancelable:true,...options});home.dispatchEvent(event);expect(event.defaultPrevented).toBe(false);
 }
 expect(navigate).not.toHaveBeenCalled();
 home.querySelector('img')!.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
 expect(navigate.mock.calls).toEqual([['home']]);
 bridge.view('home');expect(home).toHaveAttribute('aria-current','page');
 bridge.view('contact');expect(home).not.toHaveAttribute('aria-current');bridge.dispose();
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

test('repeated identical snapshots do not rewrite native chrome or schedule renderer work',()=>{
  const bridge=createChromeBridge(document,jest.fn());
  bridge.view('learn');bridge.status('Ready');bridge.navigationDisabled(true);
  const observer=new MutationObserver(()=>{});
  observer.observe(document.body,{subtree:true,attributes:true,childList:true,characterData:true});
  bridge.view('learn');bridge.status('Ready');bridge.navigationDisabled(true);
  expect(observer.takeRecords()).toHaveLength(0);
  const renderer:ChromeRenderer={update:jest.fn(),dispose:jest.fn()};
  bridge.enhance(()=>renderer);
  bridge.view('learn');bridge.status('Ready');bridge.navigationDisabled(true);
  expect(renderer.update).not.toHaveBeenCalled();
  bridge.status('Listening');
  expect(renderer.update).toHaveBeenCalledTimes(1);
  expect(renderer.update).toHaveBeenCalledWith({view:'learn',status:'Listening',navigationDisabled:true});
  observer.disconnect();bridge.dispose();
});


test('header links preserve modified clicks and intercept ordinary navigation once',()=>{
 const navigate=jest.fn(),bridge=createChromeBridge(document,navigate);
 const link=document.querySelector<HTMLAnchorElement>('#contactBtn')!;
 for(const options of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}]){
  const event=new MouseEvent('click',{bubbles:true,cancelable:true,...options});link.dispatchEvent(event);expect(event.defaultPrevented).toBe(false);
 }
 expect(navigate).not.toHaveBeenCalled();
 const event=new MouseEvent('click',{bubbles:true,cancelable:true});link.dispatchEvent(event);
 expect(event.defaultPrevented).toBe(true);expect(navigate.mock.calls).toEqual([['contact']]);bridge.dispose();
});

test('unrelated native header controls retain their classes and do not acquire a route',()=>{
 const extra=document.createElement('button');extra.className='unrelated';document.querySelector('header.hero')!.append(extra);
 const navigate=jest.fn(),bridge=createChromeBridge(document,navigate);extra.click();bridge.view('about');
 expect(navigate).not.toHaveBeenCalled();expect(extra.className).toBe('unrelated');expect(extra).not.toHaveAttribute('aria-current');bridge.dispose();
});

test('navigation does not rewrite unchanged information controls or notify their ARIA state',()=>{
 const bridge=createChromeBridge(document,jest.fn());bridge.view('gunSetup');
 const about=control('#aboutBtn'),contact=control('#contactBtn');
 const aboutARIA=jest.spyOn(about,'ariaCurrent','set'),contactARIA=jest.spyOn(contact,'ariaCurrent','set');
 const aboutClass=jest.spyOn(about.classList,'toggle'),contactClass=jest.spyOn(contact.classList,'toggle');
 bridge.view('settings');
 expect(aboutARIA).not.toHaveBeenCalled();expect(contactARIA).not.toHaveBeenCalled();
 expect(aboutClass).not.toHaveBeenCalled();expect(contactClass).not.toHaveBeenCalled();
 bridge.dispose();
});

test('pointer and keyboard activation navigate through the shared bridge',()=>{
 const navigate=jest.fn(),bridge=createChromeBridge(document,navigate),button=control('#settingsShortcut');
 button.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:1}));expect(navigate).toHaveBeenCalledWith('settings');
 button.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:0}));expect(navigate).toHaveBeenCalledTimes(2);bridge.dispose();
});
