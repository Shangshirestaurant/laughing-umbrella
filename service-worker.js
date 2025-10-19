
/* service-worker.js — simple, versioned pre-cache */
const VERSION = 'v3';
const PRECACHE = `precache-${VERSION}`;
const RUNTIME = `runtime-${VERSION}`;

// add/adjust assets as your bundle changes
const CORE_ASSETS = [
  './',
  './index.html',
  './menu.html',
  './styles.css',
  './app.js',
  './guest.js',
  './logo.png',
  './apple-icon-180.png',
  './manifest.webmanifest',
  './pwa.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE).then(cache => cache.addAll(CORE_ASSETS)).then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k.startsWith('precache-') || k.startsWith('runtime-')) && k !== PRECACHE && k !== RUNTIME ? caches.delete(k) : null))
    ).then(() => self.clients.claim())
  );
});

// Helper: network-first for JSON and HTML, cache-first for static
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  // same-origin only
  if (url.origin !== location.origin) return;

  // JSON + pages: network-first with fallback to cache
  if (req.destination === 'document' || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(RUNTIME).then(cache => cache.put(req, copy));
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // everything else: cache-first then network
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(RUNTIME).then(cache => cache.put(req, copy));
      return resp;
    }))
  );
});

// allow page to trigger skip waiting
self.addEventListener('message', evt => {
  if (evt.data && evt.data.type === 'SKIP_WAITING') self.skipWaiting();
});
