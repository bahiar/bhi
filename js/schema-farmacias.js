"use strict";
/**
 * Genera e inyecta dinámicamente el JSON-LD (schema.org ItemList de Pharmacy)
 * para farmacias.html, a partir de los datos reales en data/bd_bahiar.json.
 *
 * Por qué dinámico y no estático:
 * - Los datos de farmacias cambian (turnos, altas, bajas) y ya se cargan por JS
 *   desde data/bd_bahiar.json (ver app.js / buscarGlobal). Generar el schema
 *   desde la misma fuente evita que el marcado quede desincronizado del
 *   contenido real, algo que Google penaliza en datos estructurados.
 * - Los nombres de campo (PRESTADOR, DOMICILIO, LOCALIDAD, FIJO, MOVIL, MAPS,
 *   HORARIO, HORARIO_TIPO, lat, lng) están tomados literal de crearCardHTML()
 *   en app.js, no inventados.
 */
(function () {
  const SCHEMA_ID = "bahi-schema-farmacias-dinamico";
  const MAX_ITEMS = 200; // límite razonable para no generar un documento excesivo

  function limpiarTelefonoParaSchema(raw) {
    if (!raw) return null;
    let t = String(raw).trim();
    t = t.replace(/^tel:/i, "");
    if (/^https?:\/\//i.test(t)) {
      const m = t.match(/(\d{6,})/);
      return m ? m[1] : null;
    }
    return t || null;
  }

  function prestadorAPharmacy(p) {
    const nombre = p && p.PRESTADOR;
    if (!nombre) return null;

    const pharmacy = {
      "@type": "Pharmacy",
      "name": nombre,
      "url": "https://www.bahi.ar/farmacias.html"
    };

    if (p.DOMICILIO) {
      pharmacy.address = {
        "@type": "PostalAddress",
        "streetAddress": p.DOMICILIO,
        "addressLocality": p.LOCALIDAD || "Bahía Blanca",
        "addressRegion": "Buenos Aires",
        "addressCountry": "AR"
      };
    }

    const tel = limpiarTelefonoParaSchema(p.FIJO) || limpiarTelefonoParaSchema(p.MOVIL);
    if (tel) pharmacy.telephone = tel;

    if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
      pharmacy.geo = {
        "@type": "GeoCoordinates",
        "latitude": p.lat,
        "longitude": p.lng
      };
    }

    if (p.MAPS && /^https?:\/\//i.test(p.MAPS)) {
      pharmacy.hasMap = p.MAPS;
    }

    if (p.HORARIO_TIPO === "24h") {
      pharmacy.openingHoursSpecification = {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      };
    } else if (p.HORARIO) {
      // Texto libre de horario habitual (no siempre parseable a formato ISO),
      // se deja como propiedad informativa simple.
      pharmacy.openingHours = p.HORARIO;
    }

    return pharmacy;
  }

  async function inyectarSchemaFarmacias() {
    try {
      if (document.getElementById(SCHEMA_ID)) return;

      const res = await fetch("data/bd_bahiar.json");
      if (!res.ok) return;
      const data = await res.json();
      const prestadores = Array.isArray(data.prestadores) ? data.prestadores : [];
      if (!prestadores.length) return;

      const items = prestadores
        .map(prestadorAPharmacy)
        .filter(Boolean)
        .slice(0, MAX_ITEMS)
        .map((pharmacy, i) => ({
          "@type": "ListItem",
          "position": i + 1,
          "item": pharmacy
        }));

      if (!items.length) return;

      const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Farmacias habilitadas en Bahía Blanca, Ingeniero White, Gral. Daniel Cerri y Cabildo",
        "itemListOrder": "https://schema.org/ItemListUnordered",
        "numberOfItems": items.length,
        "itemListElement": items
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = SCHEMA_ID;
      script.textContent = JSON.stringify(itemList);
      document.head.appendChild(script);
    } catch (e) {
      console.warn("[BAHI.ar] No se pudo generar el schema dinámico de farmacias:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inyectarSchemaFarmacias);
  } else {
    inyectarSchemaFarmacias();
  }
})();
