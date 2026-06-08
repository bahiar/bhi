/**
 * BAHI.ar - Service Worker
 * Base: sw.js v2.5
 *
 * Mejoras incorporadas desde service-worker.js:
 * - Promise.allSettled() en install: un asset fallido no aborta el precacheo completo.
 * - skipWaiting() al final del install, garantizando que el caché esté listo antes
 *   de tomar el control.
 * - Network-First para requests de navegación HTML (request.mode === 'navigate'):
 *   evita que el HTML shell quede atrapado en caché entre deploys.
 * - Respuesta 503 estructurada para datos JSON sin red ni caché.
 * - Notificación SW_UPDATED a todos los clientes al activarse.
 * - shouldHandle() para filtrar requests no-GET y orígenes externos.
 * - Manejo de mensaje 'skipWaiting' compatible con objeto {action} y string plano.
 */

// ─── Versión ─────────────────────────────────────────────────────────────────
// Incrementar en cada deploy para forzar el ciclo install→activate.
const CACHE_VERSION  = 'v3.0';
const CACHE_NAME     = `bahi-static-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `bahi-data-${CACHE_VERSION}`;

// ─── Assets del shell (Cache-First) ──────────────────────────────────────────
const SHELL_ASSETS = [
  './',
  './index.html',
  './farmacias.html',
  './guardias.html',
  './laboratorios.html',
  './nav.html',
  './style.css',
  './app.js',
  './manifest.json',
];

// ─── Datos (Network-First) ────────────────────────────────────────────────────
const DATA_FILES = [
  './data/bd_bahiar.json',
  './data/turnero.json',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Filtra requests que no deben interceptarse. */
function shouldHandle(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.includes('sw.js')) return false;
  return true;
}

/** Devuelve true para requests de navegación HTML (carga de página). */
function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

/** Devuelve true para archivos de datos JSON. */
function isDataRequest(url) {
  return url.pathname.endsWith('.json') && url.pathname.includes('/data/');
}

/** Guarda en caché solo respuestas básicas con status 200. */
async function putInCache(cacheName, request, response) {
  if (!response || response.status !== 200 || response.type === 'opaque') return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

// ─── INSTALL ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  console.log(`[SW ${CACHE_VERSION}] install`);
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // allSettled: un asset fallido no aborta el install completo.
      await Promise.allSettled(
        [...SHELL_ASSETS, ...DATA_FILES].map(asset =>
          cache.add(asset).catch(err =>
            console.warn(`[SW] No se pudo cachear "${asset}":`, err.message)
          )
        )
      );

      // skipWaiting al final, con el caché ya listo.
      await self.skipWaiting();
      console.log(`[SW ${CACHE_VERSION}] install completo.`);
    })()
  );
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  console.log(`[SW ${CACHE_VERSION}] activate — limpiando cachés viejos`);
  event.waitUntil(
    (async () => {
      const allCaches = await caches.keys();
      await Promise.all(
        allCaches
          .filter(name => name !== CACHE_NAME && name !== DATA_CACHE_NAME)
          .map(name => {
            console.log(`[SW] Borrando caché viejo: ${name}`);
            return caches.delete(name);
          })
      );

      await self.clients.claim();
      console.log(`[SW ${CACHE_VERSION}] activate completo.`);

      // Notifica a todos los clientes que hay una versión nueva.
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client =>
        client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION })
      );
    })()
  );
});

// ─── FETCH ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  if (!shouldHandle(event.request)) return;

  const url = new URL(event.request.url);

  // ── Network-First para navegación HTML ──────────────────────────────────────
  // Evita que el HTML shell quede atrapado en caché entre deploys.
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          await putInCache(CACHE_NAME, event.request, response.clone());
          return response;
        } catch {
          console.warn('[SW] Sin red para navegación, usando caché.');
          return (
            await caches.match(event.request) ||
            await caches.match('./index.html')
          );
        }
      })()
    );
    return;
  }

  // ── Network-First para datos JSON + notificación al cliente ─────────────────
  if (isDataRequest(url)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          await putInCache(DATA_CACHE_NAME, event.request, response.clone());
          // Notificación conservada del sw.js original.
          const clients = await self.clients.matchAll();
          clients.forEach(c => c.postMessage({ tipo: 'DATOS_FRESCOS' }));
          return response;
        } catch {
          console.warn('[SW] Sin red para datos, usando caché.');
          const cached = await caches.match(event.request);
          if (cached) {
            const clients = await self.clients.matchAll();
            clients.forEach(c => c.postMessage({ tipo: 'DATOS_EN_CACHE' }));
            return cached;
          }
          // Respuesta de error estructurada en lugar de undefined.
          return new Response(
            JSON.stringify({ error: 'Sin conexión y sin datos en caché.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
      })()
    );
    return;
  }

  // ── Cache-First para assets estáticos ────────────────────────────────────────
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        await putInCache(CACHE_NAME, event.request, response);
        return response;
      } catch {
        console.warn('[SW] Sin red y sin caché para:', url.pathname);
        return new Response('Sin conexión', { status: 503 });
      }
    })()
  );
});

// ─── MENSAJES ─────────────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  // Compatible con objeto {action: 'skipWaiting'} y string plano 'SKIP_WAITING'.
  if (
    event.data?.action === 'skipWaiting' ||
    event.data === 'SKIP_WAITING'
  ) {
    console.log('[SW] skipWaiting manual solicitado.');
    self.skipWaiting();
  }
});
