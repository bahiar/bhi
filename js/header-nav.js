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
                '<span class="btn-bug-report__bubble">🐞</span>' +
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
