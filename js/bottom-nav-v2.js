/**
 * bottom-nav-v2.js
 * Footbar móvil con botón "Más" (abre modal de servicios adicionales).
 * Variante distinta a js/bottom-nav.js (que usa 4 links directos sin modal).
 * Usar en páginas que necesiten: Inicio, Emergencia, Farmacias + "Más"
 * (Laboratorios, Patología, Imágenes, Oftalmología, Ópticas, Kinesiología,
 * Ortopedias, Atención mujer, Salas médicas, Medicina prepaga, Servicios
 * fúnebres, Otros).
 *
 * Incluir en cualquier página con:
 *   1) <div id="bottom-nav-root"></div>
 *   2) <script src="js/bottom-nav-v2.js" defer></script>
 *
 * Los íconos son SVG Tabler-outline (24x24, stroke=currentColor, stroke-width 1)
 * embebidos como strings acá mismo — ya no se descargan por fetch() desde /js
 * (ver versión anterior). Esto elimina la dependencia de archivos externos
 * mixtos en estilo y el paso de recolorSvg() para forzar currentColor.
 *
 * La página activa se detecta automáticamente por el nombre de archivo actual
 * y se marca con una barra de acento superior en var(--primary) (ver
 * .bottom-nav-item.active en style2.css) — antes era un punto debajo del ícono.
 *
 * El modal "Más" maneja su propio ciclo de foco (patrón WAI-ARIA dialog) y su
 * cierre con Escape acá mismo, en setupMasModal() — no depende de que la página
 * que lo incluye repita esa lógica en un <script> propio.
 */
