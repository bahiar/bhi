// --- 1. INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", function() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('nav.html')
            .then(response => response.text())
            .then(data => { navPlaceholder.innerHTML = data; })
            .catch(error => console.error('Error cargando la nav:', error));
    }
    
    configurarBuscador();
    activarAcordeon();
    registrarServiceWorker();
});

// --- 2. SERVICE WORKER ---
function registrarServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('sw.js').then((registration) => {
        registration.addEventListener('updatefound', () => {
            const nuevoSW = registration.installing;
            nuevoSW.addEventListener('statechange', () => {
                if (nuevoSW.state === 'installed' && navigator.serviceWorker.controller) {
                    mostrarBannerActualizacion(registration);
                }
            });
        });
    });

    navigator.serviceWorker.addEventListener('message', (e) => {
        if (e.data.tipo === 'DATOS_EN_CACHE') mostrarIndicadorCache(true);
        if (e.data.tipo === 'DATOS_FRESCOS')  mostrarIndicadorCache(false);
    });
}

// --- 3. UI HELPERS ---
function mostrarBannerActualizacion(registration) {
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.innerHTML = `<span>Hay una nueva versión disponible.</span><button id="btn-actualizar">Actualizar</button>`;
    document.body.prepend(banner);
    document.getElementById('btn-actualizar').addEventListener('click', () => {
        if (registration.waiting) registration.waiting.postMessage('SKIP_WAITING');
        window.location.reload();
    });
}

function mostrarIndicadorCache(enCache) {
    let indicador = document.getElementById('cache-indicator');
    if (!indicador) {
        indicador = document.createElement('p');
        indicador.id = 'cache-indicator';
        const contenedor = document.getElementById('contenedor-cards');
        if (contenedor) contenedor.parentNode.insertBefore(indicador, contenedor);
    }
    indicador.textContent = enCache ? '⚠ Mostrando datos guardados. Conectate para actualizar.' : '';
}

// --- 4. ACORDEÓN ---
function activarAcordeon() {
    document.addEventListener('click', function(e) {
        const header = e.target.closest('.card-header');
        if (header) {
            const body = header.nextElementSibling;
            body.classList.toggle('open');
            header.setAttribute('aria-expanded', body.classList.contains('open'));
        }
    });
}

// --- 5. RENDERIZADO DE DATOS (Con todos los campos) ---
function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    fetch('data/bd_bahiar.json')
        .then(response => response.json())
        .then(data => {
            contenedor.innerHTML = '';
            // Filtramos según el tipo que pasaste
            const filtrados = data.prestadores.filter(p => p.TIPO === tipo);

            if (filtrados.length === 0) {
                contenedor.innerHTML = '<p style="padding: 16px;">No hay resultados para esta categoría.</p>';
                return;
            }

            filtrados.forEach((item, index) => {
                const bodyId = `card-body-${tipo}-${index}`;
                
                // Construcción de la tarjeta con TODOS los campos
                const card = `
                <div class="card">
                    <button class="card-header" aria-expanded="false" aria-controls="${bodyId}">
                        <span>${item.PRESTADOR}</span>
                        <span aria-hidden="true">▼</span>
                    </button>
                    <div class="card-body-collapse" id="${bodyId}">
                        <div style="padding: 16px;">
                            <p style="margin-bottom: 5px;"><strong>Dirección:</strong> ${item.DOMICILIO} (${item.LOCALIDAD})</p>
                            ${item.HORARIO ? `<p style="margin-bottom: 5px;"><strong>Horario:</strong> ${item.HORARIO}</p>` : ''}
                            ${item.OOSS ? `<p style="margin-bottom: 5px;"><strong>OOSS:</strong> ${item.OOSS}</p>` : ''}
                            ${item.NIVEL ? `<p style="margin-bottom: 5px;"><strong>Nivel:</strong> ${item.NIVEL}</p>` : ''}
                            
                            <div style="display: flex; gap: 6px; margin: 10px 0;">
                                ${item.INYECTABLES ? '<span class="badge">💉 Inyectables</span>' : ''}
                                ${item.DELIVERY ? '<span class="badge">🛵 Delivery</span>' : ''}
                            </div>
