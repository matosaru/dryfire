/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { aboutFeatureSummary } from '../pages/AboutPage/AboutPage.copy.ts';
const fixture=readFileSync(new URL('../../../../tests/fixtures/legacy-shell.html',import.meta.url),'utf8');
const mountChrome=()=>({update:jest.fn(),dispose:jest.fn()});
const setContent=(html: string)=>{document.body.innerHTML=fixture+html;};
beforeEach(()=>setContent('<section id="aboutView"></section><section id="contactView"></section>'));

import { createInformationBridge } from './informationBridge.ts';

test('the render runtime loads only on an informational route and receives the latest edition', async () => {
  const back = jest.fn(), error = jest.fn();
  const pages = { setFull: jest.fn(), dispose: jest.fn() };
  const mount = jest.fn(() => pages);
  let resolve!: (module: { mountInformationPages: typeof mount; mountChrome: typeof mountChrome }) => void;
  const load = jest.fn(() => new Promise<{ mountInformationPages: typeof mount; mountChrome: typeof mountChrome }>(done => { resolve = done; }));
  setContent('<section id="aboutView"><button data-react-back>Back</button></section><section id="contactView"></section>');
  const bridge = createInformationBridge({ onNavigate:jest.fn(), onBack: back, onError: error, load });
  bridge.show('home'); bridge.setFull(true);
  expect(load).not.toHaveBeenCalled();
  bridge.show('about'); bridge.show('contact');
  expect(load).toHaveBeenCalledTimes(1);
  document.querySelector<HTMLButtonElement>('[data-react-back]')!.click();
  expect(back).toHaveBeenCalledTimes(1);
  bridge.setFull(false); bridge.setFull(true);
  resolve({ mountInformationPages: mount, mountChrome });
  await Promise.resolve(); await Promise.resolve();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(mount).toHaveBeenCalledWith(expect.objectContaining({full:true}));
  bridge.setFull(false);
  expect(pages.setFull).toHaveBeenLastCalledWith(false);
  document.querySelector<HTMLButtonElement>('[data-react-back]')!.click();
  expect(back).toHaveBeenCalledTimes(1); // React now owns its own Back callback.
  bridge.dispose(); bridge.dispose();
  expect(pages.dispose).toHaveBeenCalledTimes(1);
  expect(error).not.toHaveBeenCalled();
});

test('a failed chunk keeps static navigation usable and retries on the next visit', async () => {
  setContent('<section id="aboutView"><button data-react-back>Back</button></section><section id="contactView"></section>');
  const onError = jest.fn(), onBack = jest.fn();
  const pages = { setFull: jest.fn(), dispose: jest.fn() };
  const mount = jest.fn(() => pages);
  const load = jest.fn<() => Promise<{ mountInformationPages: typeof mount; mountChrome: typeof mountChrome }>>()
    .mockRejectedValueOnce(new Error('offline chunk'))
    .mockResolvedValueOnce({ mountInformationPages: mount, mountChrome });
  const bridge = createInformationBridge({ onNavigate:jest.fn(), onBack, onError, load });
  bridge.show('about');
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve();
  expect(onError).toHaveBeenCalledTimes(1);
  document.querySelector<HTMLButtonElement>('[data-react-back]')!.click();
  expect(onBack).toHaveBeenCalledTimes(1);
  bridge.show('contact');
  await Promise.resolve(); await Promise.resolve();
  expect(mount).toHaveBeenCalledTimes(1);
  bridge.dispose();
});

test('leaving the application while the chunk loads never mounts abandoned roots', async () => {
  let resolve!: (module: { mountInformationPages: ReturnType<typeof jest.fn>; mountChrome: typeof mountChrome }) => void;
  const mount = jest.fn(() => ({ setFull() {}, dispose() {} }));
  const load = () => new Promise<{ mountInformationPages: typeof mount; mountChrome: typeof mountChrome }>(done => { resolve = done; });
  const bridge = createInformationBridge({ onNavigate:jest.fn(), onBack() {}, onError() {}, load });
  bridge.show('about'); bridge.dispose(); resolve({ mountInformationPages: mount, mountChrome });
  await Promise.resolve(); await Promise.resolve();
  expect(mount).not.toHaveBeenCalled();
});

test('Full preview copy is correct immediately while its React chunk is still pending', () => {
  setContent('<section id="aboutView"><p id="aboutFeatureSummary">Public copy</p></section><section id="contactView"></section>');
  document.querySelector<HTMLElement>('#aboutFeatureSummary')!.dataset.fullSummary=aboutFeatureSummary(true);
  document.querySelector('#aboutFeatureSummary')!.textContent=aboutFeatureSummary(false);
  const bridge = createInformationBridge({ onNavigate:jest.fn(), onBack() {}, onError() {}, load: () => new Promise(() => {}) });
  bridge.setFull(true); bridge.show('about');
  expect(document.querySelector('#aboutFeatureSummary')?.textContent).toContain('up to five guns');
  bridge.setFull(false);
  expect(document.querySelector('#aboutFeatureSummary')?.textContent).toContain('built-in practice mode');
  bridge.dispose();
});

