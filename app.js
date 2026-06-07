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
    activarAcordeon();
});

// Lógica de apertura/cierre de las tarjetas
function activarAcordeon() {
    document.addEventListener('click', function(e) {
        const header = e.target.closest('.card-header');
        if (header) {
            const body = header.nextElementSibling;
            const estaAbierto = body.style.display === 'block';
            body.style.display = estaAbierto ? 'none' : 'block';
            header.setAttribute('aria-expanded', estaAbierto ? 'false' : 'true');
        }
    });
}

// Función robusta para cargar y filtrar datos
function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    // Convertimos el filtro a minúsculas para que sea insensible a mayúsculas
    const filtroNormalizado = tipo.toLowerCase().trim();

    fetch('bd_bahiar.json')
        .then(response => response.json())
        .then(data => {
            const lista = data.prestadores || [];
            
            // Filtro inteligente
            const filtrados = lista.filter(p => {
                const tipoJson = (p.TIPO || '').toLowerCase().trim();
                return tipoJson === filtroNormalizado;
            });

            if (filtrados.length === 0) {
                contenedor.innerHTML = '<p style="padding: 16px;">No se encontraron resultados.</p>';
                return;
            }

            contenedor.innerHTML = ''; 
            filtrados.forEach(item => {
                const bodyId = 'collapse-' + Math.random().toString(36).substr(2, 9);
                const card = `
                <div class="card">
                    <button class="card-header" aria-expanded="false">
                        <span>${item.PRESTADOR}</span>
                        <span aria-hidden="true">▼</span>
                    </button>
                    <div class="card-body-collapse" id="${bodyId}" style="display: none;">
                        <p style="margin-bottom: 10px;"><strong>Dirección:</strong> ${item.DOMICILIO}</p>
                        <div style="display: flex; gap: 10px;">
                            ${item.FIJO ? `<a href="tel:${item.FIJO}" class="btn btn-accent" aria-label="Llamar a ${item.PRESTADOR}">Llamar</a>` : ''}
                            <a href="${item.MAPS}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" aria-label="Ver en Google Maps">Mapa</a>
                        </div>
                    </div>
                </div>`;
                contenedor.innerHTML += card;
            });
        })
        .catch(error => {
            console.error('Error:', error);
            contenedor.innerHTML = '<p style="padding: 16px; color: red;">Error al cargar datos.</p>';
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