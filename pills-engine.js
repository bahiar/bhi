/**
 * BAHI.ar — Motor genérico de PILLS (filtros por chip)
 * ─────────────────────────────────────────────────────────────────
 * Lee window.PILLS_CONFIG (pills-config.js) y para cada "vista"
 * (farmacias / laboratorios / ortopedia / imagenes):
 *   1. Trae el JSON de origen (cfg.fuente) y filtra por cfg.tipo.
 *   2. Genera SOLO los chips con `activo: true` dentro de
 *      #filter-chips-container (select para 'select', botón on/off
 *      para 'boolean').
 *   3. Arma el objeto de filtros dinámicamente (nada hardcodeado).
 *   4. Filtra y renderiza las cards con window.crearCardHTML
 *      (definido en app.js), igual que hoy.
 *
 * Requiere cargarse DESPUÉS de pills-config.js y ANTES del script
 * propio de cada página:
 *   <script src="pills-config.js" defer></script>
 *   <script src="app.js"           defer></script>
 *   <script src="pills-engine.js"  defer></script>
 *
 * Uso típico dentro de cada página (reemplaza el bloque de ~150
 * líneas que hoy tiene cada HTML):
 *
 *   document.addEventListener('DOMContentLoaded', () => {
 *     PillsEngine.init('farmacias');
 *   });
 *
 * Opciones soportadas en el segundo argumento de init (todas
 * opcionales, tienen default razonable):
 *   contenedorId          id del grid de cards        (default: 'contenedor-cards')
 *   chipsContainerId      id donde se inyectan chips   (default: 'filter-chips-container')
 *   metaCountId           id del contador de resultados(default: 'header-meta-count')
 *   tipoVista             TIPO pasado a crearCardHTML  (default: cfg.tipo)
 *   transformItem(item)   transforma el item antes de renderizar la card
 *                         (ej. armar el string SERVICIOS en imagenes.html)
 *   formatearContador(n)  texto custom del contador de resultados
 *   mensajeSinResultados  HTML custom para el estado "sin resultados"
 */

