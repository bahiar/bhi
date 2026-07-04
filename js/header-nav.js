/**
 * header-nav.js
 * Componente reutilizable que genera el header + sub-nav coherentes
 * Soluciona inconsistencias de navegación entre páginas funcionales y legales
 *
 * Uso en HTML:
 *   <div id="header-nav-root"></div>
 *   <script src="js/header-nav.js" defer></script>
 *   <script>
 *     window.headerNavConfig = { page: 'farmacias', type: 'full' };
 *   </script>
 *
 * Parámetros de window.headerNavConfig:
 *   - page: nombre del archivo sin .html (ej. 'farmacias', 'privacidad')
 *   - type: 'full' | 'legal' | 'maintenance'
 *     * full: con FAQ + botón instalar (páginas funcionales completas)
 *     * legal: con reportar error (privacidad, términos, aviso legal)
 *     * maintenance: solo logo y nav base (páginas en construcción)
 */
(function() {
    'use strict';

    // Listado COMPLETO de secciones para páginas funcionales (desktop mostrará todas)
    var FULL_NAV_ITEMS = [
        { href: 'index.html', label: 'Inicio' },
        { href: 'guardias.html', label: 'Emergencia' },
        { href: 'farmacias.html', label: 'Farmacias' },
        { href: 'laboratorios.html', label: 'Laboratorios' },
        { href: 'ortopedias.html', label: 'Ortopedias' },
        { href: 'opticas.html', label: 'Ópticas' },
        { href: 'imagenes.html', label: 'Imágenes' },
        { href: 'enfermeria.html', label: 'Enfermería' },
        { href: 'kinesiologia.html', label: 'Kinesiología' },
        { href: 'nutricion.html', label: 'Nutrición' },
        { href: 'fonoaudiologia.html', label: 'Fonoaudiología' }
    ];

    // Sub-nav reducido para páginas legales (primeras 6 secciones principales)
    var LEGAL_NAV_ITEMS = FULL_NAV_ITEMS.slice(0, 6);

    function getCurrentPage() {
        var config = window.headerNavConfig || {};
        return config.page || 'index';
    }

    function getNavType() {
        var config = window.headerNavConfig || {};
        return config.type || 'full';
    }

    function buildHeaderHTML(type) {
        var html = '<div class="header-content">';

        // Logo siempre presente
        html += '<a href="index.html" class="brand-logo">' +
            '<img src="assets/images/mask-icon.svg" alt="" aria-hidden="true" width="36" height="36" style="flex-shrink:0;border-radius:9px;">' +
            '<span class="brand-logo__wordmark">' +
            '<span class="brand-logo__name">BAHI<span class="brand-logo__name--accent">.ar</span></span>' +
            '<span class="brand-logo__tagline">guía médica de Bahía Blanca</span>' +
            '</span>' +
            '</a>';

        // Header actions varía según tipo
        html += '<div class="header-actions">';

        if (type === 'full') {
            // Páginas funcionales: botón instalar + FAQ
            html += '<button id="btn-instalar-app" aria-label="Instalar la app BAHI.ar" class="header-btn header-btn--instalar" type="button" hidden>Instalar</button>' +
                '<button onclick="document.getElementById(\'faq-modal-overlay\').style.display=\'flex\'" aria-label="Ayuda: preguntas frecuentes" class="header-btn">' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
                'Ayuda' +
                '</button>';
        } else if (type === 'legal') {
            // Páginas legales: reportar error
            html += '<a href="https://wa.me/542915658189?text=Hola!%20Quiero%20reportar%20un%20error%3A%20" class="btn-bug-report focus-ring">' +
                '<span class="btn-bug-report__bubble"><svg width="14" height="14" viewBox="0 0 448 512" fill="#25D366" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.3-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg></span>' +
                '<span>Reportar error</span>' +
                '</a>';
        }
        // type === 'maintenance': sin header-actions

        html += '</div>';

        // Contenedor de búsqueda global (solo para pages con búsqueda)
        if (type === 'full') {
            html += '<div id="contenedor-busqueda-global" class="busqueda-global-resultados" hidden></div>';
        }

        html += '</div>';
        return html;
    }

    function buildSubNavHTML(type) {
        var current = getCurrentPage();
        var navItems = (type === 'legal') ? LEGAL_NAV_ITEMS : FULL_NAV_ITEMS;

        var html = '<nav class="sub-nav" aria-label="Navegación principal">' +
            '<ul class="sub-nav-list">';

        navItems.forEach(function(item) {
            var isCurrent = item.href === (current + '.html') || (current === 'index' && item.href === 'index.html');
            html += '<li><a href="' + item.href + '" class="sub-nav-link' + (isCurrent ? ' active' : '') + '"' +
                (isCurrent ? ' aria-current="page"' : '') +
                '>' + item.label + '</a></li>';
        });

        html += '</ul></nav>';
        return html;
    }

    function mount() {
        var root = document.getElementById('header-nav-root');
        if (!root) return;

        var type = getNavType();
        var headerHTML = buildHeaderHTML(type);
        var subNavHTML = buildSubNavHTML(type);

        // Reemplazar el root por header + nav
        var tempContainer = document.createElement('div');
        tempContainer.innerHTML =
            '<header class="main-header">' + headerHTML + '</header>' +
            subNavHTML;

        root.replaceWith(tempContainer.firstChild, tempContainer.lastChild);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
