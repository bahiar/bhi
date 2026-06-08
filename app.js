// Sanitización de texto para interpolación segura en innerHTML
function esc(str) {
    const d = document.createElement('div');
    d.textContent = str ?? '';
    return d.innerHTML;
}
window.esc = esc; // Exponer globalmente

// Validación de URL de Maps: solo acepta dominios de Google Maps
function safeMapsUrl(url) {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        if (parsed.hostname === 'maps.google.com' || parsed.hostname === 'www.google.com' || parsed.hostname === 'maps.app.goo.gl') {
            return url;
        }
    } catch (_) {}
    return null;
}
window.safeMapsUrl = safeMapsUrl; // Exponer globalmente

// Cargar la navegación modular y activar buscador al iniciar
document.addEventListener("DOMContentLoaded", function() {
    // Registro centralizado del Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('[SW] Registrado con éxito:', reg.scope))
            .catch(err => console.warn('[SW] Error al registrar:', err));

        navigator.serviceWorker.addEventListener('message', (e) => {
            if (e.data && e.data.tipo === 'DATOS_EN_CACHE') {
                console.info('[SW] Datos servidos desde caché offline.');
            }
            if (e.data && e.data.tipo === 'DATOS_FRESCOS') {
                console.info('[SW] Datos actualizados desde la red.');
            }
        });

        // Solo recargar si hay un nuevo controlador y no estamos en una página con lógica de filtrado pesado
        // para evitar loops en medio de inicializaciones dinámicas.
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!document.getElementById('buscador-live')) {
                location.reload();
            }
        });
    }

    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('nav.html')
            .then(response => response.text())
            .then(data => { navPlaceholder.innerHTML = data; })
            .catch(error => console.error('Error cargando la nav:', error));
    }
    
    configurarBuscador();
    activarAcordeon(); 
});

// Lógica de apertura/cierre de las tarjetas (Delegación de eventos)
function activarAcordeon() {
    document.addEventListener('click', function(e) {
        const header = e.target.closest('.card-header');
        if (header) {
            const body = header.nextElementSibling;
            body.classList.toggle('open');
            const estaAbierto = body.classList.contains('open');
            header.setAttribute('aria-expanded', estaAbierto);
        }
    });
}

