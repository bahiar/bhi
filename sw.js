const CACHE_NAME = 'bahi-cache-v2.5';
const DATA_CACHE_NAME = 'bahi-data-cache-v2.5';

// Assets del shell de la app (Cache-first)
const SHELL_ASSETS = [
  './', 
  './index.html', 
  './style.css', 
  './app.js', 
  './nav.html', 
  './farmacias.html', 
  './guardias.html', 
  './laboratorios.html',
  './manifest.json'
];

// Assets de datos (Stale-While-Revalidate)
// Añadimos turnero.json para que las farmacias de turno funcionen offline
const DATA_ASSETS = [
  './data/bd_bahiar.json',
  './data/turnero.json'
];

// Instalar: precachear el shell y los datos
self.addEventListener('install', (e) => {
  e.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)),
      caches.open(DATA_CACHE_NAME).then((cache) => cache.addAll(DATA_ASSETS))
    ]).then(() => self.skipWaiting())
  );
});

// Activar: limpiar cachés viejas
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== DATA_CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: estrategia diferenciada
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Stale-While-Revalidate para archivos JSON (Datos)
  if (url.pathname.endsWith('.json') && url.pathname.includes('/data/')) {
    e.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(e.request)
          .then((networkResponse) => {
            cache.put(e.request, networkResponse.clone());
            self.clients.matchAll().then((clients) =>
              clients.forEach((c) => c.postMessage({ tipo: 'DATOS_FRESCOS' }))
            );
            return networkResponse;
          })
          .catch(() => {
            return cache.match(e.request).then((cached) => {
              if (cached) {
                self.clients.matchAll().then((clients) =>
                  clients.forEach((c) => c.postMessage({ tipo: 'DATOS_EN_CACHE' }))
                );
                return cached;
              }
            });
          });
      })
    );
    return;
  }

  // Cache-first para el resto de assets
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
