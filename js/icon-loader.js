/**
 * icon-loader.js
 * Utilitario de alcance global: pinta cualquier elemento con
 * [data-icon-src="ruta/al/icono.svg"] en toda la página (badges de
 * categoría, watermarks de acordeón, watermarks de las service cards, etc).
 *
 * Se separó de bottom-nav-v2.js a propósito: el nav ya no usa este mecanismo
 * (sus íconos están inline en el propio JS desde el rediseño), pero el resto
 * de index.html (y cualquier otra página) sigue dependiendo de
 * [data-icon-src] para sus íconos e imágenes de fondo representativas.
 * Mezclar esto de nuevo en bottom-nav-v2.js le devolvería al componente de
 * nav una responsabilidad que no es suya.
 *
 * Incluir en cualquier página que tenga elementos [data-icon-src]:
 *   <script src="js/icon-loader.js" defer></script>
 * (no requiere ningún contenedor ni configuración adicional)
 *
 * Rendimiento:
 *  - Cachea por PROMESA (no solo por resultado ya resuelto). Si el mismo
 *    ícono aparece varias veces en el DOM (ej. medicine-9-svgrepo-com.svg
 *    en el badge + watermark del acordeón + watermark de la card), todas
 *    las apariciones comparten un único fetch() en curso, en vez de
 *    disparar uno por cada una.
 *  - defer + DOMContentLoaded: no bloquea el parseo/render inicial.
 */
(function () {
    'use strict';

    var iconPromiseCache = {}; // url -> Promise<string> (SVG ya procesado)

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

    function fetchIcon(url) {
        if (!iconPromiseCache[url]) {
            iconPromiseCache[url] = fetch(url)
                .then(function (res) { return res.ok ? res.text() : Promise.reject(); })
                .then(recolorSvg)
                .catch(function () {
                    console.warn('[icon-loader] No se pudo cargar el ícono:', url);
                    return null;
                });
        }
        return iconPromiseCache[url];
    }

    function applyIcon(placeholder, svgText) {
        if (!svgText) return;
        var wrapper = document.createElement('div');
        wrapper.innerHTML = svgText.trim();
        var svgEl = wrapper.querySelector('svg');
        if (!svgEl) return;
        svgEl.setAttribute('class', placeholder.getAttribute('class') || '');
        svgEl.setAttribute('aria-hidden', 'true');
        placeholder.replaceWith(svgEl);
    }

    function loadIcons(root) {
        var placeholders = (root || document).querySelectorAll('[data-icon-src]');
        placeholders.forEach(function (placeholder) {
            var url = placeholder.getAttribute('data-icon-src');
            fetchIcon(url).then(function (svgText) {
                applyIcon(placeholder, svgText);
            });
        });
    }

    // Expuesto por si algún script de la página necesita repintar íconos
    // agregados dinámicamente después de la carga inicial (ej. contenido
    // insertado vía innerHTML con nuevos [data-icon-src]).
    window.IconLoader = { loadIcons: loadIcons };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { loadIcons(document); });
    } else {
        loadIcons(document);
    }
})();
