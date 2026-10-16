/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { createInformationBridge } from './informationBridge.ts';

test('the render runtime loads only on an informational route and receives the latest edition', async () => {
  const back = jest.fn(), error = jest.fn();
  const pages = { setFull: jest.fn(), dispose: jest.fn() };
  const mount = jest.fn(() => pages);
  let resolve!: (module: { mountInformationPages: typeof mount }) => void;
  const load = jest.fn(() => new Promise<{ mountInformationPages: typeof mount }>(done => { resolve = done; }));
  document.body.innerHTML = '<section id="aboutView"><button data-react-back>Back</button></section><section id="contactView"></section>';
  const bridge = createInformationBridge({ onBack: back, onError: error, load });
  bridge.show('home'); bridge.setFull(true);
  expect(load).not.toHaveBeenCalled();
  bridge.show('about'); bridge.show('contact');
  expect(load).toHaveBeenCalledTimes(1);
  document.querySelector<HTMLButtonElement>('[data-react-back]')!.click();
  expect(back).toHaveBeenCalledTimes(1);
  bridge.setFull(false); bridge.setFull(true);
  resolve({ mountInformationPages: mount });
  await Promise.resolve(); await Promise.resolve();
  expect(mount).toHaveBeenCalledTimes(1);
  expect(pages.setFull).toHaveBeenLastCalledWith(true);
  bridge.setFull(false);
  expect(pages.setFull).toHaveBeenLastCalledWith(false);
  document.querySelector<HTMLButtonElement>('[data-react-back]')!.click();
  expect(back).toHaveBeenCalledTimes(1); // React now owns its own Back callback.
  bridge.dispose(); bridge.dispose();
  expect(pages.dispose).toHaveBeenCalledTimes(1);
  expect(error).not.toHaveBeenCalled();
});

test('a failed chunk keeps static navigation usable and retries on the next visit', async () => {
  document.body.innerHTML = '<section id="aboutView"><button data-react-back>Back</button></section><section id="contactView"></section>';
  const onError = jest.fn(), onBack = jest.fn();
  const pages = { setFull: jest.fn(), dispose: jest.fn() };
  const mount = jest.fn(() => pages);
  const load = jest.fn<() => Promise<{ mountInformationPages: typeof mount }>>()
    .mockRejectedValueOnce(new Error('offline chunk'))
    .mockResolvedValueOnce({ mountInformationPages: mount });
  const bridge = createInformationBridge({ onBack, onError, load });
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
  let resolve!: (module: { mountInformationPages: ReturnType<typeof jest.fn> }) => void;
  const mount = jest.fn(() => ({ setFull() {}, dispose() {} }));
  const load = () => new Promise<{ mountInformationPages: typeof mount }>(done => { resolve = done; });
  const bridge = createInformationBridge({ onBack() {}, onError() {}, load });
  bridge.show('about'); bridge.dispose(); resolve({ mountInformationPages: mount });
  await Promise.resolve(); await Promise.resolve();
  expect(mount).not.toHaveBeenCalled();
});
