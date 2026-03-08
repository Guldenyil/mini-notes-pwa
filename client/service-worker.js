const APP_SHELL_CACHE = 'mini-notes-shell-v2';
const RUNTIME_CACHE = 'mini-notes-runtime-v2';

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-512-maskable.png'
];

function isStaticAsset(requestUrl) {
  return requestUrl.pathname.startsWith('/assets/')
    || requestUrl.pathname.endsWith('.css')
    || requestUrl.pathname.endsWith('.js')
    || requestUrl.pathname.endsWith('.svg')
    || requestUrl.pathname.endsWith('.png')
    || requestUrl.pathname.endsWith('.json');
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_SHELL_CACHE);
    await Promise.all(
      APP_SHELL_URLS.map(async (url) => {
        try {
          await cache.add(url);
        } catch (_error) {
        }
      })
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        return networkResponse;
      } catch (_error) {
        const cache = await caches.open(APP_SHELL_CACHE);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  if (isStaticAsset(requestUrl)) {
    event.respondWith((async () => {
      const runtimeCache = await caches.open(RUNTIME_CACHE);
      const cachedResponse = await runtimeCache.match(request);

      if (cachedResponse) {
        return cachedResponse;
      }

      const networkResponse = await fetch(request);
      runtimeCache.put(request, networkResponse.clone());
      return networkResponse;
    })());
  }
});
