/**
 * bottom-nav-v2.js
 * Footbar móvil con botón "Más" (abre modal de servicios adicionales).
 * Variante distinta a js/bottom-nav.js (que usa 4 links directos sin modal).
 * Usar en páginas que necesiten: Inicio, Emergencia, Farmacias + "Más" (Laboratorios, Ortopedias, Imágenes, Ópticas, Enfermería, Kinesiología, Nutrición, Fonoaudiología).
 *
 * Incluir en cualquier página con:
 *   1) <div id="bottom-nav-root"></div>
 *   2) <script src="js/bottom-nav-v2.js" defer></script>
 *
 * Los íconos ahora son archivos SVG externos ubicados en /js (en vez de paths inline).
 * Ver ICON_BASE_PATH más abajo si se necesita cambiar la carpeta de íconos.
 *
 * La página activa se detecta automáticamente por el nombre de archivo actual.
 * El manejador de tecla Escape para cerrar el modal ya existe en el <script> propio
 * de cada página (busca #mas-modal-overlay y el botón con aria-controls="mas-modal-overlay");
 * este componente mantiene esos mismos IDs/selectores para no romper esa lógica.
 */
(function () {
    'use strict';

    var ICON_BASE_PATH = 'js/';

    var NAV_ITEMS = [
        {
            href: 'index.html',
            id: 'inicio',
            label: 'Inicio',
            ariaLabel: 'Inicio',
            icon: 'hospital-svgrepo-com.svg'
        },
        {
            href: 'guardias.html',
            id: 'guardias',
            label: 'Emergencia',
            ariaLabel: 'Emergencia',
            icon: 'ambulance-svgrepo-com.svg'
        },
        {
            href: 'farmacias.html',
            id: 'farmacias',
            label: 'Farmacias',
            ariaLabel: 'Farmacias',
            icon: 'medicine-9-svgrepo-com.svg'
        }
    ];

    var MAS_ITEMS = [
        {
            href: 'laboratorios.html',
            label: 'Laboratorios',
            bg: 'rgba(31,117,254,0.12)',
            color: '#1F75FE',
            icon: 'lab-svgrepo-com.svg'
        },
        {
            href: 'https://www.bahi.ar/ortopedias',
            label: 'Ortopedias',
            bg: 'rgba(25,25,113,0.1)',
            color: '#191971',
            icon: 'orthopedic-leg-svgrepo-com.svg'
        },
        {
            href: 'https://www.bahi.ar/Imagenes',
            label: 'Imágenes',
            bg: 'rgba(99,153,34,0.12)',
            color: '#3B6D11',
            icon: 'i-radiology-svgrepo-com.svg'
        },
        {
            href: 'opticas.html',
            label: 'Ópticas',
            bg: 'rgba(255,107,0,0.12)',
            color: '#CC5500',
            icon: 'reading-glasses-optic-svgrepo-com.svg'
        },
        {
            href: 'https://www.bahi.ar/enfermeria',
            label: 'Enfermería',
            bg: 'rgba(220,20,90,0.12)',
            color: '#DC145A',
            icon: 'nurse-svgrepo-com.svg'
        },
        {
            href: 'https://www.bahi.ar/kinesiologia',
            label: 'Kinesiología',
            bg: 'rgba(0,150,136,0.12)',
            color: '#009688',
            icon: 'i-physical-therapy-svgrepo-com.svg'
        },
        {
            href: 'https://www.bahi.ar/nutricion',
            label: 'Nutrición',
            bg: 'rgba(139,195,74,0.15)',
            color: '#558B2F',
            icon: 'i-nutrition-svgrepo-com.svg'
        },
        {
            href: 'https://www.bahi.ar/fonoaudiologia',
            label: 'Fonoaudiología',
            bg: 'rgba(156,39,176,0.12)',
            color: '#9C27B0',
            icon: 'ear-3-svgrepo-com.svg'
        }
    ];

    function getCurrentPage() {
        var path = window.location.pathname;
        var file = path.substring(path.lastIndexOf('/') + 1);
        if (file === '' || file === '/') file = 'index.html';
        return file;
    }

    function iconTag(iconFile, className) {
        return '<img class="' + className + '" src="' + ICON_BASE_PATH + iconFile + '" alt="" aria-hidden="true">';
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

        html += '<button type="button" class="bottom-nav-item" aria-label="Más servicios" aria-haspopup="dialog" aria-expanded="false" aria-controls="mas-modal-overlay" onclick="document.getElementById(\'mas-modal-overlay\').style.display=\'flex\';this.setAttribute(\'aria-expanded\',\'true\')">' +
            '<svg class="bottom-nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="19" cy="12" r="2" fill="currentColor"/></svg>' +
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
            'onclick="if(event.target===this){this.style.display=\'none\';document.querySelector(\'.bottom-nav-item[aria-controls=mas-modal-overlay]\').setAttribute(\'aria-expanded\',\'false\');}" ' +
            'role="dialog" aria-modal="true" aria-labelledby="mas-modal-title">' +
            '<div style="background:var(--bg-card,#fff);width:100%;max-width:480px;border-radius:20px 20px 0 0;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">' +
            '<div style="padding:16px 20px 6px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">' +
            '<div id="mas-modal-title" style="font-size:15px;font-weight:700;color:var(--primary,#191971);font-family:var(--font-brand);">Más servicios</div>' +
            '<button onclick="document.getElementById(\'mas-modal-overlay\').style.display=\'none\';document.querySelector(\'.bottom-nav-item[aria-controls=mas-modal-overlay]\').setAttribute(\'aria-expanded\',\'false\')" ' +
            'style="width:30px;height:30px;border-radius:50%;background:rgba(15,23,42,0.06);border:none;color:#525E73;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;" aria-label="Cerrar">✕</button>' +
            '</div>' +
            '<div class="mas-grid" style="overflow-y:auto;padding:10px 20px 26px;">' + itemsHtml + '</div>' +
            '</div>' +
            '</div>';
    }

    function mount() {
        var root = document.getElementById('bottom-nav-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'bottom-nav-root';
            document.body.appendChild(root);
        }
        root.outerHTML = buildNavHTML() + buildModalHTML();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
