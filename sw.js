/**
 * BAHI.ar - Service Worker
 * v4.0
 *
 * Estrategias de caché:
 * ┌─────────────────────────────────┬──────────────────────────────────────────┐
 * │ Tipo de request                 │ Estrategia                               │
 * ├─────────────────────────────────┼──────────────────────────────────────────┤
 * │ Navegación HTML (mode=navigate) │ Network-First → evita HTML atrapado      │
 * │ /data/turnero.json              │ Stale-While-Revalidate → urgencia: dato  │
 * │                                 │ disponible al instante, actualiza en BG  │
 * │ /data/*.json (resto)            │ Network-First → padrón siempre fresco    │
 * │ Shell (CSS, JS, manifest)       │ Cache-First → carga instantánea          │
 * │ Assets estáticos sin precachear │ Cache-First con fallback a red           │
 * └─────────────────────────────────┴──────────────────────────────────────────┘
 */

// ─── Versión ──────────────────────────────────────────────────────────────────
// ⚠ Incrementar en cada deploy para invalidar el caché y forzar install.
// v4.38: botón Compartir movido a section-header; limpieza visual btn-share-wa.
const CACHE_VERSION = 'v4.101';
const CACHE_NAME      = `bahi-static-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `bahi-data-${CACHE_VERSION}`;

// ─── Shell assets → Cache-First ───────────────────────────────────────────────
const SHELL_ASSETS = [
    './',
    './index.html',
    './farmacias.html',
    './guardias.html',
    './laboratorios.html',
    './style.css',
    './app.js',
    './manifest.json',
];

// ─── Datos → precacheados en DATA_CACHE_NAME ──────────────────────────────────
const DATA_FILES = [
    './data/bd_bahiar.json',
    './data/turnero.json',   // Crítico: determina la farmacia de turno del día
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Filtra requests que no deben interceptarse (no-GET, externos, el propio SW). */
function shouldHandle(request) {
    if (request.method !== 'GET') return false;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return false;
    if (url.pathname.includes('sw.js')) return false;
    return true;
}

/** Devuelve true para requests de navegación de página completa. */
function isNavigationRequest(request) {
    return request.mode === 'navigate';
}

/**
 * Devuelve true para turnero.json.
 * Este archivo cambia cada día → usa Stale-While-Revalidate:
 * responde con caché inmediatamente y actualiza en segundo plano.
 * El usuario ve datos al instante aunque esté en 3G.
 */
function isTurneroRequest(url) {
    return url.pathname.endsWith('turnero.json');
}

/** Devuelve true para cualquier JSON en /data/ (excepto turnero). */
function isDataRequest(url) {
    return url.pathname.endsWith('.json') && url.pathname.includes('/data/');
}

/** Guarda en caché solo respuestas básicas con status 200. */
async function putInCache(cacheName, request, response) {
    if (!response || response.status !== 200 || response.type === 'opaque') return;
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
}

/** Notifica a todos los clientes con ventana abierta. */
async function notificarClientes(payload) {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.postMessage(payload));
}

// ─── INSTALL ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            // Shell → CACHE_NAME
            const shellCache = await caches.open(CACHE_NAME);
            await Promise.allSettled(
                SHELL_ASSETS.map(asset =>
                    shellCache.add(asset).catch(err =>
                        console.warn(`[SW] No se pudo cachear shell "${asset}":`, err.message)
                    )
                )
            );

            // Datos → DATA_CACHE_NAME
            const dataCache = await caches.open(DATA_CACHE_NAME);
            await Promise.allSettled(
                DATA_FILES.map(asset =>
                    dataCache.add(asset).catch(err =>
                        console.warn(`[SW] No se pudo cachear data "${asset}":`, err.message)
                    )
                )
            );

            await self.skipWaiting();        })()
    );
});

// ─── ACTIVATE ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const allCaches = await caches.keys();
            await Promise.all(
                allCaches
                    .filter(name => name !== CACHE_NAME && name !== DATA_CACHE_NAME)
                    .map(name => {
                        return caches.delete(name);
                    })
            );

            await self.clients.claim();
            // Notifica a los clientes abiertos que hay una versión nueva.
            // app.js mostrará el banner de actualización.
            await notificarClientes({ type: 'SW_UPDATED', version: CACHE_VERSION });
        })()
    );
});

// ─── FETCH ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
    if (!shouldHandle(event.request)) return;

    const url = new URL(event.request.url);

    // ── 1. Network-First para navegación HTML ────────────────────────────────
    // Garantiza que el HTML sea siempre el más reciente tras un deploy.
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

    // ── 2. Stale-While-Revalidate para turnero.json ──────────────────────────
    if (isTurneroRequest(url)) {
        event.respondWith(
            (async () => {
                const cached = await caches.match(event.request);

                // Lanzar la actualización en segundo plano (no await aquí)
                const networkPromise = fetch(event.request).then(async (response) => {
                    await putInCache(DATA_CACHE_NAME, event.request, response.clone());
                    await notificarClientes({ type: 'TURNERO_ACTUALIZADO' });
                    return response;
                }).catch(() => {
                    // Sin red en segundo plano: silencioso, ya tenemos el caché
                });

                if (cached) {
                    // Respuesta inmediata desde caché
                    return cached;
                }

                // Sin caché → esperar la red (primera carga o caché limpio)
                try {
                    return await networkPromise || new Response(
                        JSON.stringify({ error: 'Sin datos de turno disponibles.' }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    );
                } catch {
                    return new Response(
                        JSON.stringify({ error: 'Sin conexión y sin datos de turno en caché.' }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            })()
        );
        return;
    }

    // ── 3. Network-First para el resto de datos JSON ─────────────────────────
    // bd_bahiar.json se actualiza menos frecuentemente, pero queremos datos frescos.
    if (isDataRequest(url)) {
        event.respondWith(
            (async () => {
                try {
                    const response = await fetch(event.request);
                    await putInCache(DATA_CACHE_NAME, event.request, response.clone());
                    await notificarClientes({ type: 'DATOS_FRESCOS' });
                    return response;
                } catch {
                    console.warn('[SW] Sin red para datos, usando caché.');
                    const cached = await caches.match(event.request);
                    if (cached) {
                        await notificarClientes({ type: 'DATOS_EN_CACHE' });
                        return cached;
                    }
                    return new Response(
                        JSON.stringify({ error: 'Sin conexión y sin datos en caché.' }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            })()
        );
        return;
    }

    // ── 4. Cache-First para assets estáticos (CSS, JS, imágenes, fuentes) ────
    // Carga instantánea desde caché; solo va a la red si no está cacheado.
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
    // Compatible con {action: 'skipWaiting'} y string plano 'SKIP_WAITING'
    if (
        event.data?.action === 'skipWaiting' ||
        event.data === 'SKIP_WAITING'
    ) {
        self.skipWaiting();
    }
});
