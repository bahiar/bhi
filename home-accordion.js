/**
 * BAHI.ar — Acordeón de categorías del index
 * ─────────────────────────────────────────────────────────────────
 * Controla los paneles colapsables de Laboratorios, Ortopedias,
 * Imágenes y Guardias en la home. Cada panel carga sus datos recién
 * la PRIMERA vez que se abre (lazy) y los cachea en memoria para no
 * repetir el fetch si se vuelve a abrir.
 *
 * "Farmacias de turno" NO pasa por acá: sigue cargando siempre al
 * entrar a la página (es el contenido principal del home, con su
 * propia lógica en index.html) — este script solo controla su
 * apertura/cierre visual, igual que a los demás items.
 *
 * Requiere que app.js ya esté cargado (usa window.crearCardHTML) y
 * debe cargarse ANTES de llamar a HomeAccordion.init():
 *   <script src="app.js" defer></script>
 *   <script src="home-accordion.js" defer></script>
 *
 * Uso (al final del script de index.html, junto con inicializarTurnos):
 *   HomeAccordion.init();
 */

window.HomeAccordion = (function () {
  'use strict';

  const LIMITE_CARDS = 6;

  // Categorías que este módulo sabe cargar. "farmacias-turno" queda
  // afuera a propósito: su carga la maneja el script de index.html.
  const CATEGORIAS = {
    laboratorios: { fuente: 'data/bd_bahiar.json', tipo: 'LABORATORIO',      verTodos: 'laboratorios.html' },
    ortopedias:   { fuente: 'data/ortopedia.json',  tipo: 'ORTOPEDIA',        verTodos: 'ortopedias.html' },
    imagenes:     { fuente: 'data/RX_bahiar.json',  tipo: 'RADIOLOGIA',       verTodos: 'imagenes.html' },
    guardias:     { fuente: 'data/bd_bahiar.json',  tipo: 'UNIDAD SANITARIA', verTodos: 'guardias.html' },
  };

  const cache = {}; // clave -> array de items ya descargados

  // M1: reutiliza .skeleton-card (ya definido en style2.css, antes sin uso
  // en esta vista) en vez del texto plano "Cargando..." que había acá.
  function skeletonHTML(n = 3) {
    return `<div class="home-acc-cards">${Array.from({ length: n }, () => `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-line skeleton-line-title"></div>
        <div class="skeleton-line skeleton-line-addr"></div>
        <div class="skeleton-btns">
          <div class="skeleton-line skeleton-btn"></div>
          <div class="skeleton-line skeleton-btn"></div>
        </div>
      </div>`).join('')}</div>`;
  }

  async function cargarDatos(clave) {
    if (cache[clave]) return cache[clave];
    const cfg = CATEGORIAS[clave];
    const res = await fetch(cfg.fuente);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    let items = data.prestadores || [];
    if (cfg.tipo) items = items.filter(p => p.TIPO === cfg.tipo);
    cache[clave] = items;
    return items;
  }

  function renderPanel(clave, panel) {
    const cfg = CATEGORIAS[clave];

    cargarDatos(clave)
      .then(items => {
        panel.setAttribute('aria-busy', 'false');

        if (items.length === 0) {
          panel.innerHTML = '<p class="home-acc-msg">No hay resultados disponibles por ahora.</p>';
          return;
        }

        const visibles = items.slice(0, LIMITE_CARDS);
        const cardsHTML = visibles
          .map((item, i) => window.crearCardHTML(item, cfg.tipo, i))
          .join('');

        const textoVerTodos = items.length > LIMITE_CARDS
          ? `Ver todas (${items.length}) →`
          : 'Ver todas →';

        panel.innerHTML = `
          <div class="home-acc-cards">${cardsHTML}</div>
          <a href="${cfg.verTodos}" class="home-acc-vertodos">${textoVerTodos}</a>
        `;
      })
      .catch(err => {
        console.error(`[HomeAccordion] Error al cargar "${clave}":`, err);
        panel.setAttribute('aria-busy', 'false');
        panel.innerHTML = `
          <p class="home-acc-msg">No se pudo cargar la información. Probá de nuevo más tarde.</p>
          <button type="button" class="error-state-action" data-reintentar="${clave}">Reintentar</button>
        `;
        delete panel.dataset.cargado; // permite reintentar en el próximo click
      });
  }

  function cerrarTodos() {
    document.querySelectorAll('.home-acc-item--open').forEach(item => {
      item.classList.remove('home-acc-item--open');
      const header = item.querySelector('.home-acc-header');
      if (header) header.setAttribute('aria-expanded', 'false');
    });
  }

  function init() {
    const headers = document.querySelectorAll('.home-acc-header[data-categoria]');

    headers.forEach(header => {
      header.addEventListener('click', () => {
        const clave = header.dataset.categoria;
        const item = header.closest('.home-acc-item');
        const panel = document.getElementById(`home-acc-panel-${clave}`);
        const yaEstabaAbierto = item.classList.contains('home-acc-item--open');

        cerrarTodos();

        if (yaEstabaAbierto) return; // click sobre el que ya estaba abierto: solo se cierra

        item.classList.add('home-acc-item--open');
        header.setAttribute('aria-expanded', 'true');

        // Lazy load: solo si es una categoría que este módulo maneja
        // (no "farmacias-turno") y todavía no se cargó.
        if (panel && CATEGORIAS[clave] && !panel.dataset.cargado) {
          panel.dataset.cargado = '1';
          panel.setAttribute('aria-live', 'polite');
          panel.setAttribute('aria-busy', 'true');
          panel.innerHTML = skeletonHTML();
          renderPanel(clave, panel);
        }
      });
    });

    // Q3: botón "Reintentar" del estado de error (mismo patrón que
    // PillsEngine.limpiar en las páginas de categoría).
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-reintentar]');
      if (!btn) return;
      const clave = btn.dataset.reintentar;
      const panel = document.getElementById(`home-acc-panel-${clave}`);
      if (!panel || !CATEGORIAS[clave]) return;
      panel.dataset.cargado = '1';
      panel.setAttribute('aria-busy', 'true');
      panel.innerHTML = skeletonHTML();
      renderPanel(clave, panel);
    });
  }

  return { init };
})();
