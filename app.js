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

        mensaje += `🌐 *Ver mapa y más info en:*\n`;
        mensaje += `https://bahiar.github.io/bhi/`;

        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    });
}
