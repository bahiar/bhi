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
// v4.128: incluir header-nav.js (componente unificado de navegación) y todas
// las páginas HTML nuevas (páginas legales, de construcción, etc.) en SHELL_ASSETS.
// Esto garantiza que offline funcione completo sin inconsistencias de nav.
// v4.129: header-nav.js corregido — Imágenes faltaba en FULL_NAV_ITEMS (nunca
// aparecía en el sub-nav pese a ser una sección 'full' terminada). También se
// corrigió la comparación de página activa para que no dependa de mayúsculas.
// v4.205: fix de casing "Imagenes.html" → "imagenes.html" en SHELL_ASSETS (el
// precache de esa página fallaba en silencio por mismatch de mayúsculas contra
// el filesystem case-sensitive de GitHub Pages). También se agregó
// updateViaCache:'none' al register() en app.js, para que el navegador no siga
// sirviendo sw.js desde su propia caché HTTP al chequear actualizaciones.
// v4.249: "portada.html" reemplazó a "index.html" (deploy directo, mismo
// nombre) — se saca "./portada.html" de SHELL_ASSETS porque ya no existe
// como archivo aparte; precachearlo generaba un warning de fetch fallido
// en cada install.
// v4.339: "enfermeria.html" → "patologia.html" en SHELL_ASSETS. La página de
// Enfermería se descontinuó (bottom-nav-v2.js y app.js ya apuntan a
// Patología); dejar la entrada vieja generaba un fetch fallido en cada
// install y dejaba la página nueva fuera del app-shell offline.
// v4.341: "style.css" → "style2.css" en SHELL_ASSETS. style.css ya no se usa
// (index.html carga style2.css); precachear el archivo viejo dejaba la hoja
// de estilos real fuera del app-shell durante el install, aunque terminaba
// cacheándose igual en la primera visita online vía el fetch handler
// cache-first. style.css se puede borrar del repo.
const CACHE_VERSION = 'v4.360';
const CACHE_NAME      = `bahi-static-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `bahi-data-${CACHE_VERSION}`;

// ─── Shell assets → Cache-First ───────────────────────────────────────────────
const SHELL_ASSETS = [
    './',
    './index.html',
    './emergencias.html',
    './unidades.html',
    './guardias.html',
    './farmacias.html',
    './laboratorios.html',
    './ortopedias.html',
    './imagenes.html',
    './privacidad.html',
    './terminos.html',
    './aviso-legal.html',
    './patologia.html',
    './fonoaudiologia.html',
    './kinesiologia.html',
    './nutricion.html',
    './opticas.html',
    './assets/cuadros/CLOCK.svg',
    './assets/cuadros/OOSS.svg',
    './assets/cuadros/STOCK.svg',
    './style2.css',
    './app.js',
    './js/header-nav.js',
    './js/bottom-nav-v2.js',
    './manifest.json',
];

// ─── Datos → precacheados en DATA_CACHE_NAME ──────────────────────────────────
const DATA_FILES = [
    './data/bd_bahiar.json',
    './data/turnero.json',   // Crítico: determina la farmacia de turno del día
    './data/ortopedia.json',
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

/**
 * Descarga un asset ignorando el caché HTTP del navegador y lo guarda
 * en la cache indicada. Evita que cache.add() reutilice una respuesta
 * vieja servida desde el HTTP cache (bug clásico: CACHE_VERSION nueva
 * pero contenido viejo adentro).
 */
async function fetchAndCache(cacheName, asset) {
    const cache = await caches.open(cacheName);
    const request = new Request(asset, { cache: 'reload' }); // 'reload' = bypass HTTP cache
    const response = await fetch(request);
    if (response && response.status === 200) {
        await cache.put(asset, response.clone());
    }
    return response;
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
            // Shell → CACHE_NAME (fetch forzado sin HTTP cache)
            await Promise.allSettled(
                SHELL_ASSETS.map(asset =>
                    fetchAndCache(CACHE_NAME, asset).catch(err =>
                        console.warn(`[SW] No se pudo cachear shell "${asset}":`, err.message)
                    )
                )
            );

            // Datos → DATA_CACHE_NAME (fetch forzado sin HTTP cache)
            await Promise.allSettled(
                DATA_FILES.map(asset =>
                    fetchAndCache(DATA_CACHE_NAME, asset).catch(err =>
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