// Función dinámica para cargar datos (Usada en Guardias e Index)
function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const renderCards = (lista) => {
        contenedor.innerHTML = '';
        if (lista.length === 0) {
            contenedor.innerHTML = '<p style="padding: 16px;">No hay datos disponibles.</p>';
            return;
        }
        const fragments = lista.map((item, index) => {
            const bodyId = `card-body-${tipo}-${index}`;
            
            // Procesamiento de links de contacto
            let linkTel = item.FIJO ? (item.FIJO.toLowerCase().startsWith('tel:') ? item.FIJO : 'tel:' + item.FIJO) : '';
            let linkMovil = item.MOVIL ? (item.MOVIL.toLowerCase().startsWith('https://') || item.MOVIL.toLowerCase().startsWith('tel:') ? item.MOVIL : 'tel:' + item.MOVIL) : '';
            
            // Texto para aria-label (limpio de prefijos)
            const telDisplay = item.FIJO ? item.FIJO.replace(/^tel:/i, '') : '';
            const mapsUrl = safeMapsUrl(item.MAPS);

            return `
            <div class="card">
                <button class="card-header" aria-expanded="false" aria-controls="${bodyId}">
                    <span>${esc(item.PRESTADOR)}</span>
                    <span aria-hidden="true">▼</span>
                </button>
                <div class="card-body-collapse" id="${bodyId}">
                    ${item.DOMICILIO ? `<p style="margin-bottom: 10px;"><strong>Dirección:</strong> ${esc(item.DOMICILIO)}</p>` : ''}
                    ${item.LOCALIDAD ? `<p style="margin-bottom: 10px;"><strong>Localidad:</strong> ${esc(item.LOCALIDAD)}</p>` : ''}
                    ${item.HORARIO ? `<p style="margin-bottom: 10px;"><strong>Horario:</strong> ${esc(item.HORARIO)}</p>` : ''}
                    ${item.OOSS ? `<p style="margin-bottom: 10px;"><strong>OOSS:</strong> ${esc(item.OOSS)}</p>` : ''}
                    ${item.NIVEL ? `<p style="margin-bottom: 10px;"><strong>Nivel:</strong> ${esc(item.NIVEL)}</p>` : ''}
                    ${item.STOCK ? `<p style="margin-bottom: 10px;"><strong>Stock:</strong> ${esc(item.STOCK)}</p>` : ''}
                    ${item.INYECTABLES !== undefined ? `<p style="margin-bottom: 10px;"><strong>Inyectables:</strong> ${item.INYECTABLES ? 'Sí' : 'No'}</p>` : ''}
                    ${item.DELIVERY !== undefined ? `<p style="margin-bottom: 10px;"><strong>Delivery:</strong> ${item.DELIVERY ? 'Sí' : 'No'}</p>` : ''}
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                        ${linkTel ? `<a href="${esc(linkTel)}" class="btn btn-accent" aria-label="Llamar a ${esc(item.PRESTADOR)}, ${esc(telDisplay)}">Llamar</a>` : ''}
                        ${linkMovil ? `<a href="${esc(linkMovil)}" class="btn btn-accent" aria-label="WhatsApp de ${esc(item.PRESTADOR)}">WhatsApp</a>` : ''}
                        ${mapsUrl ? `<a href="${esc(mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" aria-label="Ver ${esc(item.PRESTADOR)} en Google Maps">Mapa</a>` : ''}
                    </div>
                </div>
            </div>`;
        });
        contenedor.innerHTML = fragments.join('');
    };

    if (tipo === 'GUARDIA') {
        const guardiasEstaticas = [
            { PRESTADOR: "Hospital Municipal", DOMICILIO: "Estomba 968", LOCALIDAD: "Bahia Blanca", HORARIO: "24 hs", OOSS: "Todas", FIJO: "02914598484", MAPS: "https://maps.google.com/?cid=16810520313590473464" },
            { PRESTADOR: "Hospital Penna", DOMICILIO: "Av. Lainez 2401", LOCALIDAD: "Bahia Blanca", HORARIO: "24 hs", OOSS: "Todas", FIJO: "02914593600", MAPS: "https://maps.google.com/?cid=16307574064946898385" },
            { PRESTADOR: "Privado del Sur", DOMICILIO: "Las Heras 164", LOCALIDAD: "Bahia Blanca", HORARIO: "24 hs", OOSS: "Todas", FIJO: "02914550270", MAPS: "https://maps.google.com/?cid=4096557740069257162" },
            { PRESTADOR: "HAM - Asociación Médica", DOMICILIO: "Patricios 347", LOCALIDAD: "Bahia Blanca", HORARIO: "24 hs", OOSS: "Todas", FIJO: "02914557877", MAPS: "https://maps.google.com/?cid=5361214841895970615" },
            { PRESTADOR: "Hospital Italiano", DOMICILIO: "Necochea 675", LOCALIDAD: "Bahia Blanca", HORARIO: "24 hs", OOSS: "Todas", FIJO: "02914583100", MAPS: "https://maps.google.com/?cid=3736778501007264660" },
            { PRESTADOR: "Hospital Español", DOMICILIO: "Estomba 571", LOCALIDAD: "Bahia Blanca", HORARIO: "24 hs", OOSS: "Todas", FIJO: "02914595555", MAPS: "https://maps.google.com/?cid=2064372742749592359" },
            { PRESTADOR: "Hospital Matera", DOMICILIO: "9 de Julio 461", LOCALIDAD: "Bahia Blanca", HORARIO: "24 hs", OOSS: "Todas", FIJO: "02914558880", MAPS: "https://maps.google.com/?cid=13981706602155362647" }
        ];
        renderCards(guardiasEstaticas);
    } else {
        contenedor.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">Cargando...</div>';
        fetch('data/bd_bahiar.json')
            .then(response => response.json())
            .then(data => {
                const filtrados = data.prestadores.filter(p => p.TIPO === tipo);
                renderCards(filtrados);
            })
            .catch(error => {
                console.error('Error:', error);
                contenedor.innerHTML = '<p style="padding: 16px; color: red;">Error al cargar datos.</p>';
            });
    }
}

// Buscador dinámico (Para páginas sin buscador-live especializado)
function configurarBuscador() {
    const input = document.querySelector('.search-container input:not(#buscador-live)');
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