window.PillsEngine = (function () {
  'use strict';

  const DEBOUNCE_MS = 150;
  const estados = {}; // vista -> { cfg, filtros, datosOriginales, opciones }

  // ── Helpers de config ─────────────────────────────────────────
  function getConfig(vista) {
    const cfg = window.PILLS_CONFIG && window.PILLS_CONFIG[vista];
    if (!cfg) {
      console.error(`[PillsEngine] No existe configuración para la vista "${vista}" en PILLS_CONFIG`);
      return null;
    }
    return cfg;
  }

  function pillsActivos(cfg) {
    return cfg.pills.filter(p => p.activo);
  }

  function crearFiltrosVacios(cfg) {
    const filtros = { texto: '' };
    pillsActivos(cfg).forEach(p => {
      filtros[p.campo] = p.tipoPill === 'boolean' ? false : '';
    });
    return filtros;
  }

  function capitalizar(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ── Filtrado ───────────────────────────────────────────────────
  function itemPasaPill(item, pill, valorFiltro) {
    if (pill.tipoPill === 'boolean') {
      if (!valorFiltro) return true;
      const valor = item[pill.campo];
      // Acepta tanto booleanos reales (true/false) como strings descriptivos
      // (ej. STOCK en ortopedia.json: "5 sillas disponibles"). En ambos casos
      // "pasa" si el valor es truthy y, de ser string, no está vacío.
      return !!valor && String(valor).trim() !== '';
    }
    // 'select'
    if (!valorFiltro) return true;
    if (pill.tipoPill === 'campo-dinamico') {
      // valorFiltro es el NOMBRE de un campo (ej. 'RX'); se filtra por ese campo del item.
      return item[valorFiltro] === true;
    }
    if (pill.multivalor) {
      return (item[pill.campo] || '').toLowerCase().includes(String(valorFiltro).toLowerCase());
    }
    return item[pill.campo] === valorFiltro;
  }

  function aplicarFiltros(vista) {
    const estado = estados[vista];
    if (!estado) return;
    const { cfg, filtros, datosOriginales } = estado;
    const texto = (filtros.texto || '').toLowerCase();

    const resultado = datosOriginales.filter(item => {
      if (texto && !(
        (item.PRESTADOR || '').toLowerCase().includes(texto) ||
        (item.DOMICILIO  || '').toLowerCase().includes(texto)
      )) return false;

      return pillsActivos(cfg).every(pill => itemPasaPill(item, pill, filtros[pill.campo]));
    });

    renderCards(vista, resultado);
  }

  // ── Render de cards ────────────────────────────────────────────
  function mensajeSinResultadosDefault(vista) {
    return `
      <div class="error-state" role="status">
        <div class="error-state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke-width="2" stroke-linecap="round"/><path d="M8 11h6M11 8v6" stroke-width="2" stroke-linecap="round"/></svg>
        </div>
        <p class="error-state-title">Sin resultados</p>
        <p class="error-state-desc">No hay centros para los filtros aplicados.</p>
        <button class="error-state-action" onclick="PillsEngine.limpiar('${vista}')">
          Limpiar filtros
        </button>
      </div>`;
  }

  // ── Skeleton loading (M1: reutiliza .skeleton-card ya definido en style2.css) ──
  function skeletonHTML(n = 4) {
    return Array.from({ length: n }, () => `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-line skeleton-line-title"></div>
        <div class="skeleton-line skeleton-line-addr"></div>
        <div class="skeleton-btns">
          <div class="skeleton-line skeleton-btn"></div>
          <div class="skeleton-line skeleton-btn"></div>
        </div>
      </div>`).join('');
  }

  // Prioridad de visualización: los prestadores NIVEL "PREMIUM" van primero.
  // Sort estable (no reordena el resto): respeta el orden que ya traía la
  // lista dentro de cada grupo (ej. orden por cercanía si ya se activó
  // "Ordenar por cercanía", o el orden original del JSON).
  function ordenarPorPrioridad(lista) {
    return [...lista].sort((a, b) => {
      const prioridadA = a.NIVEL === 'PREMIUM' ? 0 : 1;
      const prioridadB = b.NIVEL === 'PREMIUM' ? 0 : 1;
      return prioridadA - prioridadB;
    });
  }

  function renderCards(vista, lista) {
    const estado = estados[vista];
    const { opciones } = estado;
    const contenedor = document.getElementById(opciones.contenedorId);
    if (!contenedor) return;

    const metaCount = document.getElementById(opciones.metaCountId);
    const listaOrdenada = ordenarPorPrioridad(lista);

    contenedor.classList.add('cards-grid--filtering');
    contenedor.classList.remove('cards-grid--visible');
    contenedor.setAttribute('aria-busy', 'true');

    setTimeout(() => {
      if (listaOrdenada.length === 0) {
        contenedor.innerHTML = opciones.mensajeSinResultados || mensajeSinResultadosDefault(vista);
        if (metaCount) metaCount.textContent = 'Sin resultados';
      } else {
        contenedor.innerHTML = listaOrdenada
          .map((item, i) => {
            const itemFinal = opciones.transformItem ? opciones.transformItem(item) : item;
            return window.crearCardHTML(itemFinal, opciones.tipoVista, i);
          })
          .join('');
        if (metaCount) {
          metaCount.textContent = opciones.formatearContador
            ? opciones.formatearContador(listaOrdenada.length)
            : `${listaOrdenada.length} resultado${listaOrdenada.length !== 1 ? 's' : ''}`;
        }
      }
      contenedor.classList.remove('cards-grid--filtering');
      contenedor.classList.add('cards-grid--visible');
      contenedor.setAttribute('aria-busy', 'false');
    }, 110);
  }

  // ── Construcción dinámica de chips ─────────────────────────────
  function valoresUnicos(datos, pill) {
    const set = new Set();
    datos.forEach(d => {
      const valor = d[pill.campo];
      if (!valor) return;
      if (pill.multivalor) {
        String(valor).split(',').forEach(v => { const t = v.trim(); if (t) set.add(t); });
      } else {
        set.add(valor);
      }
    });
    return [...set].sort((a, b) => String(a).localeCompare(String(b), 'es'));
  }

  function crearChipSelect(vista, pill) {
    const estado = estados[vista];
    const select = document.createElement('select');
    select.className = 'filter-chip-select';
    select.id = `chip-${pill.campo.toLowerCase()}`;
    select.setAttribute('aria-label', `Filtrar por ${pill.label}`);

    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = pill.label;
    select.appendChild(optDefault);

    if (pill.tipoPill === 'campo-dinamico') {
      // Opciones fijas definidas en la config (no se derivan del JSON)
      (pill.opciones || []).forEach(({ valor, label }) => {
        const opt = document.createElement('option');
        opt.value = valor;
        opt.textContent = label;
        select.appendChild(opt);
      });
    } else {
      valoresUnicos(estado.datosOriginales, pill).forEach(valor => {
        const opt = document.createElement('option');
        opt.value = valor;
        opt.textContent = valor;
        select.appendChild(opt);
      });
    }

    select.addEventListener('change', e => {
      estado.filtros[pill.campo] = e.target.value;
      select.classList.toggle('active', !!e.target.value);
      aplicarFiltros(vista);
    });

    return select;
  }

  function crearChipBoolean(vista, pill) {
    const estado = estados[vista];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-chip';
    btn.id = `chip-${pill.campo.toLowerCase()}`;
    btn.dataset.field = pill.campo;
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = pill.label;

    btn.addEventListener('click', () => {
      estado.filtros[pill.campo] = !estado.filtros[pill.campo];
      btn.classList.toggle('active', estado.filtros[pill.campo]);
      btn.setAttribute('aria-pressed', String(estado.filtros[pill.campo]));
      aplicarFiltros(vista);
    });

    return btn;
  }

  function crearChipsDOM(vista) {
    const estado = estados[vista];
    const { cfg, opciones } = estado;
    const contenedorChips = document.getElementById(opciones.chipsContainerId);
    if (!contenedorChips) return;

    contenedorChips.innerHTML = '';

    pillsActivos(cfg).forEach(pill => {
      const el = (pill.tipoPill === 'select' || pill.tipoPill === 'campo-dinamico')
        ? crearChipSelect(vista, pill)
        : crearChipBoolean(vista, pill);
      contenedorChips.appendChild(el);
    });
  }

  // ── Buscador de texto libre ─────────────────────────────────────
  function configurarBuscador(vista) {
    const estado = estados[vista];
    const inputs = document.querySelectorAll('#search-input, .search-input-local');
    if (!inputs.length) return;

    let debounce;
    inputs.forEach(input => {
      input.addEventListener('input', e => {
        const valor = e.target.value;
        inputs.forEach(otro => { if (otro !== e.target) otro.value = valor; });
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          estado.filtros.texto = valor.trim();
          aplicarFiltros(vista);
        }, DEBOUNCE_MS);
      });
    });
  }

  // ── Limpiar filtros ──────────────────────────────────────────────
  function limpiar(vista) {
    const estado = estados[vista];
    if (!estado) return;

    const chipsSelector = `#${estado.opciones.chipsContainerId}`;
    document.querySelectorAll(`${chipsSelector} .filter-chip`).forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    document.querySelectorAll(`${chipsSelector} .filter-chip-select`).forEach(s => {
      s.value = '';
      s.classList.remove('active');
    });
    document.querySelectorAll('#search-input, .search-input-local').forEach(i => { i.value = ''; });

    estado.filtros = crearFiltrosVacios(estado.cfg);
    aplicarFiltros(vista);
  }

  // ── Inicialización ────────────────────────────────────────────
  async function init(vista, opcionesUsuario = {}) {
    const cfg = getConfig(vista);
    if (!cfg) return;

    const opciones = Object.assign({
      contenedorId: 'contenedor-cards',
      chipsContainerId: 'filter-chips-container',
      metaCountId: 'header-meta-count',
      tipoVista: cfg.tipo,
      transformItem: null,
      formatearContador: null,
      mensajeSinResultados: null
    }, opcionesUsuario);

    const contenedor = document.getElementById(opciones.contenedorId);
    if (!contenedor) return;

    estados[vista] = {
      cfg,
      filtros: crearFiltrosVacios(cfg),
      datosOriginales: [],
      opciones
    };

    // C3: los cambios de contenido de este grid (skeleton -> cards / error /
    // sin resultados) se anuncian a lectores de pantalla vía aria-live.
    contenedor.setAttribute('aria-live', 'polite');
    contenedor.setAttribute('aria-busy', 'true');
    // M1: el CSS de skeleton ya existía en style2.css pero no se usaba acá;
    // esto cubre la espera del fetch inicial (antes solo se veía el grid vacío).
    contenedor.innerHTML = skeletonHTML();

    try {
      const response = await fetch(cfg.fuente);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      let datos = data.prestadores || [];
      if (cfg.tipo) datos = datos.filter(p => p.TIPO === cfg.tipo);

      estados[vista].datosOriginales = datos;

      crearChipsDOM(vista);
      configurarBuscador(vista);
      renderCards(vista, datos);

      // Compatibilidad hacia atrás: si algún HTML todavía tiene
      // onclick="window.limpiarFiltrosFarmacias()" etc., sigue andando.
      window[`limpiarFiltros${capitalizar(vista)}`] = () => limpiar(vista);

    } catch (err) {
      console.error(`[PillsEngine] Error al inicializar la vista "${vista}":`, err);
      contenedor.setAttribute('aria-busy', 'false');
      contenedor.innerHTML = `
        <div class="error-state" role="alert">
          <p class="error-state-title">No se pudo cargar la información</p>
          <p class="error-state-desc">Revisá tu conexión e intentá de nuevo.</p>
        </div>`;
    }
  }

  // ── Geolocalización on-demand ────────────────────────────────────
  // Se llama desde un botón en el HTML: onclick="PillsEngine.activarUbicacion('farmacias', this)"
  // El pedido de permiso al navegador solo ocurre en este click, nunca al cargar la página.
  async function activarUbicacion(vista, boton) {
    const estado = estados[vista];
    if (!estado) return;

    const span = boton ? boton.querySelector('span') : null;
    if (boton) {
      boton.disabled = true;
      if (span) span.textContent = 'Buscando ubicación…';
    }

    const posicion = typeof window.obtenerPosicionUsuario === 'function'
      ? await window.obtenerPosicionUsuario()
      : null;

    window.posicionUsuario = posicion;

    if (!posicion) {
      if (boton && span) {
        span.textContent = 'No pudimos acceder a tu ubicación';
        setTimeout(() => {
          boton.disabled = false;
          span.textContent = 'Ordenar por cercanía';
        }, 3000);
      }
      return;
    }

    if (typeof window.calcularDistanciaKm === 'function') {
      const distanciaDe = item => (Number.isFinite(item.lat) && Number.isFinite(item.lng))
        ? window.calcularDistanciaKm(posicion.lat, posicion.lng, item.lat, item.lng)
        : Infinity;
      estado.datosOriginales = [...estado.datosOriginales].sort((a, b) => distanciaDe(a) - distanciaDe(b));
    }

    aplicarFiltros(vista); // re-renderiza respetando los filtros de pills que estén activos

    if (boton) {
      if (span) span.textContent = 'Más cerca';
      boton.hidden = true; // ya cumplió su función
    }
  }

  return { init, limpiar, activarUbicacion };
})();
