const CACHE = 'aya-photo-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'ort.wasm.min.js', 'ort-wasm-simd-threaded.mjs'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // app page: network first (gets updates), fall back to cache offline
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
    return;
  }
  // everything else (runtime, neural model): cache first, store on first use
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok){ const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })));
});
