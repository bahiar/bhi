/**
 * BAHI.ar - Núcleo de Lógica PWA
 * Arquitectura centralizada para sanitización, seguridad y renderizado.
 */

'use strict';

// ── 1. UTILIDADES GLOBALES DE SEGURIDAD ───────────────────────────────────────

/**
 * Escapa caracteres HTML para prevenir XSS.
 * Usado en todo el renderizado dinámico de datos del padrón.
 */
window.esc = (str) => {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
};

/**
 * Valida que una URL de Google Maps sea de un dominio permitido.
 * Previene que datos maliciosos en el JSON inyecten URLs arbitrarias.
 */
window.safeMapsUrl = (url) => {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        const allowed = ['maps.google.com', 'www.google.com', 'maps.app.goo.gl', 'goo.gl'];
        return allowed.some(domain => parsed.hostname.includes(domain)) ? url : null;
    } catch (_e) { return null; }
};

// ── 2. RENDERIZADO UNIVERSAL DE TARJETAS ──────────────────────────────────────

/**
 * Genera el HTML de una tarjeta colapsable para un prestador.
 *
 * Estructura de prioridad de carga dentro de la tarjeta:
 *   1. Nombre (.card-name)  ← primero en el DOM, primero en el ojo
 *   2. Dirección (.card-addr) ← segundo dato crítico
 *   3. Botones Llamar / Mapa  ← siempre visibles, sin requerir abrir el acordeón
 *   4. Cuerpo colapsable       ← info secundaria (horario, OOSS, etc.)
 *
 * El atributo data-estado en el <article> es leído por style.css
 * para aplicar el borde naranja + badge de estado sin JS adicional.
 *
 * @param {Object} item  - Objeto prestador del padrón JSON
 * @param {string} tipo  - 'TURNO', 'GUARDIA', etc. (usado para IDs únicos)
 * @param {number} index - Índice para generar IDs únicos
 */
window.crearCardHTML = (item, tipo, index) => {
    const bodyId = `card-body-${tipo}-${index}`;

    // Normalizar teléfonos: asegurar prefijo tel: o https:
    const linkTel = item.FIJO
        ? (item.FIJO.toLowerCase().startsWith('tel:') ? item.FIJO : 'tel:' + item.FIJO)
        : '';
    const linkMovil = item.MOVIL
        ? (item.MOVIL.toLowerCase().startsWith('https://') || item.MOVIL.toLowerCase().startsWith('tel:')
            ? item.MOVIL
            : 'tel:' + item.MOVIL)
        : '';
    const mapsUrl = window.safeMapsUrl(item.MAPS);

    // Determinar estado para el selector CSS data-estado
    // 'turno' → borde naranja + badge "De turno"
    // '24h'   → borde azul + badge "24 h"
    // ''      → card estándar sin highlight
    const estado = tipo === 'TURNO' ? 'turno' : (item.HORARIO_TIPO === '24h' ? '24h' : '');

    // Línea de dirección compacta: "Dirección · Localidad"
    const direccion = [item.DOMICILIO, item.LOCALIDAD]
        .filter(Boolean)
        .map(window.esc)
        .join(' · ');

    // Botones de acción principales (siempre visibles, sin abrir acordeón)
    // Llamar → naranja sólido (máxima urgencia)
    // WhatsApp → verde (color propio del canal)
    // Mapa → outline naranja (acción secundaria)
    const botonesAccion = [
        linkTel
            ? `<a href="${window.esc(linkTel)}" class="btn btn-accent"
                  aria-label="Llamar a ${window.esc(item.PRESTADOR)}">📞 Llamar</a>`
            : '',
        linkMovil && linkMovil.startsWith('https://')
            ? `<a href="${window.esc(linkMovil)}" class="btn btn-whatsapp"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp de ${window.esc(item.PRESTADOR)}">WhatsApp</a>`
            : (linkMovil
                ? `<a href="${window.esc(linkMovil)}" class="btn btn-accent"
                      aria-label="Llamar a ${window.esc(item.PRESTADOR)}">📞 Llamar</a>`
                : ''),
        mapsUrl
            ? `<a href="${window.esc(mapsUrl)}" class="btn btn-outline"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Ver mapa de ${window.esc(item.PRESTADOR)}">📍 Mapa</a>`
            : ''
    ].filter(Boolean).join('');

    // Filas del cuerpo colapsable (info secundaria)
    const filasCuerpo = [
        item.HORARIO && `<p class="card-detail-row"><strong>Horario:</strong> ${window.esc(item.HORARIO)}</p>`,
        item.OOSS    && `<p class="card-detail-row"><strong>Obra social:</strong> ${window.esc(item.OOSS)}</p>`,
        item.STOCK   && `<p class="card-detail-row"><strong>Stock:</strong> ${window.esc(item.STOCK)}</p>`
    ].filter(Boolean).join('');

    return `
<article class="card" data-estado="${window.esc(estado)}" data-tipo="${window.esc(tipo)}">

    <!-- ZONA 1: Cabecera siempre visible (nombre + dirección) -->
    <!-- Está en el DOM antes que los botones y el ícono decorativo -->
    <div class="card-top">
        <div class="card-info">
            <h3 class="card-name">${window.esc(item.PRESTADOR)}</h3>
            ${direccion ? `<p class="card-addr">${direccion}</p>` : ''}
        </div>
        <!-- Ícono decorativo: después del texto en el DOM -->
        <div class="card-icon" aria-hidden="true">💊</div>
    </div>

    <!-- ZONA 2: Botones de acción principales (siempre visibles) -->
    ${botonesAccion ? `<div class="card-actions">${botonesAccion}</div>` : ''}

    <!-- ZONA 3: Acordeón con info secundaria -->
    ${filasCuerpo ? `
    <button class="card-header" aria-expanded="false" aria-controls="${bodyId}">
        <span>Más información</span>
        <span class="card-chevron" aria-hidden="true">▼</span>
    </button>
    <div class="card-body-collapse" id="${bodyId}" role="region" aria-label="Detalles de ${window.esc(item.PRESTADOR)}">
        ${filasCuerpo}
    </div>` : ''}

</article>`;
};

