// Trading Checklist service worker
const V = 'tc-v3-4';
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

// অনলাইনে সবসময় নতুন ভার্সন আনে, অফলাইনে বা ধীর নেটে ক্যাশ থেকে দেখায়
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const fromCache = () => caches.match(e.request, { ignoreSearch: true }).then(h => h || caches.match('./index.html'));
  const net = fetch(e.request).then(r => {
    if (r && r.ok && new URL(e.request.url).origin === location.origin) {
      const copy = r.clone();
      caches.open(V).then(c => c.put(e.request, copy));
    }
    return r;
  });
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 4000));
  e.respondWith(Promise.race([net, timeout]).catch(fromCache));
});
