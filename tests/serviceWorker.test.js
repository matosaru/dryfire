import { jest } from '@jest/globals';
import { offlineAppPaths } from '../src/appPaths.js';

let handlers, cache, platform, metadata;
beforeEach(() => {
  jest.resetModules();
  globalThis.__APP_OFFLINE_PATHS__ = offlineAppPaths();
  handlers = {};
  cache = { addAll: jest.fn(async () => {}), match: jest.fn(async () => undefined), put: jest.fn(async () => {}) };
  platform = { skipWaiting: jest.fn(async () => {}), clients: { claim: jest.fn(async () => {}) },
    registration: { unregister: jest.fn(async () => {}) }, location: { origin: 'https://practice.test' },
    addEventListener: (name, callback) => { handlers[name] = callback; } };
  globalThis.self = platform;
  globalThis.caches = { open: jest.fn(async () => cache), keys: jest.fn(async () => ['dryfire-sound-trainer-public-v1','unrelated-cache']), delete: jest.fn(async () => true) };
  metadata = { edition: 'public', assets: ['/assets/entry.js','/assets/informationPages.js','/assets/app.css'] };
  globalThis.fetch = jest.fn(async input => input === '/edition.json'
    ? Response.json(metadata) : new Response('<script type="module" src="/assets/entry.js"></script>'));
});
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; delete globalThis.self; delete globalThis.caches; delete globalThis.__BUILD_EDITION__; delete globalThis.__APP_OFFLINE_PATHS__; });

async function install(edition = 'public') { globalThis.__BUILD_EDITION__ = edition; await import('../workers/sw.js'); }
function fire(type, request) {
  let pending;
  handlers[type]({ request, waitUntil: value => { pending = value; }, respondWith: value => { pending = value; } });
  return pending;
}
const request = (path = '/assets/entry.js', extra = {}) => ({ url: 'https://practice.test'+path, method: 'GET', destination: 'script', ...extra });

test('public installation precaches every declared lazy bundle and waits before activation', async () => {
  await install(); await fire('install');
  expect(cache.addAll).toHaveBeenCalledTimes(1);
  expect(cache.addAll.mock.calls[0][0]).toEqual(expect.arrayContaining(metadata.assets));
  expect(cache.addAll.mock.calls[0][0]).toContain('/edition.json');
  expect(platform.skipWaiting).toHaveBeenCalledTimes(1);
});

test.each(['wrong-edition','missing-assets','unsafe-path','missing-html','missing-metadata'])('invalid %s cannot establish a public offline shell', async kind => {
  if (kind === 'wrong-edition') metadata.edition = 'preview';
  if (kind === 'missing-assets') metadata.assets = null;
  if (kind === 'unsafe-path') metadata.assets = ['/assets/../private.js'];
  if (kind === 'missing-html') fetch.mockResolvedValue(new Response('unavailable', { status: 503 }));
  if (kind === 'missing-metadata') fetch.mockImplementation(async input => input === '/edition.json' ? new Response('missing',{status:404}) : new Response('shell'));
  await install(); await expect(fire('install')).rejects.toThrow();
  expect(cache.addAll).not.toHaveBeenCalled(); expect(platform.skipWaiting).not.toHaveBeenCalled();
});

test('activation removes only superseded app caches and claims clients', async () => {
  await install(); await fire('activate');
  expect(caches.delete).toHaveBeenCalledWith('dryfire-sound-trainer-public-v1');
  expect(caches.delete).not.toHaveBeenCalledWith('unrelated-cache');
  expect(platform.clients.claim).toHaveBeenCalledTimes(1);
});

test('same-origin cache hits are served without network access', async () => {
  await install(); cache.match.mockResolvedValue(new Response('cached'));
  expect(await (await fire('fetch',request())).text()).toBe('cached');
  expect(fetch).not.toHaveBeenCalled();
});

test('successful asset responses are cached, while failed responses and data requests are not', async () => {
  await install(); fetch.mockResolvedValueOnce(new Response('asset'));
  expect(await (await fire('fetch',request())).text()).toBe('asset'); expect(cache.put).toHaveBeenCalledTimes(1);
  cache.put.mockClear(); fetch.mockResolvedValueOnce(new Response('missing',{status:404}));
  expect((await fire('fetch',request())).status).toBe(404); expect(cache.put).not.toHaveBeenCalled();
  fetch.mockResolvedValueOnce(new Response('data'));
  await fire('fetch',request('/data.json',{destination:''})); expect(cache.put).not.toHaveBeenCalled();
});

test('non-GET and cross-origin requests bypass the shell cache entirely', async () => {
  await install();
  expect(fire('fetch',request('/api',{method:'POST'}))).toBeUndefined();
  expect(fire('fetch',request('/asset',{url:'https://other.test/asset'}))).toBeUndefined();
  expect(caches.open).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
});

test('offline navigation falls back to the shell; unavailable scripts still reject', async () => {
  await install(); fetch.mockRejectedValue(new Error('offline'));
  cache.match.mockImplementation(async input => input === '/index.html' ? new Response('offline shell') : undefined);
  expect(await (await fire('fetch',request('/app/history/',{mode:'navigate',destination:'document'}))).text()).toBe('offline shell');
  await expect(fire('fetch',request())).rejects.toThrow('offline');
});

test('private preview retires shell caches and unregisters without installing an offline fetch handler', async () => {
  await install('preview'); await fire('install'); await fire('activate');
  expect(handlers.fetch).toBeUndefined(); expect(cache.addAll).not.toHaveBeenCalled();
  expect(caches.delete).toHaveBeenCalledWith('dryfire-sound-trainer-public-v1');
  expect(caches.delete).not.toHaveBeenCalledWith('unrelated-cache');
  expect(platform.registration.unregister).toHaveBeenCalledTimes(1);
  expect(fetch).not.toHaveBeenCalled();
});

test('offline public/unknown URLs never become an app shell with a misleading200',async()=>{await install();fetch.mockRejectedValue(new Error('offline'));cache.match.mockImplementation(async input=>input==='/index.html'?new Response('offline shell'):undefined);await expect(fire('fetch',request('/help/',{mode:'navigate',destination:'document'}))).rejects.toThrow('offline');});
