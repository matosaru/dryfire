// Minimal app-shell cache for HTTPS deployments. This does NOT cache audio or IndexedDB data.
const CACHE = `dryfire-sound-trainer-${typeof __BUILD_EDITION__ === 'undefined' ? 'public' : __BUILD_EDITION__}-v27`;
const BASE_FILES = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/logo.svg', '/gun-types/handgun.svg', '/gun-types/rifle.svg', '/gun-types/shotgun.svg', '/gun-types/unknown.svg', '/pcm-capture.worklet.js', '/motions/draw.svg', '/motions/rack.svg', '/motions/trigger.svg', '/motions/reload.svg', '/motions/draw.gif', '/motions/rack.gif', '/motions/trigger.gif', '/motions/reload.gif'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch('/index.html', { cache: 'reload' });
    if (!response.ok) throw new Error('Could not preload the app shell.');
    const html = await response.clone().text();
    const assets = Array.from(html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g), match => match[1]);
    await cache.addAll([...new Set([...BASE_FILES, ...assets])]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('dryfire-sound-trainer-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && ['script', 'style', 'image', 'document'].includes(request.destination)) {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const shell = await cache.match('/index.html');
        if (shell) return shell;
      }
      throw error;
    }
  })());
});
