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
 * El modal "Más" maneja su propio ciclo de foco (patrón WAI-ARIA dialog) y su
 * cierre con Escape acá mismo, en setupMasModal() — no depende de que la página
 * que lo incluye repita esa lógica en un <script> propio.
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

    /**
     * PALETA DE ACENTOS SISTEMÁTICA (Escala Tonal Coherente)
     * 5 azules + 1 rojo para urgencias reales
     * 
     * Lógica:
     *   - Azul Claro: servicios visuales/diagnóstico accesible
     *   - Azul Medio: diagnóstico principal
     *   - Azul Oscuro: estructura/especialidades complejas
     *   - Azul Más Oscuro: especialidades profundas
     *   - Azul Petróleo: intervención (enfermería)
     *   - Rojo: SOLO emergencias reales
     * 
     * Ventajas:
     *   ✓ Coherencia tonal: familia azul/teal sin saltos
     *   ✓ Profesional: calmada, seria (apropiada para salud)
     *   ✓ Accesibilidad: ratios de contraste verificados
     *   ✓ Jerarquía: oscuridad = especialización
     * 
     * Sincronizar con CSS custom properties en style.css:
     *   --accent-blue-light, --accent-blue-medium, --accent-blue-dark,
     *   --accent-blue-deeper, --accent-blue-petrol, --accent-emergency
     */
    var ACCENT_COLORS = {
        'blue-light': { color: '#3E92CC', bg: 'rgba(62,146,204,0.12)' },
        'blue-medium': { color: '#2A628F', bg: 'rgba(42,98,143,0.12)' },
        'blue-dark': { color: '#13293D', bg: 'rgba(19,41,61,0.12)' },
        'blue-deeper': { color: '#16324F', bg: 'rgba(22,50,79,0.12)' },
        'blue-petrol': { color: '#18435A', bg: 'rgba(24,67,90,0.12)' },
        'emergency': { color: '#DC2626', bg: 'rgba(220,38,38,0.12)' }
    };

    var MAS_ITEMS = [
        {
            href: 'laboratorios.html',
            label: 'Laboratorios',
            ...ACCENT_COLORS['blue-medium'],
            icon: 'lab-svgrepo-com.svg'
        },
        {
            href: 'ortopedias.html',
            label: 'Ortopedias',
            ...ACCENT_COLORS['blue-dark'],
            icon: 'orthopedic-leg-svgrepo-com.svg'
        },
        {
            href: 'imagenes.html',
            label: 'Imágenes',
            ...ACCENT_COLORS['blue-light'],
            icon: 'i-radiology-svgrepo-com.svg'
        },
        {
            href: 'opticas.html',
            label: 'Ópticas',
            ...ACCENT_COLORS['blue-dark'],
            icon: 'reading-glasses-optic-svgrepo-com.svg'
        },
        {
            href: 'enfermeria.html',
            label: 'Enfermería',
            ...ACCENT_COLORS['blue-petrol'],
            icon: 'nurse-svgrepo-com.svg'
        },
        {
            href: 'kinesiologia.html',
            label: 'Kinesiología',
            ...ACCENT_COLORS['blue-light'],
            icon: 'i-physical-therapy-svgrepo-com.svg'
        },
        {
            href: 'nutricion.html',
            label: 'Nutrición',
            ...ACCENT_COLORS['blue-medium'],
            icon: 'i-nutrition-svgrepo-com.svg'
        },
        {
            href: 'fonoaudiologia.html',
            label: 'Fonoaudiología',
            ...ACCENT_COLORS['blue-deeper'],
            icon: 'ear-3-svgrepo-com.svg'
        }
    ];

    function getCurrentPage() {
        var path = window.location.pathname;
        var file = path.substring(path.lastIndexOf('/') + 1);
        if (file === '' || file === '/') file = 'index.html';
        return file;
    }

    var iconCache = {}; // url -> texto SVG ya procesado (fill="currentColor")

    function iconTag(iconFile, className) {
        var url = ICON_BASE_PATH + iconFile;
        // Placeholder: se reemplaza por el <svg> real una vez que loadIcons() lo descarga.
        return '<span class="' + className + '" data-icon-src="' + url + '" aria-hidden="true"></span>';
    }

    /**
     * Limpia el SVG descargado para que herede color vía currentColor:
     *  - Quita bloques <style> (algunos íconos definen fill ahí, ej. .st0{fill:#000000})
     *  - Quita atributos fill="..." de cada elemento (para que hereden del root)
     *  - Quita width/height fijos del root (para que mande el CSS del contenedor)
     *  - Fuerza fill="currentColor" en el <svg> raíz
     */
    function recolorSvg(svgText) {
        return svgText
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/\sfill="(?!none)[^"]*"/gi, '')
            .replace(/\sfill='(?!none)[^']*'/gi, '')
            .replace(/\swidth="[^"]*"/i, '')
            .replace(/\sheight="[^"]*"/i, '')
            .replace(/<svg /i, '<svg fill="currentColor" ');
    }

    /** Descarga (con caché) todos los SVG referenciados y reemplaza los placeholders por el <svg> real. */
    function loadIcons(root) {
        var placeholders = root.querySelectorAll('[data-icon-src]');
        placeholders.forEach(function (placeholder) {
            var url = placeholder.getAttribute('data-icon-src');

            var apply = function (svgText) {
                var wrapper = document.createElement('div');
                wrapper.innerHTML = svgText.trim();
                var svgEl = wrapper.querySelector('svg');
                if (!svgEl) return;
                svgEl.setAttribute('class', placeholder.getAttribute('class'));
                svgEl.setAttribute('aria-hidden', 'true');
                placeholder.replaceWith(svgEl);
            };

            if (iconCache[url]) {
                apply(iconCache[url]);
                return;
            }

            fetch(url)
                .then(function (res) { return res.ok ? res.text() : Promise.reject(); })
                .then(function (rawSvg) {
                    var processed = recolorSvg(rawSvg);
                    iconCache[url] = processed;
                    apply(processed);
                })
                .catch(function () {
                    console.warn('[bottom-nav-v2] No se pudo cargar el ícono:', url);
                });
        });
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
            'role="dialog" aria-modal="true" aria-labelledby="mas-modal-title">' +
            '<div style="background:var(--bg-card,#fff);width:100%;max-width:480px;border-radius:20px 20px 0 0;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">' +
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

        function onKeydown(e) {
            if (e.key === 'Escape') closeModal();
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

    function mount() {
        var root = document.getElementById('bottom-nav-root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'bottom-nav-root';
            document.body.appendChild(root);
        }
        root.outerHTML = buildNavHTML() + buildModalHTML();
        loadIcons(document);
        setupMasModal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
