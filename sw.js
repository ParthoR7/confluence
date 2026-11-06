// Trading Checklist service worker: অফলাইনে চালানোর জন্য
const V = 'tc-v3-3';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ক্যাশ থেকে সাথে সাথে দেখায়, পেছনে নতুন ভার্সন এনে রাখে (পরের বার খুললে নতুনটা আসে)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      const net = fetch(e.request).then(r => {
        if (r && r.ok && new URL(e.request.url).origin === location.origin) {
          const copy = r.clone();
          caches.open(V).then(c => c.put(e.request, copy));
        }
        return r;
      }).catch(() => hit || caches.match('./index.html'));
      return hit || net;
    })
  );
});