// ── 3. INICIALIZACIÓN DE LA APP ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // ── Registro del Service Worker ──
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.warn('[BAHI.ar] SW no pudo registrarse:', err);
        });

        /*
         * Escucha mensajes del SW:
         * - SW_UPDATED   → muestra el banner de "nueva versión disponible"
         *                  en lugar de recargar silenciosamente (menos disruptivo)
         * - DATOS_EN_CACHE → podría mostrar el indicador de datos en caché
         */
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'SW_UPDATED') {
                mostrarBannerActualizacion(event.data.version);
            }
            if (event.data?.tipo === 'DATOS_EN_CACHE') {
                mostrarIndicadorCache();
            }
        });
    }

    // ── Acordeón global (delegación de eventos al document) ──
    // Un solo listener en vez de uno por card → mejor performance con muchas cards
    document.addEventListener('click', (e) => {
        const header = e.target.closest('.card-header');
        if (!header) return;
        const body = header.nextElementSibling;
        if (body && body.classList.contains('card-body-collapse')) {
            const isOpen = body.classList.toggle('open');
            header.setAttribute('aria-expanded', String(isOpen));
        }
    });

    configurarBuscador();
    configurarBannerActualizacion();
});

// ── 4. BUSCADOR GLOBAL ────────────────────────────────────────────────────────

function configurarBuscador() {
    /*
     * El selector excluye #buscador-live para no interferir con un posible
     * buscador de resultados en vivo si se agrega en el futuro.
     * Busca en .card-name (nuevo layout) con fallback a card-header span (legacy).
     */
    const input = document.querySelector('.search-container input:not(#buscador-live)');
    if (!input) return;

    let debounceTimer;

    input.addEventListener('input', (e) => {
        /*
         * Debounce de 150ms: evita correr la búsqueda en cada keystroke
         * cuando hay muchas tarjetas en el DOM (ej: directorio completo).
         */
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const filtro = e.target.value.trim().toLowerCase();
            document.querySelectorAll('.card').forEach(card => {
                // Buscar en .card-name primero, fallback a card-header span
                const nameEl = card.querySelector('.card-name') || card.querySelector('.card-header span');
                const texto = nameEl ? nameEl.textContent.toLowerCase() : '';
                card.hidden = filtro.length > 0 && !texto.includes(filtro);
            });
        }, 150);
    });
}

// ── 5. BANNER DE ACTUALIZACIÓN ────────────────────────────────────────────────

/**
 * Muestra el banner "nueva versión disponible" cuando el SW notifica SW_UPDATED.
 * Más amigable que recargar automáticamente: el usuario decide cuándo.
 */
function mostrarBannerActualizacion(version) {
    let banner = document.getElementById('update-banner');
    if (banner) {
        banner.hidden = false;
        return;
    }

    banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML = `
        <span>Nueva versión disponible${version ? ` (${version})` : ''}</span>
        <button id="btn-actualizar">Actualizar</button>`;

    // Insertar debajo del header (antes del primer elemento del body)
    document.body.insertBefore(banner, document.body.children[1] || null);
}

/**
 * Configura el botón "Actualizar" del banner para recargar la página.
 * Usa delegación de eventos por si el banner se crea después del DOMContentLoaded.
 */
function configurarBannerActualizacion() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-actualizar') {
            location.reload();
        }
    });
}

// ── 6. INDICADOR DE DATOS EN CACHÉ ───────────────────────────────────────────

/**
 * Muestra una advertencia cuando los datos provienen del caché offline.
 * Se inserta antes del contenedor de cards.
 */
function mostrarIndicadorCache() {
    const contenedor = document.getElementById('contenedor-cards');
    if (!contenedor || document.querySelector('.cache-indicator-warning')) return;

    const aviso = document.createElement('p');
    aviso.className = 'cache-indicator-warning';
    aviso.setAttribute('role', 'status');
    aviso.textContent = 'Sin conexión — mostrando datos guardados. La información puede no estar actualizada.';
    contenedor.parentNode.insertBefore(aviso, contenedor);
}
