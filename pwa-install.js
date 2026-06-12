/**
 * BAHI.ar — Módulo de Instalación PWA
 * ─────────────────────────────────────
 * Flujo:
 *   1. En la primera visita desde móvil, captura beforeinstallprompt.
 *   2. Muestra el banner personalizado (#pwa-install-banner).
 *   3. Botón "Instalar" → ejecuta .prompt() y registra la respuesta.
 *   4. Botón "×" → guarda installDismissed en localStorage y oculta.
 *
 * localStorage keys:
 *   hasVisitedBefore  — se crea en la primera visita; impide reiniciar el flujo.
 *   installDismissed  — se crea si el usuario cierra sin instalar.
 *   installAccepted   — se crea si el usuario acepta la instalación.
 *
 * Compatibilidad: Chrome/Edge/Samsung Internet en Android.
 * Safari iOS no dispara beforeinstallprompt — el banner no aparece en iOS.
 */

'use strict';

(function () {

    // ── Constantes ────────────────────────────────────────────────────────────
    const LS_VISITED   = 'hasVisitedBefore';
    const LS_DISMISSED = 'installDismissed';
    const LS_ACCEPTED  = 'installAccepted';
    const BANNER_ID    = 'pwa-install-banner';

    // ── Estado ────────────────────────────────────────────────────────────────
    let deferredPrompt = null;  // Almacena el evento beforeinstallprompt

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Devuelve true si es la primera visita y el usuario no ha dismisseado ni aceptado */
    function debesMostrarBanner() {
        return (
            !localStorage.getItem(LS_DISMISSED) &&
            !localStorage.getItem(LS_ACCEPTED)
        );
    }

    function getBanner() {
        return document.getElementById(BANNER_ID);
    }

    function mostrarBanner() {
        const banner = getBanner();
        if (!banner) return;
        banner.classList.add('visible');
    }

    function ocultarBanner() {
        const banner = getBanner();
        if (!banner) return;
        banner.classList.remove('visible');
    }

    // ── 1. Marca primera visita ───────────────────────────────────────────────
    // Se crea la clave aunque el usuario no instale, para registrar que ya visitó.
    if (!localStorage.getItem(LS_VISITED)) {
        localStorage.setItem(LS_VISITED, '1');
    }

    // ── 2. Captura del evento beforeinstallprompt ─────────────────────────────
    /*
     * El evento se dispara antes de que el navegador muestre su mini-infobar.
     * preventDefault() lo suprime; guardamos el evento para dispararlo manualmente.
     * Solo capturamos si el usuario todavía no rechazó ni aceptó el banner.
     */
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();

        if (!debesMostrarBanner()) return;

        deferredPrompt = e;

        /*
         * Pequeño delay para no chocar con la animación de carga de la página.
         * 1500ms: suficiente para que el usuario vea el contenido primero.
         */
        setTimeout(mostrarBanner, 1500);
    });

    // ── 3. Botón "Instalar" ───────────────────────────────────────────────────
    document.addEventListener('click', async (e) => {
        if (!e.target.closest('#pwa-btn-install')) return;
        if (!deferredPrompt) return;

        // Muestra el diálogo nativo del navegador
        deferredPrompt.prompt();

        // Espera la decisión del usuario
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            localStorage.setItem(LS_ACCEPTED, '1');
        } else {
            // Rechazó el diálogo nativo → tratar como dismissed
            localStorage.setItem(LS_DISMISSED, '1');
        }

        // El evento solo puede usarse una vez
        deferredPrompt = null;
        ocultarBanner();
    });

    // ── 4. Botón "×" (dismiss) ────────────────────────────────────────────────
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#pwa-btn-dismiss')) return;

        localStorage.setItem(LS_DISMISSED, '1');
        deferredPrompt = null;
        ocultarBanner();
    });

    // ── 5. Evento appinstalled ────────────────────────────────────────────────
    /*
     * Se dispara cuando la instalación se completa (incluso si el usuario
     * la inició desde el menú del navegador, no desde nuestro banner).
     * Aprovechamos para limpiar y no mostrar el banner en futuras visitas.
     */
    window.addEventListener('appinstalled', () => {
        localStorage.setItem(LS_ACCEPTED, '1');
        deferredPrompt = null;
        ocultarBanner();
    });

}());
