// Cargar la navegación modular y activar buscador al iniciar
document.addEventListener("DOMContentLoaded", function() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('nav.html')
            .then(response => response.text())
            .then(data => { navPlaceholder.innerHTML = data; })
            .catch(error => console.error('Error cargando la nav:', error));
    }
    
    configurarBuscador();
    activarAcordeon(); // Activamos la lógica de apertura/cierre
});

// Lógica de apertura/cierre de las tarjetas (Delegación de eventos)
function activarAcordeon() {
    document.addEventListener('click', function(e) {
        // Buscamos si el clic ocurrió dentro de un botón de cabecera
        const header = e.target.closest('.card-header');
        
        if (header) {
            const body = header.nextElementSibling;
            body.classList.toggle('open');
            const estaAbierto = body.classList.contains('open');
            header.setAttribute('aria-expanded', estaAbierto);
        }
    });
}

// Función dinámica para cargar datos
function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const renderCards = (lista) => {
        contenedor.innerHTML = '';
        if (lista.length === 0) {
            contenedor.innerHTML = '<p style="padding: 16px;">No hay datos disponibles.</p>';
            return;
        }
        lista.forEach((item, index) => {
            const bodyId = `card-body-${tipo}-${index}`;
            let linkTel = item.FIJO ? item.FIJO : '';
            if (linkTel && !linkTel.startsWith('tel:')) {
                linkTel = 'tel:' + linkTel;
            }
            const card = `
            <div class="card">
                <button class="card-header" aria-expanded="false" aria-controls="${bodyId}">
                    <span>${item.PRESTADOR}</span>
                    <span aria-hidden="true">▼</span>
                </button>
                <div class="card-body-collapse" id="${bodyId}">
                    <p style="margin-bottom: 10px;"><strong>Dirección:</strong> ${item.DOMICILIO}</p>
                    <p style="margin-bottom: 10px;"><strong>Localidad:</strong> ${item.LOCALIDAD}</p>
                    <p style="margin-bottom: 10px;"><strong>Horario:</strong> ${item.HORARIO}</p>
                    <p style="margin-bottom: 10px;"><strong>OOSS:</strong> ${item.OOSS}</p>
                    <div style="display: flex; gap: 10px;">
                        ${item.FIJO ? `<a href="${linkTel}" class="btn btn-accent" aria-label="Llamar a ${item.PRESTADOR}, ${item.FIJO}">Llamar</a>` : ''}
                        <a href="${item.MAPS}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" aria-label="Ver ${item.PRESTADOR} en Google Maps">Mapa</a>
                    </div>
                </div>
            </div>`;
            contenedor.innerHTML += card;
        });
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

// Buscador dinámico
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
