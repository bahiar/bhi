// Cargar la navegación modular y activar buscador al iniciar
document.addEventListener("DOMContentLoaded", function() {
    console.log("App iniciada. Cargando componentes...");
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

// Registro del Service Worker
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

function mostrarBannerActualizacion(registration) {
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.innerHTML = `
        <span>Hay una nueva versión disponible.</span>
        <button id="btn-actualizar">Actualizar</button>
    `;
    document.body.prepend(banner);

    document.getElementById('btn-actualizar').addEventListener('click', () => {
        if (registration.waiting) {
            registration.waiting.postMessage('SKIP_WAITING');
        }
        window.location.reload();
    });
}

function mostrarIndicadorCache(enCache) {
    let indicador = document.getElementById('cache-indicator');
    if (!indicador) {
        indicador = document.createElement('p');
        indicador.id = 'cache-indicator';
        indicador.setAttribute('role', 'status');
        indicador.setAttribute('aria-live', 'polite');
        const contenedor = document.getElementById('contenedor-cards') || document.getElementById('main-content');
        if (contenedor) contenedor.parentNode.insertBefore(indicador, contenedor);
    }
    if (enCache) {
        indicador.textContent = '⚠ Mostrando datos guardados. Conectate para ver la información actualizada.';
        indicador.className = 'cache-indicator-warning';
    } else {
        indicador.textContent = '';
        indicador.className = '';
    }
}

// Lógica del acordeón (Delegación de eventos)
function activarAcordeon() {
    document.addEventListener('click', function(e) {
        const header = e.target.closest('.card-header');
        if (header) {
            const body = header.nextElementSibling;
            const estaAbierto = body.classList.contains('open');
            body.classList.toggle('open');
            header.setAttribute('aria-expanded', String(!estaAbierto));
            console.log("Acordeón toggleado:", !estaAbierto);
        }
    });
}

// Función de renderizado con logs de depuración
function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) {
        console.error("Error: No se encontró el contenedor con ID:", contenedorId);
        return;
    }
    
    contenedor.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">Cargando datos...</div>';

    fetch('data/bd_bahiar.json')
        .then(response => {
            if (!response.ok) throw new Error("No se pudo conectar al JSON. Error " + response.status);
            return response.json();
        })
        .then(data => {
            console.log("JSON cargado exitosamente. Datos recibidos:", data);
            
            // Verificamos si data.prestadores existe
            if (!data.prestadores) {
                console.error("Error: La estructura del JSON no tiene una propiedad 'prestadores'.");
                return;
            }

            const filtrados = data.prestadores.filter(p => p.TIPO === tipo);
            console.log("Filtrando por tipo:", tipo, ". Encontrados:", filtrados.length);

            contenedor.innerHTML = '';

            if (filtrados.length === 0) {
                contenedor.innerHTML = '<p style="padding: 16px;">No hay datos para esta categoría.</p>';
                return;
            }

            filtrados.forEach((item, index) => {
                const bodyId = `card-body-${tipo}-${index}`;
                const card = `
                <div class="card">
                    <button class="card-header" aria-expanded="false" aria-controls="${bodyId}">
                        <span>${item.PRESTADOR}</span>
                        <span aria-hidden="true">▼</span>
                    </button>
                    <div class="card-body-collapse" id="${bodyId}">
                        <p style="padding: 16px; margin:0;"><strong>Dirección:</strong> ${item.DOMICILIO}</p>
                        <div style="display: flex; gap: 10px; padding: 0 16px 16px;">
                            ${item.FIJO ? `<a href="${item.FIJO}" class="btn btn-accent" aria-label="Llamar a ${item.PRESTADOR}">Llamar</a>` : ''}
                            <a href="${item.MAPS}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" aria-label="Ver ${item.PRESTADOR} en Google Maps">Mapa</a>
                        </div>
                    </div>
                </div>`;
                contenedor.innerHTML += card;
            });
        })
        .catch(error => {
            console.error('Error crítico en renderizarDatos:', error);
            contenedor.innerHTML = '<p style="padding: 16px; color: red;">Error al cargar datos. Revisa la consola.</p>';
        });
}

function configurarBuscador() {
    const input = document.querySelector('.search-container input');
    if (input) {
        input.addEventListener('input', (e) => {
            const filtro = e.target.value.toLowerCase();
            const tarjetas = document.querySelectorAll('.card');
            tarjetas.forEach(card => {
                const nombre = card.querySelector('.card-header span').textContent.toLowerCase();
                card.style.display = nombre.includes(filtro) ? '' : 'none';
            });
        });
    }
}
