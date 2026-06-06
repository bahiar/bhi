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
});

// Función dinámica para cargar datos con estado de "Cargando"
function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    // Mostramos estado de carga
    contenedor.innerHTML = '<div style="padding: 16px; color: var(--text-muted);">Cargando...</div>';

    fetch('data/bd_bahiar.json')
        .then(response => response.json())
        .then(data => {
            contenedor.innerHTML = ''; // Limpiamos el mensaje de carga
            
            const filtrados = data.prestadores.filter(p => p.TIPO === tipo);
            
            if (filtrados.length === 0) {
                contenedor.innerHTML = '<p style="padding: 16px;">No hay datos disponibles para esta sección.</p>';
                return;
            }

            filtrados.forEach(item => {
                const card = `
                <div class="card">
                    <button class="card-header">
                        <span>${item.PRESTADOR}</span>
                        <span>▼</span>
                    </button>
                    <div class="card-body-collapse">
                        <p style="margin-bottom: 10px;"><strong>Dirección:</strong> ${item.DOMICILIO}</p>
                        <div style="display: flex; gap: 10px;">
                            ${item.FIJO ? `<a href="${item.FIJO}" class="btn btn-accent">Llamar</a>` : ''}
                            <a href="${item.MAPS}" target="_blank" class="btn btn-outline">Mapa</a>
                        </div>
                    </div>
                </div>`;
                contenedor.innerHTML += card;
            });
        })
        .catch(error => {
            console.error('Error cargando datos:', error);
            contenedor.innerHTML = '<p style="padding: 16px; color: red;">Error al cargar datos. Intenta nuevamente.</p>';
        });
}

// Buscador dinámico con mensaje de "No se encontraron resultados"[cite: 13]
function configurarBuscador() {
    const input = document.querySelector('.search-container input');
    const contenedor = document.getElementById('contenedor-cards');
    
    // Creamos el mensaje de "No encontrado" oculto inicialmente
    const mensajeNoResults = document.createElement('p');
    mensajeNoResults.textContent = 'No se encontraron resultados.';
    mensajeNoResults.style.display = 'none';
    mensajeNoResults.style.padding = '16px';
    mensajeNoResults.id = 'no-results-msg';
    if(contenedor) contenedor.appendChild(mensajeNoResults);

    if (input) {
        input.addEventListener('input', (e) => {
            const filtro = e.target.value.toLowerCase();
            const tarjetas = document.querySelectorAll('.card');
            let hayResultados = false;

            tarjetas.forEach(card => {
                const nombre = card.querySelector('.card-header span').textContent.toLowerCase();
                if (nombre.includes(filtro)) {
                    card.style.display = '';
                    hayResultados = true;
                } else {
                    card.style.display = 'none';
                }
            });

            // Mostramos u ocultamos el mensaje según si hubo coincidencias
            if (mensajeNoResults) {
                mensajeNoResults.style.display = hayResultados ? 'none' : 'block';
            }
        });
    }
}