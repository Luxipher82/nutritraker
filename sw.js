const CACHE_NAME = 'nutritracker-cache-v1';
const urlsToCache = [
    './index.html',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
];

// Installazione del Service Worker e salvataggio in cache delle risorse base
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Attivazione e pulizia delle vecchie cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Intercettazione delle richieste di rete (Network falling back to cache)
self.addEventListener('fetch', event => {
    // Escludiamo la chiamata al file Excel remoto di GitHub per evitare che usi dati vecchi offline
    if (event.request.url.includes('raw.githubusercontent.com')) {
        event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
