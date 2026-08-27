# Armado de cards en farmacias.html — BAHI.ar

## Flujo general

1. **`pills-engine.js`** entra a la página, hace `fetch` de `data/bd_bahiar.json`
   y se queda solo con los registros donde `TIPO === "FARMACIA"`.
2. Si hay algún filtro (pill) activo — localidad, obra social, etc., definidos
   en **`pills-config.js`** — descarta los que no cumplen.
3. Por cada farmacia que pasa el filtro, `pills-engine.js` le pasa el dato a
   `window.crearCardHTML()`, función definida en **`app.js`**, que arma el
   bloque de HTML de la tarjeta: nombre, dirección, botones de Llamar /
   WhatsApp / Mapa, y el desplegable "Más información" (horario, obra
   social, stock, etc.).
4. Todas las tarjetas resultantes se insertan en `#contenedor-cards` dentro
   de `farmacias.html`.

**Resumen:** `pills-engine.js` trae y filtra los datos → `app.js` convierte
cada dato en una tarjeta visual → `pills-config.js` solo define qué filtros
se muestran arriba.

## Archivos que NO intervienen en el armado de la card

- **`bd_bahiar.json`** — participa como fuente de datos cruda, pero no arma nada.
- **`style2.css`** — solo da estilo visual (colores, tamaños), no construye el HTML.
- **`home-accordion.js`** — no se usa en `farmacias.html`. Es exclusivo del
  acordeón de categorías del index (home), página distinta.

## Caso especial: prestador con `NIVEL: "PREMIUM"`

Aplica únicamente cuando `TIPO: "FARMACIA"` **y** `NIVEL: "PREMIUM"`.

**Visual**
- Se arma con la clase `card--premium` (envuelta en `card--premium-wrap`)
  en vez de la card normal.
- Agrega una estrellita (★) junto al nombre, con label "Farmacia premium".

**Chips extra**
- Si `INYECTABLES` y/o `DELIVERY` están en `true`, se muestran chips
  visibles arriba de la card: "💉 Inyectables" y "🛵 Delivery".
- Estos chips **solo aparecen en farmacias premium** — en una farmacia
  normal esos datos no se muestran así, aunque el JSON los tenga cargados.

**Sección "Más información"**
- Card normal: horario / obra social / stock quedan ocultos detrás de un
  botón "Más información" que hay que tocar para desplegar.
- Card premium: esa misma info se muestra **siempre abierta**, sin botón
  ni click.
