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

// ── ICONOS SVG INLINE ──────────────────────────────────────────────────────
// Un único lugar para definir los íconos: si querés cambiar uno, cambialo acá.

const ICON_LLAMAR = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 5.97 5.97l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
</svg>`;

const ICON_WHATSAPP = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
</svg>`;

const ICON_MAPA = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
  <circle cx="12" cy="10" r="3"/>
</svg>`;

// ──────────────────────────────────────────────────────────────────────────

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

      // Botón WhatsApp (solo si existe el campo WP)
      const btnWP = item.WP
        ? `<a href="https://wa.me/${item.WP.replace(/\D/g, '')}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" aria-label="WhatsApp de ${item.PRESTADOR}">${ICON_WHATSAPP} WhatsApp</a>`
        : '';

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
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${item.FIJO ? `<a href="${linkTel}" class="btn btn-accent" aria-label="Llamar a ${item.PRESTADOR}, ${item.FIJO}">${ICON_LLAMAR} Llamar</a>` : ''}
              ${btnWP}
              <a href="${item.MAPS}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" aria-label="Ver ${item.PRESTADOR} en Google Maps">${ICON_MAPA} Mapa</a>
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
