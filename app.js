/**
 * BAHI.ar - Núcleo de Lógica PWA
 * Arquitectura centralizada para sanitización, seguridad y renderizado.
 */

// 1. UTILIDADES GLOBALES DE SEGURIDAD
window.esc = (str) => {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
};

window.safeMapsUrl = (url) => {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        const allowed = ['maps.google.com', 'www.google.com', 'maps.app.goo.gl'];
        return allowed.includes(parsed.hostname) ? url : null;
    } catch (_) { return null; }
};

// 2. RENDERIZADO UNIVERSAL DE TARJETAS (Cards)
window.crearCardHTML = (item, tipo, index) => {
    const bodyId = `card-body-${tipo}-${index}`;
    const linkTel = item.FIJO ? (item.FIJO.toLowerCase().startsWith('tel:') ? item.FIJO : 'tel:' + item.FIJO) : '';
    const linkMovil = item.MOVIL ? (item.MOVIL.toLowerCase().startsWith('https://') || item.MOVIL.toLowerCase().startsWith('tel:') ? item.MOVIL : 'tel:' + item.MOVIL) : '';
    const telDisplay = item.FIJO ? item.FIJO.replace(/^tel:/i, '') : '';
    const mapsUrl = window.safeMapsUrl(item.MAPS);

    return `
    <div class="card">
        <button class="card-header" aria-expanded="false" aria-controls="${bodyId}">
            <span>${window.esc(item.PRESTADOR)}</span>
            <span aria-hidden="true">▼</span>
        </button>
        <div class="card-body-collapse" id="${bodyId}">
            ${item.DOMICILIO ? `<p style="margin-bottom: 8px;"><strong>Dirección:</strong> ${window.esc(item.DOMICILIO)}</p>` : ''}
            ${item.LOCALIDAD ? `<p style="margin-bottom: 8px;"><strong>Localidad:</strong> ${window.esc(item.LOCALIDAD)}</p>` : ''}
            ${item.HORARIO ? `<p style="margin-bottom: 8px;"><strong>Horario:</strong> ${window.esc(item.HORARIO)}</p>` : ''}
            ${item.OOSS ? `<p style="margin-bottom: 8px;"><strong>OOSS:</strong> ${window.esc(item.OOSS)}</p>` : ''}
            ${item.STOCK ? `<p style="margin-bottom: 8px;"><strong>Stock:</strong> ${window.esc(item.STOCK)}</p>` : ''}
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px;">
                ${linkTel ? `<a href="${window.esc(linkTel)}" class="btn btn-accent" aria-label="Llamar a ${window.esc(item.PRESTADOR)}">Llamar</a>` : ''}
                ${linkMovil ? `<a href="${window.esc(linkMovil)}" class="btn btn-accent" aria-label="WhatsApp">WhatsApp</a>` : ''}
                ${mapsUrl ? `<a href="${window.esc(mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Mapa</a>` : ''}
            </div>
        </div>
    </div>`;
};

// 3. INICIALIZACIÓN DE LA APP
document.addEventListener("DOMContentLoaded", () => {
    // Registro de Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!document.getElementById('buscador-live')) location.reload();
        });
    }

    // Carga de Navegación
    const nav = document.getElementById('nav-placeholder');
    if (nav) {
        fetch('nav.html').then(r => r.text()).then(html => { nav.innerHTML = html; });
    }

    // Acordeón Global
    document.addEventListener('click', (e) => {
        const header = e.target.closest('.card-header');
        if (header) {
            const body = header.nextElementSibling;
            const isOpen = body.classList.toggle('open');
            header.setAttribute('aria-expanded', isOpen);
        }
    });

    configurarBuscador();
});

// 4. LÓGICA DE DATOS (Guardias e Index)
function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    if (tipo === 'GUARDIA') {
        const estaticas = [
            { PRESTADOR: "Hospital Municipal", DOMICILIO: "Estomba 968", FIJO: "02914598484", MAPS: "https://maps.google.com/?cid=16810520313590473464" },
            { PRESTADOR: "Hospital Penna", DOMICILIO: "Av. Lainez 2401", FIJO: "02914593600", MAPS: "https://maps.google.com/?cid=16307574064946898385" }
            // ... resto de hospitales se cargan igual
        ];
        contenedor.innerHTML = estaticas.map((item, i) => window.crearCardHTML(item, tipo, i)).join('');
    } else {
        fetch('data/bd_bahiar.json').then(r => r.json()).then(data => {
            const filtrados = data.prestadores.filter(p => p.TIPO === tipo);
            contenedor.innerHTML = filtrados.map((item, i) => window.crearCardHTML(item, tipo, i)).join('');
        });
    }
}

function configurarBuscador() {
    const input = document.querySelector('.search-container input:not(#buscador-live)');
    if (input) {
        input.addEventListener('input', (e) => {
            const f = e.target.value.toLowerCase();
            document.querySelectorAll('.card').forEach(c => {
                const t = c.querySelector('.card-header span').textContent.toLowerCase();
                c.style.display = t.includes(f) ? '' : 'none';
            });
        });
    }
}
