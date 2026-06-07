document.addEventListener("DOMContentLoaded", function() {
    // 1. Cargar navegación
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        fetch('nav.html')
            .then(response => response.text())
            .then(data => { navPlaceholder.innerHTML = data; })
            .catch(error => console.error('Error nav:', error));
    }
    
    configurarBuscador();
    activarAcordeon();
    registrarServiceWorker();
});

function renderizarDatos(tipo, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    fetch('data/bd_bahiar.json')
        .then(response => response.json())
        .then(data => {
            const lista = data.prestadores || [];
            const filtrados = lista.filter(p => p.TIPO === tipo);
            
            contenedor.innerHTML = filtrados.length > 0 ? '' : '<p style="padding:16px">Sin resultados.</p>';

            filtrados.forEach((item, index) => {
                const bodyId = `card-${index}`;
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <button class="card-header" aria-expanded="false" aria-controls="${bodyId}">
                        <span>${item.PRESTADOR}</span>
                        <span aria-hidden="true">▼</span>
                    </button>
                    <div class="card-body-collapse" id="${bodyId}">
                        <div style="padding:16px">
                            <p><strong>Dirección:</strong> ${item.DOMICILIO || 'N/A'}</p>
                            <div style="display:flex; gap:10px; margin-top:10px">
                                ${item.FIJO ? `<a href="tel:${item.FIJO}" class="btn btn-accent">Llamar</a>` : ''}
                                <a href="${item.MAPS}" target="_blank" rel="noopener" class="btn btn-outline">Mapa</a>
                            </div>
                        </div>
                    </div>
                `;
                contenedor.appendChild(card);
            });
        })
        .catch(err => {
            console.error(err);
            contenedor.innerHTML = '<p style="padding:16px; color:red;">Error al cargar datos.</p>';
        });
}

function activarAcordeon() {
    document.addEventListener('click', function(e) {
        const header = e.target.closest('.card-header');
        if (!header) return;
        
        const body = header.nextElementSibling;
        const estaAbierto = body.classList.contains('open');
        
        // Cerrar otros (opcional, si quieres que solo haya uno abierto)
        document.querySelectorAll('.card-body-collapse').forEach(el => el.classList.remove('open'));
        
        if (!estaAbierto) body.classList.add('open');
        header.setAttribute('aria-expanded', !estaAbierto);
    });
}

function configurarBuscador() {
    const input = document.querySelector('.search-container input');
    if (input) {
        input.addEventListener('input', (e) => {
            const filtro = e.target.value.toLowerCase();
            document.querySelectorAll('.card').forEach(card => {
                const txt = card.querySelector('.card-header span').textContent.toLowerCase();
                card.style.display = txt.includes(filtro) ? '' : 'none';
            });
        });
    }
}

function registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
}