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
 */
window.crearCardHTML = (item, tipo, index) => {
    const bodyId = `card-body-${tipo}-${index}`;

    const linkTel = item.FIJO
        ? (item.FIJO.toLowerCase().startsWith('tel:') ? item.FIJO : 'tel:' + item.FIJO)
        : '';
    const linkMovil = item.MOVIL
        ? (item.MOVIL.toLowerCase().startsWith('https://') || item.MOVIL.toLowerCase().startsWith('tel:')
            ? item.MOVIL
            : 'tel:' + item.MOVIL)
        : '';
    const mapsUrl = window.safeMapsUrl(item.MAPS);

    const estado = tipo === 'TURNO' ? 'turno' : (item.HORARIO_TIPO === '24h' ? '24h' : '');

    const direccion = [item.DOMICILIO, item.LOCALIDAD]
        .filter(Boolean)
        .map(window.esc)
        .join(' · ');

    // Iconos SVG Modernos
    const iconPhone = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:text-bottom;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
    const iconWhatsApp = `<svg width="16" height="16" viewBox="0 0 448 512" fill="currentColor" style="margin-right:6px;vertical-align:text-bottom;"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.3-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;
    const iconMap = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:text-bottom;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

    const botonesAccion = [
        linkTel
            ? `<a href="${window.esc(linkTel)}" class="btn btn-accent"
                  aria-label="Llamar a ${window.esc(item.PRESTADOR)}">${iconPhone}Llamar</a>`
            : '',
        linkMovil && linkMovil.startsWith('https://')
            ? `<a href="${window.esc(linkMovil)}" class="btn btn-whatsapp"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp de ${window.esc(item.PRESTADOR)}">${iconWhatsApp}WhatsApp</a>`
            : (linkMovil
                ? `<a href="${window.esc(linkMovil)}" class="btn btn-accent"
                      aria-label="Llamar a ${window.esc(item.PRESTADOR)}">${iconPhone}Llamar</a>`
                : ''),
        mapsUrl
            ? `<a href="${window.esc(mapsUrl)}" class="btn btn-outline"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Ver mapa de ${window.esc(item.PRESTADOR)}">${iconMap}Mapa</a>`
            : ''
    ].filter(Boolean).join('');

    const filasCuerpo = [
        item.HORARIO && `<p class="card-detail-row"><strong>Horario:</strong> ${window.esc(item.HORARIO)}</p>`,
        item.OOSS    && `<p class="card-detail-row"><strong>Obra social:</strong> ${window.esc(item.OOSS)}</p>`,
        item.STOCK   && `<p class="card-detail-row"><strong>Stock:</strong> ${window.esc(item.STOCK)}</p>`
    ].filter(Boolean).join('');

    return `
<article class="card" data-estado="${window.esc(estado)}" data-tipo="${window.esc(tipo)}">
    <div class="card-top">
        <div class="card-info">
            <h3 class="card-name">${window.esc(item.PRESTADOR)}</h3>
            ${direccion ? `<p class="card-addr">${direccion}</p>` : ''}
        </div>
    </div>
    ${botonesAccion ? `<div class="card-actions">${botonesAccion}</div>` : ''}
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
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.warn('[BAHI.ar] SW no pudo registrarse:', err);
        });

        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'SW_UPDATED') {
                mostrarBannerActualizacion(event.data.version);
            }
            if (event.data?.tipo === 'DATOS_EN_CACHE') {
                mostrarIndicadorCache();
            }
        });
    }

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
    configurarBotonCompartir();
});

// ── 4. BUSCADOR GLOBAL ────────────────────────────────────────────────────────

function configurarBuscador() {
    const input = document.querySelector('.search-container input:not(#buscador-live)');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const filtro = e.target.value.trim().toLowerCase();
            document.querySelectorAll('.card').forEach(card => {
                const nameEl = card.querySelector('.card-name') || card.querySelector('.card-header span');
                const texto = nameEl ? nameEl.textContent.toLowerCase() : '';
                card.hidden = filtro.length > 0 && !texto.includes(filtro);
            });
        }, 150);
    });
}

// ── 5. BANNER DE ACTUALIZACIÓN ────────────────────────────────────────────────

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
    document.body.insertBefore(banner, document.body.children[1] || null);
}

function configurarBannerActualizacion() {
    document.addEventListener('click', (e) => {
        if (e.target.id === 'btn-actualizar') {
            location.reload();
        }
    });
}

// ── 6. INDICADOR DE DATOS EN CACHÉ ───────────────────────────────────────────

function mostrarIndicadorCache() {
    const contenedor = document.getElementById('contenedor-cards');
    if (!contenedor || document.querySelector('.cache-indicator-warning')) return;
    const aviso = document.createElement('div');
    aviso.className = 'cache-indicator-warning';
    aviso.setAttribute('role', 'status');
    aviso.textContent = 'Sin conexión — mostrando datos guardados. La información puede no estar actualizada.';
    contenedor.parentNode.insertBefore(aviso, contenedor);
}

// ── 7. COMPARTIR FARMACIAS POR WHATSAPP ──────────────────────────────────────

function configurarBotonCompartir() {
    const btnCompartir = document.getElementById('btn-compartir-whatsapp');
    if (!btnCompartir) return;

    btnCompartir.addEventListener('click', () => {
        const cards = document.querySelectorAll('#contenedor-cards .card');
        if (cards.length === 0) return;

        const leyendaEl = document.getElementById('leyenda-horario');
        const leyenda = leyendaEl ? leyendaEl.textContent : '';

        // Construcción del mensaje con formato enriquecido para WhatsApp
        let mensaje = `🏥 *FARMACIAS DE TURNO*\n`;
        mensaje += `Bahía Blanca • BAHI.ar\n`;
        if (leyenda) mensaje += `_${leyenda}_\n`;
        mensaje += `\n`;

        cards.forEach((card) => {
            const nombre = card.querySelector('.card-name')?.innerText || '';
            const direccion = card.querySelector('.card-addr')?.innerText || '';
            
            if (nombre) {
                mensaje += `🟢 *${nombre.toUpperCase()}*\n`;
                mensaje += `📍 ${direccion}\n\n`;
            }
        });

        mensaje += `🌐 *Más info en:*\n`;
        mensaje += `www.bahi.ar`;

        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    });
}