(function () {
    'use strict';

    var ICONS = {
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12h2l-9 -9l-9 9h2v7a2 2 0 0 0 2 2h5.5" /><path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>',
        ambulance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5" /><path d="M6 10h4m-2 -2v4" /></svg>',
        pharmacy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v1a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -1" /><path d="M10 6v.98c0 .877 -.634 1.626 -1.5 1.77c-.866 .144 -1.5 .893 -1.5 1.77v8.48a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-8.48c0 -.877 -.634 -1.626 -1.5 -1.77a1.795 1.795 0 0 1 -1.5 -1.77v-.98" /><path d="M7 12h10" /><path d="M7 18h10" /><path d="M11 15h2" /></svg>',
        dots: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>',
        testPipe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 8.04l-12.122 12.124a2.857 2.857 0 1 1 -4.041 -4.04l12.122 -12.124" /><path d="M7 13h8" /><path d="M19 15l1.5 1.6a2 2 0 1 1 -3 0l1.5 -1.6" /><path d="M15 3l6 6" /></svg>',
        microscope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21h14" /><path d="M6 18h2" /><path d="M7 18v3" /><path d="M9 11l3 3l6 -6l-3 -3l-6 6" /><path d="M10.5 12.5l-1.5 1.5" /><path d="M17 3l3 3" /><path d="M12 21a6 6 0 0 0 3.715 -10.712" /></svg>',
        imaging: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 18h16" /><path d="M9 6l6 12M15 6L9 18" /><path d="M6 12h12" /></svg>',
        eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>',
        glasses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h-2l-3 10v2.5" /><path d="M16 4h2l3 10v2.5" /><path d="M10 16l4 0" /><path d="M14 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0" /><path d="M3 16.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0" /></svg>',
        physio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15l-1 -3l4 -2l4 1h3.5" /><path d="M3 19a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M11 6a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 17v-7" /><path d="M8 20h7l1 -4l4 -2" /><path d="M18 20h3" /></svg>',
        crutches: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-4a2 2 0 0 1 -2 -2" /><path d="M11 21h2" /><path d="M12 21v-4.092a3 3 0 0 1 .504 -1.664l.992 -1.488a3 3 0 0 0 .504 -1.664v-5.092" /><path d="M12 21v-4.092a3 3 0 0 0 -.504 -1.664l-.992 -1.488a3 3 0 0 1 -.504 -1.664v-5.092" /><path d="M10 11h4" /></svg>',
        genderFemale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" /><path d="M12 14v7" /><path d="M9 18h6" /></svg>',
        buildingHospital: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l18 0" /><path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16" /><path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" /><path d="M10 9l4 0" /><path d="M12 7l0 4" /></svg>',
        calendarDollar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h-7a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v3" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h12.5" /><path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" /><path d="M19 21v1m0 -8v1" /></svg>',
        ribbonHealth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21s9.286 -9.841 9.286 -13.841a3.864 3.864 0 0 0 -1.182 -3.008a4.13 4.13 0 0 0 -3.104 -1.144a4.13 4.13 0 0 0 -3.104 1.143a3.864 3.864 0 0 0 -1.182 3.01c0 4 9.286 13.84 9.286 13.84" /></svg>',
        textPlus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M19 10h-14" /><path d="M5 6h14" /><path d="M14 14h-9" /><path d="M5 18h6" /><path d="M18 15v6" /><path d="M15 18h6" /></svg>'
    };

    var NAV_ITEMS = [
        { href: 'index.html', id: 'inicio', label: 'Inicio', ariaLabel: 'Inicio', icon: ICONS.home },
        { href: 'emergencias.html', id: 'emergencias', label: 'Emergencias', ariaLabel: 'Emergencias', icon: ICONS.ambulance },
        { href: 'farmacias.html', id: 'farmacias', label: 'Farmacias', ariaLabel: 'Farmacias', icon: ICONS.pharmacy }
    ];

    /**
     * PALETA DE ACENTOS SISTEMÁTICA (Escala Tonal Coherente)
     * 5 azules + 1 rojo para urgencias reales — ver detalle en versión anterior.
     * Sincronizar con CSS custom properties en style.css.
     */
    var ACCENT_COLORS = {
        'blue-light': { color: '#3E92CC', bg: 'rgba(62,146,204,0.12)' },
        'blue-medium': { color: '#2A628F', bg: 'rgba(42,98,143,0.12)' },
        'blue-dark': { color: '#13293D', bg: 'rgba(19,41,61,0.12)' },
        'blue-deeper': { color: '#16324F', bg: 'rgba(22,50,79,0.12)' },
        'blue-petrol': { color: '#18435A', bg: 'rgba(24,67,90,0.12)' },
        'emergency': { color: '#DC2626', bg: 'rgba(220,38,38,0.12)' }
    };

    /**
     * Orden agrupado por afinidad temática (no alfabético ni de agregado):
     *   1) Diagnóstico: Laboratorios, Patología, Imágenes
     *   2) Especialidades/sentidos: Oftalmología, Ópticas, Kinesiología, Ortopedias
     *   3) Salud de la mujer + salas: Atención mujer, Salas médicas
     *   4) Gestión/trámites: Medicina prepaga, Servicios fúnebres, Otros (catch-all al final)
     */
    var MAS_ITEMS = [
        // 1) Diagnóstico → azul medio
        { href: 'laboratorios.html', label: 'Laboratorios', ...ACCENT_COLORS['blue-medium'], icon: ICONS.testPipe },
        { href: 'patologia.html', label: 'Patología', ...ACCENT_COLORS['blue-medium'], icon: ICONS.microscope },
        { href: 'imagenes.html', label: 'Imágenes', ...ACCENT_COLORS['blue-medium'], icon: ICONS.imaging },

        // 2) Especialidades/sentidos → azul claro
        { href: 'oftalmologia.html', label: 'Oftalmología', ...ACCENT_COLORS['blue-light'], icon: ICONS.eye },
        { href: 'opticas.html', label: 'Ópticas', ...ACCENT_COLORS['blue-light'], icon: ICONS.glasses },
        { href: 'kinesiologia.html', label: 'Kinesiología', ...ACCENT_COLORS['blue-light'], icon: ICONS.physio },
        { href: 'ortopedias.html', label: 'Ortopedias', ...ACCENT_COLORS['blue-light'], icon: ICONS.crutches },

        // 3) Salud de la mujer + salas → azul petróleo (intervención/atención directa)
        { href: 'femenina.html', label: 'Atención mujer', ...ACCENT_COLORS['blue-petrol'], icon: ICONS.genderFemale },
        { href: 'unidades.html', label: 'Salas médicas', ...ACCENT_COLORS['blue-petrol'], icon: ICONS.buildingHospital },

        // 4) Gestión/trámites → azul más oscuro (especialidades profundas / catch-all)
        { href: 'prepaga.html', label: 'Medicina prepaga', ...ACCENT_COLORS['blue-deeper'], icon: ICONS.calendarDollar },
        { href: 'sepelios.html', label: 'Servicios fúnebres', ...ACCENT_COLORS['blue-deeper'], icon: ICONS.ribbonHealth },
        { href: 'otros.html', label: 'Otros', ...ACCENT_COLORS['blue-deeper'], icon: ICONS.textPlus }
    ];

    function getCurrentPage() {
        var path = window.location.pathname;
        var file = path.substring(path.lastIndexOf('/') + 1);
        if (file === '' || file === '/') file = 'index.html';
        return file;
    }

    function iconTag(svgMarkup, className) {
        return svgMarkup
            .replace('<svg ', '<svg class="' + className + '" aria-hidden="true" ');
    }

    function buildNavHTML() {
        var current = getCurrentPage();
        var html = '<nav class="bottom-nav" aria-label="Navegación principal">';

        NAV_ITEMS.forEach(function (item) {
            var isActive = item.href === current;
            html += '<a href="' + item.href + '" class="bottom-nav-item' + (isActive ? ' active' : '') + '"' +
                (isActive ? ' aria-current="page"' : '') +
                ' aria-label="' + item.ariaLabel + '" id="nav-' + item.id + '">' +
                iconTag(item.icon, 'bottom-nav-icon') +
                item.label +
                '</a>';
        });

        html += '<button type="button" id="btn-mas-servicios" class="bottom-nav-item" aria-label="Más servicios" aria-haspopup="dialog" aria-expanded="false" aria-controls="mas-modal-overlay">' +
            iconTag(ICONS.dots, 'bottom-nav-icon') +
            'Más' +
            '</button>';

        html += '</nav>';
        return html;
    }

    function buildModalHTML() {
        var itemsHtml = MAS_ITEMS.map(function (item) {
            return '<a href="' + item.href + '" class="mas-grid-item">' +
                '<span class="mas-grid-item__icon" style="background:' + item.bg + ';color:' + item.color + ';">' +
                iconTag(item.icon, 'mas-grid-item__icon-img') +
                '</span>' +
                '<span class="mas-grid-item__label">' + item.label + '</span>' +
                '</a>';
        }).join('');

        return '<div id="mas-modal-overlay" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(10,10,40,0.65);align-items:flex-end;justify-content:center;" ' +
            'role="dialog" aria-modal="true" aria-labelledby="mas-modal-title">' +
            '<div style="background:var(--card-bg,#fff);width:100%;max-width:480px;border-radius:20px 20px 0 0;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">' +
            '<div style="padding:16px 20px 6px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
            '<div id="mas-modal-title" style="font-size:15px;font-weight:700;color:var(--primary,#191971);font-family:var(--font-brand);">Más servicios</div>' +
            '<button id="mas-modal-close" ' +
            'style="width:44px;height:44px;border-radius:50%;background:rgba(15,23,42,0.06);border:none;color:#525E73;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;" aria-label="Cerrar">✕</button>' +
            '</div>' +
            '<div class="mas-grid" style="overflow-y:auto;padding:10px 20px 26px;">' + itemsHtml + '</div>' +
            '</div>' +
            '</div>';
    }

    /**
     * Maneja el ciclo de vida del modal "Más" siguiendo el patrón WAI-ARIA de diálogo:
     * al abrir, mueve el foco adentro; al cerrar (X, click en el fondo o Escape),
     * lo devuelve al botón que lo disparó. Vive acá y no en cada página, porque
     * bottom-nav-v2.js es el único componente reutilizable entre todas ellas.
     */
    function setupMasModal() {
        var trigger = document.getElementById('btn-mas-servicios');
        var overlay = document.getElementById('mas-modal-overlay');
        var closeBtn = document.getElementById('mas-modal-close');
        if (!trigger || !overlay || !closeBtn) return;

        // C2: ciclo de foco (focus trap) dentro del diálogo. Antes solo se
        // enviaba el foco al abrir/cerrar, pero Tab/Shift+Tab podían sacar
        // el foco del modal hacia contenido de fondo que sigue oculto
        // visualmente detrás del overlay.
        function getFocusables() {
            return Array.prototype.slice.call(
                overlay.querySelectorAll('a[href], button:not([disabled])')
            );
        }

        function onKeydown(e) {
            if (e.key === 'Escape') {
                closeModal();
                return;
            }
            if (e.key !== 'Tab') return;

            var focusables = getFocusables();
            if (!focusables.length) return;
            var first = focusables[0];
            var last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }

        function openModal() {
            overlay.style.display = 'flex';
            trigger.setAttribute('aria-expanded', 'true');
            closeBtn.focus();
            document.addEventListener('keydown', onKeydown);
        }

        function closeModal() {
            overlay.style.display = 'none';
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus();
            document.removeEventListener('keydown', onKeydown);
        }

        trigger.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });
    }

    /**
     * Inyecta un <style> con overrides dark-mode para toda la barra y el modal
     * "Más". Vive acá (y no en style2.css) para que el componente sea
     * autocontenido: cualquier página que lo incluya obtiene soporte dark mode
     * sin depender de reglas externas. Usa los mismos tokens que ya definen
     * [data-mode="dark"] en el resto del sitio (--card-bg, --text-main,
     * --text-muted, --border-light, --bg-main, --primary).
     */
    function injectThemeStyles() {
        if (document.getElementById('bottom-nav-v2-theme')) return;
        var style = document.createElement('style');
        style.id = 'bottom-nav-v2-theme';
        style.textContent =
            '[data-mode="dark"] .bottom-nav {' +
            '  background: var(--card-bg, #181d33) !important;' +
            '  border-top: 1px solid var(--border-light, #2a3050) !important;' +
            '}' +
            '[data-mode="dark"] .bottom-nav-item {' +
            '  color: var(--text-muted, #9a9fb5) !important;' +
            '}' +
            '[data-mode="dark"] .bottom-nav-item.active,' +
            '[data-mode="dark"] .bottom-nav-item[aria-current="page"] {' +
            '  color: var(--text-link, #8FA6FF) !important;' +
            '}' +
            '[data-mode="dark"] .bottom-nav-item.active::before,' +
            '[data-mode="dark"] .bottom-nav-item[aria-current="page"]::before {' +
            '  background: var(--text-link, #8FA6FF) !important;' +
            '}' +
            '[data-mode="dark"] #mas-modal-overlay > div {' +
            '  background: var(--card-bg, #181d33) !important;' +
            '}' +
            '[data-mode="dark"] #mas-modal-title {' +
            '  color: var(--text-main, #eef0f5) !important;' +
            '}' +
            '[data-mode="dark"] #mas-modal-close {' +
            '  background: rgba(255,255,255,0.08) !important;' +
            '  color: var(--text-main, #eef0f5) !important;' +
            '}' +
            '[data-mode="dark"] .mas-grid-item {' +
            '  background: var(--bg-main, #0e1220) !important;' +
            '  border-color: var(--border-light, #2a3050) !important;' +
            '}' +
            '[data-mode="dark"] .mas-grid-item__label {' +
            '  color: var(--text-main, #eef0f5) !important;' +
            '}';
        document.head.appendChild(style);
    }

    function mount() {
        var root = document.getElementById('bottom-nav-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'bottom-nav-root';
            document.body.appendChild(root);
        }
        root.outerHTML = buildNavHTML() + buildModalHTML();
        setupMasModal();
        injectThemeStyles();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
