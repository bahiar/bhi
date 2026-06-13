/**
 * BAHI.ar - Núcleo de Lógica PWA
 * Arquitectura centralizada para sanitización, seguridad y renderizado.
 */

'use strict';

// ── SVGs REPRESENTATIVOS PARA CAMPOS DE LA BASE DE DATOS ─────────────────────────

window.SVG_CAMPOS = {
    DOMICILIO: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    LOCALIDAD: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>`,
    MAPS: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
    FIJO: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>`,
    MOVIL: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2a9 9 0 0 1 9 9"/><path d="M13 6a5 5 0 0 1 5 5"/><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></svg>`,
    NIVEL: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>`,
    STOCK: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"/><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"/><path d="M6 13h12"/><path d="M6 17h12"/></svg>`,
    HORARIO: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    INYECTABLES: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/></svg>`,
    DELIVERY: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 14-1-3"/><path d="m3 9 6 2a2 2 0 0 1 2-2h2a2 2 0 0 1 1.99 1.81"/><path d="M8 17h3a1 1 0 0 0 1-1 6 6 0 0 1 6-6 1 1 0 0 0 1-1v-.75A5 5 0 0 0 17 5"/><circle cx="19" cy="17" r="3"/><circle cx="5" cy="17" r="3"/></svg>`,
    OOSS: `<svg class="card-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M9 9h.01"/><path d="m15 9-6 6"/><path d="M15 15h.01"/></svg>`
};

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

    const direccion = [
        item.DOMICILIO ? `${window.SVG_CAMPOS.DOMICILIO} ${window.esc(item.DOMICILIO)}` : null,
        item.LOCALIDAD ? `${window.SVG_CAMPOS.LOCALIDAD} ${window.esc(item.LOCALIDAD)}` : null
    ]
        .filter(Boolean)
        .join(' · ');

    const SVG_LLAMAR = `<svg class="btn-icon btn-icon--lg" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M43.2 39.6c-1.5-1.5-3.4-1.5-4.9 0l-2.3 2.3c-.3-.2-.6-.3-.9-.5-1-.6-2.4-1.4-3.9-2.9-1.5-1.5-2.3-2.9-2.9-3.9-.2-.3-.3-.6-.5-.9l1.6-1.6.7-.7c1.5-1.5 1.5-3.4 0-4.9l-2.3-2.3c-.3-.3-.6-.6-.9-.9-.6-.6-1.3-1.3-2-1.9-1.5-1.4-3.4-1.4-4.9.1l-2.4 2.4c-.6.6-1 1.4-1.1 2.3-.1 1.6.3 3.1.7 4.1 1 2.7 2.6 5.2 4.9 7.8 2.9 3.3 6.4 5.9 10.2 7.6 1.5.6 3.5 1.4 5.6 1.5h.4c1.3 0 2.4-.5 3.2-1.4l.1-.1c.3-.4.6-.7.9-1 .5-.5.9-1 1.4-1.5 1.5-1.6 1.5-3.5 0-5l-2.7-2.6z"/></svg>`;

    const SVG_WHATSAPP = `<svg class="btn-icon" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.3-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>`;

    const SVG_MAPA = `<svg class="btn-icon btn-icon--maps" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="#EA4335" d="M96 16C63.3 16 37 42.3 37 75c0 47.6 59 101 59 101s59-53.4 59-101C155 42.3 128.7 16 96 16z"/><circle cx="96" cy="75" r="24" fill="#fff"/></svg>`;

    const botonesAccion = [
        linkTel
            ? `<a href="${window.esc(linkTel)}" class="btn btn-accent"
                  aria-label="Llamar a ${window.esc(item.PRESTADOR)}">${SVG_LLAMAR} Llamar</a>`
            : '',
        linkMovil && linkMovil.startsWith('https://')
            ? `<a href="${window.esc(linkMovil)}" class="btn btn-whatsapp"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="WhatsApp de ${window.esc(item.PRESTADOR)}">${SVG_WHATSAPP} WhatsApp</a>`
            : (linkMovil
                ? `<a href="${window.esc(linkMovil)}" class="btn btn-accent"
                      aria-label="Llamar a ${window.esc(item.PRESTADOR)}">${SVG_LLAMAR} Llamar</a>`
                : ''),
        mapsUrl
            ? `<a href="${window.esc(mapsUrl)}" class="btn btn-outline"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Ver mapa de ${window.esc(item.PRESTADOR)}">${SVG_MAPA} Mapa</a>`
            : ''
    ].filter(Boolean).join('');

    const filasCuerpo = [
        item.DOMICILIO && `<p class="card-detail-row">${window.SVG_CAMPOS.DOMICILIO}<strong>Domicilio:</strong> ${window.esc(item.DOMICILIO)}</p>`,
        item.LOCALIDAD && `<p class="card-detail-row">${window.SVG_CAMPOS.LOCALIDAD}<strong>Localidad:</strong> ${window.esc(item.LOCALIDAD)}</p>`,
        item.FIJO && `<p class="card-detail-row">${window.SVG_CAMPOS.FIJO}<strong>Teléfono:</strong> <a href="${window.esc(linkTel)}">${window.esc(item.FIJO)}</a></p>`,
        item.MOVIL && `<p class="card-detail-row">${window.SVG_CAMPOS.MOVIL}<strong>Móvil:</strong> <a href="${window.esc(linkMovil)}">${window.esc(item.MOVIL)}</a></p>`,
        item.HORARIO && `<p class="card-detail-row">${window.SVG_CAMPOS.HORARIO}<strong>Horario:</strong> ${window.esc(item.HORARIO)}</p>`,
        item.NIVEL && `<p class="card-detail-row">${window.SVG_CAMPOS.NIVEL}<strong>Nivel:</strong> ${window.esc(item.NIVEL)}</p>`,
        item.STOCK && `<p class="card-detail-row">${window.SVG_CAMPOS.STOCK}<strong>Stock:</strong> ${window.esc(item.STOCK)}</p>`,
        item.INYECTABLES && `<p class="card-detail-row">${window.SVG_CAMPOS.INYECTABLES}<strong>Inyectables:</strong> ${item.INYECTABLES ? 'Sí' : 'No'}</p>`,
        item.DELIVERY && `<p class="card-detail-row">${window.SVG_CAMPOS.DELIVERY}<strong>Delivery:</strong> ${item.DELIVERY ? 'Sí' : 'No'}</p>`,
        item.OOSS && `<p class="card-detail-row">${window.SVG_CAMPOS.OOSS}<strong>Obra social:</strong> ${window.esc(item.OOSS)}</p>`
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
                card.hidden = filtro.length > 0 && !texto.startsWith(filtro);
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
    const aviso = document.createElement('p');
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
