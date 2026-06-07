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
            const estaAbierto = body.style.display === 'block';
            
            // Alternar visibilidad
            body.style.display = estaAbierto ? 'none' : 'block';
            
            // Actualizar estado aria para lectores de pantalla
            header.setAttribute('aria-expanded', estaAbierto ? 'false' : 'true');
        }
    });
}

// Función dinámica para cargar datos[cite: 13]
function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">Cargando...</div>';

    fetch('data/bd_bahiar.json')
        .then(response => response.json())
        .then(data => {
            contenedor.innerHTML = ''; 
            const filtrados = data.prestadores.filter(p => p.TIPO === tipo);
            
            if (filtrados.length === 0) {
                contenedor.innerHTML = '<p style="padding: 16px;">No hay datos disponibles.</p>';
                return;
            }

            filtrados.forEach((item, index) => {
                const bodyId = `card-body-${tipo}-${index}`;
                const telLimpio = item.FIJO ? item.FIJO.replace(/\D/g, '') : '';
                const card = `
                <div class="card">
                    <button class="card-header" aria-expanded="false" aria-controls="${bodyId}">
                        <span>${item.PRESTADOR}</span>
                        <span aria-hidden="true">▼</span>
                    </button>
                    <div class="card-body-collapse" id="${bodyId}" style="display: none;">
                        <p style="margin-bottom: 10px;"><strong>Dirección:</strong> ${item.DOMICILIO}</p>
                        <div style="display: flex; gap: 10px;">
                            ${item.FIJO ? `<a href="tel:${item.FIJO}" class="btn btn-accent" aria-label="Llamar a ${item.PRESTADOR}, ${item.FIJO}">Llamar</a>` : ''}
                            <a href="${item.MAPS}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" aria-label="Ver ${item.PRESTADOR} en Google Maps">Mapa</a>
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

// Buscador dinámico[cite: 13]
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