test('a delayed renderer waits for capture/modal locks and receives the latest route, status and disabled state',async()=>{
  let unlocked=false;
  const pages={setFull:jest.fn(),dispose:jest.fn()}, renderer={update:jest.fn(),dispose:jest.fn()};
  const mount=jest.fn(()=>pages), chrome=jest.fn(()=>renderer), navigate=jest.fn();
  const bridge=createInformationBridge({onNavigate:navigate,onBack(){},onError:jest.fn(),canEnhance:()=>unlocked,
    load:async()=>({mountInformationPages:mount,mountChrome:chrome})});
  bridge.show('about'); await Promise.resolve(); await Promise.resolve();
  bridge.show('practice');bridge.setStatus('Listening');bridge.setNavigationDisabled(true);bridge.setFull(true);
  expect(mount).not.toHaveBeenCalled();expect(chrome).not.toHaveBeenCalled();
  document.getElementById('aboutBtn')!.click();expect(navigate).toHaveBeenCalledWith('about');
  unlocked=true;bridge.setNavigationDisabled(false);
  expect(mount).toHaveBeenCalledWith(expect.objectContaining({full:true}));
  expect(chrome).toHaveBeenCalledWith(expect.objectContaining({initial:{view:'practice',status:'Listening',navigationDisabled:false}}));
  bridge.show('contact');expect(renderer.update).toHaveBeenCalledWith({view:'contact',status:'Listening',navigationDisabled:false});
  bridge.dispose();bridge.setFull(false);bridge.setStatus('abandoned');bridge.setNavigationDisabled(true);bridge.show('about');
  expect(renderer.dispose).toHaveBeenCalledTimes(1);expect(pages.dispose).toHaveBeenCalledTimes(1);
});

test('failed enhancement retains native actions and retries without mounting duplicate information pages',async()=>{
  const error=jest.fn(),navigate=jest.fn(),pages={setFull:jest.fn(),dispose:jest.fn()};
  const mount=jest.fn(()=>pages),renderer={update:jest.fn(),dispose:jest.fn()};
  const chrome=jest.fn<typeof mountChrome>().mockImplementationOnce(()=>{throw new Error('mount failed');}).mockImplementation(()=>renderer);
  const load=jest.fn(async()=>({mountInformationPages:mount,mountChrome:chrome}));
  const bridge=createInformationBridge({onNavigate:navigate,onBack(){},onError:error,load});
  bridge.show('about');await Promise.resolve();await Promise.resolve();await Promise.resolve();
  expect(error).toHaveBeenCalledTimes(1);document.getElementById('contactBtn')!.click();expect(navigate).toHaveBeenCalledWith('contact');
  bridge.show('contact');await Promise.resolve();await Promise.resolve();
  expect(load).toHaveBeenCalledTimes(2);expect(mount).toHaveBeenCalledTimes(1);expect(chrome).toHaveBeenCalledTimes(2);
  bridge.dispose();
});

test('inert compiled About content stays outside startup DOM and opens synchronously before its chunk',()=>{
 setContent('<section id="aboutView"><template><button data-react-back>Back</button><p id="aboutFeatureSummary" data-full-summary="Full">Free</p><a href="/single-trigger-press-guide/">Guide</a></template></section><section id="contactView"></section>');
 const onBack=jest.fn(),load=jest.fn(()=>new Promise<never>(()=>{}));const bridge=createInformationBridge({onNavigate:jest.fn(),onBack,onError:jest.fn(),load});
 bridge.setFull(true);bridge.show('home');expect(document.getElementById('aboutFeatureSummary')).toBeNull();expect(load).not.toHaveBeenCalled();bridge.show('about');expect(document.getElementById('aboutFeatureSummary')?.textContent).toBe('Full');expect(document.querySelector('#aboutView template')).toBeNull();document.querySelector<HTMLButtonElement>('#aboutView button')!.click();expect(onBack).toHaveBeenCalledTimes(1);bridge.show('about');expect(document.querySelectorAll('#aboutFeatureSummary')).toHaveLength(1);bridge.dispose();
});

test('a disposed information owner cannot materialize a deferred page or load its runtime',()=>{
 setContent('<section id="aboutView"><template><p id="aboutFeatureSummary">Free</p></template></section><section id="contactView"></section>');const load=jest.fn(()=>new Promise<never>(()=>{}));const bridge=createInformationBridge({onNavigate:jest.fn(),onBack:jest.fn(),onError:jest.fn(),load});bridge.dispose();bridge.show('about');expect(document.querySelector('#aboutView template')).not.toBeNull();expect(document.getElementById('aboutFeatureSummary')).toBeNull();expect(load).not.toHaveBeenCalled();
});

test('missing About host remains safe for fallback calls without mutating another page',()=>{
 setContent('<section id="contactView"></section>');const load=jest.fn(()=>new Promise<never>(()=>{}));const bridge=createInformationBridge({onNavigate:jest.fn(),onBack:jest.fn(),onError:jest.fn(),load});bridge.setFull(true);bridge.show('about');expect(document.getElementById('aboutFeatureSummary')).toBeNull();expect(document.getElementById('contactView')?.childNodes).toHaveLength(0);bridge.dispose();
});
