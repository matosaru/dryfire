// Classic worker: build inputs are replaced by Vite, without runtime imports.
const appPaths = __APP_OFFLINE_PATHS__;
const navRedirects = __APP_NAV_REDIRECTS__;
const EDITION = typeof __BUILD_EDITION__ === 'undefined' ? 'public' : __BUILD_EDITION__;
const RELEASE = __BUILD_RELEASE_ID__;
const PREFIX = 'dryfire-sound-trainer-public-';
const CACHE = `${PREFIX}${RELEASE}`;
const COMPLETE = '/__release_complete__';
const BASE_FILES = ['/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/logo.svg', '/favicon.ico', '/gun-types/handgun.svg', '/gun-types/rifle.svg', '/gun-types/shotgun.svg', '/gun-types/unknown.svg', '/pcm-capture.worklet.js', '/motions/draw.svg', '/motions/rack.svg', '/motions/trigger.svg', '/motions/reload.svg', '/motions/draw.gif', '/motions/rack.gif', '/motions/trigger.gif', '/motions/reload.gif'];
const safePath = path => typeof path === 'string' && /^\/[a-zA-Z0-9_./-]+$/.test(path) && !path.includes('..') && !path.includes('//');
async function digest(response) {
  const bytes = await crypto.subtle.digest('SHA-256', await response.arrayBuffer());
  return Array.from(new Uint8Array(bytes), value => value.toString(16).padStart(2, '0')).join('');
}
if (EDITION === 'preview') {
  // Private builds must never retain authenticated offline shells.
  self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
  self.addEventListener('activate', event => event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('dryfire-sound-trainer-')) await caches.delete(key);
    await self.clients.claim(); await self.registration.unregister();
  })()));
} else {
  self.addEventListener('install', event => event.waitUntil((async () => {
    const [shell, metadataResponse] = await Promise.all(['/index.html', '/edition.json'].map(path => fetch(path, {cache:'reload'})));
    if (!shell.ok || !metadataResponse.ok) throw new Error('Could not preload release.');
    const html = await shell.clone().text(), metadata = await metadataResponse.clone().json();
    if (metadata.edition !== EDITION || metadata.release !== RELEASE || !html.includes(`data-release-id="${RELEASE}"`) || !Array.isArray(metadata.assets) || !metadata.assets.every(safePath)) throw new Error('Release metadata mismatch.');
    const paths = [...new Set([...BASE_FILES, ...metadata.assets])];
    // Validate every response before writing anything, then mark completeness last.
    const responses = await Promise.all(paths.map(async path => {
      const expected = metadata.assetDigests?.[path];
      if (!/^[a-f0-9]{64}$/.test(expected ?? '')) throw new Error('Missing asset digest.');
      const response = await fetch(path, {cache:'reload'});
      if (!response.ok || await digest(response.clone()) !== expected) throw new Error('Incomplete release asset.');
      return [path, response];
    }));
    const cache = await caches.open(CACHE);
    for (const [path, response] of responses) await cache.put(path, response);
    await cache.put('/index.html', shell); await cache.put('/edition.json', metadataResponse);
    await cache.put(COMPLETE, new Response(RELEASE));
    // Normal activation waits for existing tabs; never interrupt a drill or draft.
  })()));
  self.addEventListener('activate', event => event.waitUntil((async () => {
    // A waiting/older tab may still need its lazy bundles. Cleanup only without clients.
    const clients = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    if (clients.length || self.registration.waiting || self.registration.installing) return;
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
  })()));
  self.addEventListener('fetch', event => {
    const {request} = event, url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;
    if (request.mode === 'navigate' && navRedirects[url.pathname]) {
      event.respondWith(Promise.resolve(Response.redirect(new URL(navRedirects[url.pathname] + url.search, url.origin), 308))); return;
    }
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      if (request.mode === 'navigate') {
        try { return await fetch(request); }
        catch (error) {
          if (url.pathname === '/' || url.pathname === '/index.html' || appPaths.includes(url.pathname)) {
            const shell = await cache.match('/index.html'); if (shell && await cache.match(COMPLETE)) return shell;
          }
          throw error;
        }
      }
      // Content-addressed bundles are immutable. Stable filenames always revalidate.
      const hashed = /^\/assets\/[^/]+-[a-zA-Z0-9_-]+\.(?:js|css)$/.test(url.pathname);
      if (hashed) { const cached = await cache.match(request); if (cached) return cached; }
      try { return await fetch(request); }
      catch (error) { const cached = await cache.match(request); if (cached && await cache.match(COMPLETE)) return cached; throw error; }
    })());
  });
}
