const CACHE_NAME = 'bahi-cache-v2';
const DATA_CACHE_NAME = 'bahi-data-cache-v2';

// Assets del shell de la app (Cache-first)
const SHELL_ASSETS = ['./', './index.html', './style.css', './app.js', './nav.html', './farmacias.html', './guardias.html', './laboratorios.html'];

// Instalar: precachear el shell completo y activar inmediatamente
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar: limpiar cachés viejas y tomar control de clientes abiertos
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

// Fetch: estrategia diferenciada por tipo de recurso
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Stale-While-Revalidate para el JSON de datos
  if (url.pathname.includes('bd_bahiar.json')) {
    e.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(e.request)
          .then((networkResponse) => {
            // Respuesta fresca de red: actualizar caché y marcar como fresca
            cache.put(e.request, networkResponse.clone());
            // Notificar a los clientes que los datos son frescos
            self.clients.matchAll().then((clients) =>
              clients.forEach((c) => c.postMessage({ tipo: 'DATOS_FRESCOS' }))
            );
            return networkResponse;
          })
          .catch(() => {
            // Sin red: servir desde caché y avisar que son datos guardados
            return cache.match(e.request).then((cached) => {
              if (cached) {
                self.clients.matchAll().then((clients) =>
                  clients.forEach((c) => c.postMessage({ tipo: 'DATOS_EN_CACHE' }))
                );
                return cached;
              }
              // Sin caché tampoco: respuesta de error legible
              return new Response(
                JSON.stringify({ error: 'Sin conexión y sin datos guardados.' }),
                { headers: { 'Content-Type': 'application/json' } }
              );
            });
          });
      })
    );
    return;
  }

  // Cache-first para el resto de assets del shell
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});

// Notificar a los clientes cuando hay una nueva versión esperando
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
