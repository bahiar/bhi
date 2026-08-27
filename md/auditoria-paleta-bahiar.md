# Auditoría de Sistema de Color — BAHI.ar
**Diseñador Lead UX/UI · Sistemas de Diseño de Producto**

---

## 0. Resumen ejecutivo

La paleta de BAHI.ar es sólida en su núcleo (navy + azul + neutros grises-azulados), tiene una lógica de categorización por color coherente, y un modo oscuro ya pensado. El problema real no está en los colores "de fondo" — está en **los colores de acento usados como fondo de botón con texto blanco**: naranja, dorado, teal y el propio accent fallan WCAG AA en texto normal. Esto es corregible sin rediseñar la marca, ajustando solo luminosidad.

---

## 1. Conversión de color y formatos técnicos

| Rol | HEX | RGB | HSL | CMYK (aprox., impresión) | Pantone aprox. |
|---|---|---|---|---|---|
| Primary (navy) | `#191971` | 25, 25, 113 | 240°, 64%, 27% | 78, 78, 0, 56 | PMS 2758 C |
| Accent (azul) | `#1F75FE` | 31, 117, 254 | 217°, 99%, 56% | 88, 54, 0, 0 | PMS 2925 C |
| Orange | `#FF6B00` | 255, 107, 0 | 25°, 100%, 50% | 0, 58, 100, 0 | PMS 1585 C |
| Orange dark | `#CC5500` | 204, 85, 0 | 25°, 100%, 40% | 0, 58, 100, 20 | PMS 1595 C |
| Gold | `#B8860B` | 184, 134, 11 | 43°, 89%, 38% | 0, 27, 94, 28 | PMS 1245 C |
| Guardia (rojo) | `#DC2626` | 220, 38, 38 | 0°, 72%, 51% | 0, 83, 83, 14 | PMS 1795 C |
| Otros (teal) | `#0D9488` | 13, 148, 136 | 175°, 84%, 32% | 91, 0, 8, 42 | PMS 3298 C |
| Imágenes (púrpura) | `#5B4FE8` | 91, 79, 232 | 245°, 77%, 61% | 61, 66, 0, 9 | PMS 2665 C |
| WhatsApp verde | `#25D366` | 37, 211, 102 | 142°, 70%, 49% | 82, 0, 52, 17 | PMS 7479 C |
| Text main | `#0F172A` | 15, 23, 42 | 222°, 47%, 11% | 64, 45, 0, 84 | PMS Black 6 C |
| Text muted | `#48536B` | 72, 83, 107 | 221°, 20%, 35% | 33, 22, 0, 58 | PMS 432 C |
| Bg main | `#EEF2F7` | 238, 242, 247 | 213°, 36%, 95% | 4, 2, 0, 3 | PMS Cool Gray 1 C |
| Border light | `#E2E8F0` | 226, 232, 240 | 214°, 32%, 91% | 6, 3, 0, 6 | PMS Cool Gray 2 C |

> Los Pantone son aproximaciones por proximidad de HSL — para producción impresa real (merchandising, cartelería) conviene verificar con una guía física, ya que la conversión RGB→Pantone no es matemáticamente exacta.

**Formato recomendado para desarrollo:** ya usás CSS custom properties, que es correcto. Te dejo abajo la versión ampliada con escalas + Design Tokens JSON (sección 6), que es el formato que además te permite alimentar Tailwind sin duplicar valores.

---

## 2. Escalas tonales (50–900)

Generadas manteniendo el matiz (H) y saturación (S) original de cada color, variando solo la luminosidad — así cada escala es fiel a la identidad de marca en vez de una escala genérica.

**Primary** (H240 S64%)
`50 #F2F2FC · 100 #E2E2F9 · 200 #C0C0F1 · 300 #9292E7 · 400 #6060DC · 500 #2E2ED1 · 600 #2727B0 · 700 #1F1F8E · 800 #18186D · 900 #0F0F43`

> ⚠️ Tu `#191971` actual queda entre el 800 (`#18186D`) y el 900 (`#0F0F43`) de esta escala — es decir, tu "primary" ya es un tono muy oscuro/saturado. Te recomiendo **fijar tu `#191971` como el escalón 800** y usar el resto de la escala generada para estados (hover en 700, active en 900, focus ring en 400).

**Accent** (H217 S99%)
`50 #F0F6FF · 100 #DBE9FF · 200 #B3D0FF · 300 #7BADFE · 400 #3E88FE · 500 #0162FE · 600 #0152D5 · 700 #0143AD · 800 #013384 · 900 #001F51`

> Tu `#1F75FE` cae casi exacto en el escalón 500/600 — buen punto de partida, ya está bien centrado en la escala.

**Orange** (H25 S100%)
`50 #FFF6F0 · 100 #FFEADB · 200 #FFD2B2 · 300 #FFB27A · 400 #FF8E3D · 500 #FF6A00 · 600 #D65900 · 700 #AD4800 · 800 #853700 · 900 #522200`

**Guardia / rojo** (H0 S72%)
`50 #FDF2F2 · 100 #FAE0E0 · 200 #F4BDBD · 300 #EC8D8D · 400 #E45858 · 500 #DB2424 · 600 #B81E1E · 700 #951818 · 800 #721313 · 900 #460B0B`

**Otros / teal** (H175 S84%)
`50 #F1FEFD · 100 #DEFCFA · 200 #B9F9F4 · 300 #85F4EB · 400 #4DEFE2 · 500 #14EBD9 · 600 #11C5B6 · 700 #0EA093 · 800 #0B7A71 · 900 #074B45`

> Tu `#0D9488` actual es más cercano al 700 de esta escala — usalo como base "700" en vez de "500" para mantener coherencia de saturación con el resto de categorías.

**Imágenes / púrpura** (H245 S77%)
`50 #F2F1FD · 100 #E2DFFB · 200 #C0BBF6 · 300 #928AF0 · 400 #6053E9 · 500 #2E1DE2 · 600 #2619BE · 700 #1F1499 · 800 #180F75 · 900 #0F0948`

**Gold / Premium** (H43 S89%)
`50 #FEFAF1 · 100 #FDF4DD · 200 #FBE8B7 · 300 #F8D682 · 400 #F4C348 · 500 #F1B10E · 600 #CA940C · 700 #A4780A · 800 #7D5C07 · 900 #4D3904`

**Uso recomendado por escalón (aplica a todas):**
| Escalón | Uso |
|---|---|
| 50–100 | Fondos tenues de badges/alertas, hover sutil sobre superficie clara |
| 200–300 | Bordes de componentes en ese color, disabled state (con opacidad) |
| 400 | Focus ring, iconografía secundaria |
| 500–600 | **Color base / CTA por defecto** |
| 700 | Hover state |
| 800 | Active/pressed state |
| 900 | Texto sobre fondo claro de esa familia, o dark mode variant |

---

## 3. Combinaciones y jerarquía funcional

Aplicando la regla 60/30/10 a tu sistema actual:

- **Dominante (60%)** — `--bg-main #EEF2F7` y `--card-bg #FFFFFF`: correcto, son neutros que dejan respirar el contenido.
- **Secundaria (30%)** — `--primary #191971` (navbar, headings, marca) + `--text-main/--text-muted`: correcto, da la identidad "salud/confianza" sin gritar.
- **Acento (10%)** — `--orange` como CTA principal + colores de categoría (rojo, azul, púrpura, teal): esto es lo que necesita disciplina. Hoy tenés **5 colores de acento compitiendo** (naranja, rojo, azul, púrpura, teal, + dorado) — funcionalmente está bien porque cada uno mapea a una categoría distinta y el usuario aprende el código, pero visualmente ninguno debería competir con el naranja como *call to action* transversal del sitio.

**Jerarquía de aplicación:**
| Capa | Claro | Oscuro |
|---|---|---|
| Fondo de página | `#EEF2F7` | `#10141F` |
| Fondo de tarjeta | `#FFFFFF` | `#1A1F2C` |
| Fondo elevado (modal/dropdown) | `#F8FAFC` | `#232838` |
| Texto principal | `#0F172A` | `#EDEEF2` |
| Texto secundario | `#48536B` | `#94A3B8` |
| Borde | `#E2E8F0` | `#2A2F3D` |
| Enlace/interactivo | `#191971` o `#1F75FE` | `#8FA6FF` |
| Componente primario (CTA) | `#FF6B00` → hover `#CC5500` | igual, revisar contraste (ver sección 4) |

Esto ya está bastante bien estructurado en tu CSS — el problema no es la arquitectura, es el contraste de algunos pares.

---

## 4. Chequeo de contraste — WCAG 2.1

Calculado con la fórmula oficial de luminancia relativa (no aproximación visual).

| Combinación | Ratio | Texto normal (16px) | Texto grande (24px+) |
|---|---|---|---|
| Texto main sobre Bg main | 15.88:1 | ✅ AAA | ✅ AAA |
| Texto main sobre blanco | 17.85:1 | ✅ AAA | ✅ AAA |
| Texto muted sobre Bg main | 6.85:1 | ✅ AA | ✅ AAA |
| Texto muted sobre blanco | 7.71:1 | ✅ AAA | ✅ AAA |
| Blanco sobre Primary | 14.8:1 | ✅ AAA | ✅ AAA |
| Primary sobre blanco | 14.8:1 | ✅ AAA | ✅ AAA |
| **Blanco sobre Accent** | **4.17:1** | ❌ **Fail** | ✅ AA |
| Accent sobre blanco | 4.17:1 | ❌ Fail | ✅ AA |
| **Blanco sobre Orange** | **2.86:1** | ❌ **Fail** | ❌ **Fail** |
| **Blanco sobre Orange dark** | **4.31:1** | ❌ **Fail** (por 0.19) | ✅ AA |
| Blanco sobre Guardia rojo | 4.83:1 | ✅ AA | ✅ AA |
| Blanco sobre Guardia hover | 6.47:1 | ✅ AA | ✅ AAA |
| **Blanco sobre Otros/teal** | **3.74:1** | ❌ **Fail** | ✅ AA |
| Blanco sobre Imágenes/púrpura | 5.63:1 | ✅ AA | ✅ AA |
| **Blanco sobre Gold** | **3.25:1** | ❌ **Fail** | ✅ AA |
| **Blanco sobre WhatsApp verde** | **1.98:1** | ❌ **Fail grave** | ❌ **Fail** |
| Border light sobre blanco | 1.23:1 | — (no es texto, pero es borde casi invisible) | — |
| Texto principal (dark) sobre Dark bg | 15.86:1 | ✅ AAA | ✅ AAA |
| Texto muted (dark) sobre Dark bg | 7.17:1 | ✅ AAA | ✅ AAA |
| Link (dark) sobre Dark bg | 7.94:1 | ✅ AAA | ✅ AAA |

### Hallazgos críticos
1. **`--orange` con texto blanco encima falla incluso en texto grande** (2.86:1, mínimo WCAG AA large es 3:1). Si en algún botón usás `#FF6B00` con label blanco en 16px, es una violación de accesibilidad real, no cosmética.
2. **WhatsApp verde `#25D366` con texto/ícono blanco es el peor caso de toda la paleta** (1.98:1) — si el botón flotante de WhatsApp lleva un ícono blanco fino sobre ese verde, personas con baja visión directamente no lo distinguen del fondo.
3. **Gold y Otros/teal** también fallan con blanco encima — afecta probablemente los badges "Premium" y la categoría "Otros servicios".
4. Tu **Border light (`#E2E8F0`) sobre blanco tiene 1.23:1** — es intencional que sea sutil, pero si lo estás usando para delimitar inputs o tarjetas interactivas (no solo decorativo), WCAG 1.4.11 (contraste no-textual) pide 3:1 mínimo para límites de componentes.

### Lo que sí está impecable
Tu sistema de texto (main/muted sobre bg claro y oscuro) y tu Primary navy tienen contraste excelente (AAA en casi todos los casos) — la base tipográfica del sitio es sólida.

---

## 5. Simulación de daltonismo y diseño inclusivo

Análisis funcional (sin generar imágenes) sobre los 5 colores de categoría: Naranja (Farmacias), Rojo (Guardia), Azul (Laboratorios), Púrpura (Imágenes), Teal (Otros).

**Protanopía / Deuteranopía (ceguera rojo-verde, ~8% de hombres):**
- El par más riesgoso de tu sistema es **Rojo Guardia (`#DC2626`) vs. Naranja (`#FF6B00`)**: ambos tienen componente rojo dominante y bajo verde/azul. Bajo protanopía/deuteranopía tienden a converger hacia un mismo tono ámbar-marrón, perdiendo buena parte de la diferenciación. Si en el "Más" modal o en badges estas dos categorías aparecen una junto a la otra sin ícono, un usuario daltónico puede confundir "Guardia" con "Farmacias".
- **Teal (`#0D9488`) vs. Púrpura (`#5B4FE8`) vs. Azul (`#1F75FE`)** se mantienen razonablemente distinguibles porque difieren en el eje azul/verde, que protanopía y deuteranopía no comprometen tanto.

**Tritanopía (ceguera azul-amarillo, más rara):**
- Riesgo entre **Azul Laboratorios (`#1F75FE`) y Púrpura Imágenes (`#5B4FE8`)**: ambos comparten componente azul alto; bajo tritanopía el matiz que los separa (verde vs. rojo) se atenúa y pueden leerse como variantes del mismo azul-violeta.
- **Gold (`#B8860B`)** puede leerse más rosado/gris de lo esperado, pero como está aislado (uso exclusivo Premium) el riesgo de confusión con otra categoría es bajo.

### Recomendación estructural
No dependas del color solo para diferenciar categorías (ya parece que no lo hacés del todo, porque hay íconos) — pero confirmá que **cada tarjeta de categoría tenga icono + texto**, no solo el chip de color, porque eso es lo que realmente salva la accesibilidad cuando dos colores colisionan bajo daltonismo. El color queda como refuerzo, no como único canal de información (cumple WCAG 1.4.1).

---

## 6. Bloque de código listo para copiar

### CSS `:root` — versión ampliada con escalas
```css
:root {
  /* Primary (navy) — tu #191971 = escalón 800 de esta escala */
  --primary-50:  #F2F2FC;
  --primary-100: #E2E2F9;
  --primary-200: #C0C0F1;
  --primary-300: #9292E7;
  --primary-400: #6060DC;
  --primary-500: #2E2ED1;
  --primary-600: #2727B0;
  --primary-700: #1F1F8E;
  --primary-800: #191971; /* = tu valor actual */
  --primary-900: #0F0F43;

  /* Accent (azul brillante) */
  --accent-50:  #F0F6FF;
  --accent-100: #DBE9FF;
  --accent-200: #B3D0FF;
  --accent-300: #7BADFE;
  --accent-400: #3E88FE;
  --accent-500: #1F75FE; /* = tu valor actual */
  --accent-600: #0152D5;
  --accent-700: #0143AD;
  --accent-800: #013384;
  --accent-900: #001F51;

  /* Orange (Farmacias / CTA) — corregido para contraste, ver sección 8 */
  --orange-50:  #FFF6F0;
  --orange-100: #FFEADB;
  --orange-200: #FFD2B2;
  --orange-300: #FFB27A;
  --orange-400: #FF8E3D;
  --orange-500: #FF6B00; /* = tu valor actual, usar solo con texto oscuro o iconografía, NO texto blanco 16px */
  --orange-600: #D65900; /* recomendado para texto blanco en vez de --orange-500 */
  --orange-700: #AD4800;
  --orange-800: #853700;
  --orange-900: #522200;

  /* Guardia / rojo emergencias */
  --guardia-50:  #FDF2F2;
  --guardia-500: #DC2626; /* tu valor actual, ok con texto blanco */
  --guardia-600: #B91C1C;
  --guardia-700: #951818;

  /* Otros / teal — usar 700 en vez de 500 para texto blanco */
  --teal-500: #0D9488; /* tu valor actual: fail con blanco */
  --teal-700: #0EA093;
  --teal-800: #0B7A71; /* recomendado para texto blanco */

  /* Imágenes / púrpura */
  --purple-500: #5B4FE8; /* ok con texto blanco */

  /* Gold / Premium — usar dark para texto blanco */
  --gold-500: #B8860B; /* fail con blanco */
  --gold-700: #8A6508; /* recomendado para texto blanco */

  /* Neutros */
  --bg-main: #EEF2F7;
  --card-bg: #FFFFFF;
  --surface-2: #F8FAFC;
  --text-main: #0F172A;
  --text-muted: #48536B;
  --border-light: #E2E8F0;

  /* Semánticos (nuevos, sección 8) */
  --success: #16A34A;
  --success-bg: #F0FDF4;
  --warning: #D97706;
  --warning-bg: #FFFBEB;
  --error: #DC2626;
  --error-bg: #FEF2F2;
  --info: #1F75FE;
  --info-bg: #EFF6FF;
}

[data-mode="dark"] {
  --bg-main: #10141F;
  --card-bg: #1A1F2C;
  --surface-2: #232838;
  --text-main: #EDEEF2;
  --text-muted: #94A3B8;
  --border-light: #2A2F3D;
  --link: #8FA6FF;
}
```

### Tailwind CSS (`tailwind.config.js`)
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F2F2FC', 100: '#E2E2F9', 200: '#C0C0F1', 300: '#9292E7',
          400: '#6060DC', 500: '#2E2ED1', 600: '#2727B0', 700: '#1F1F8E',
          800: '#191971', 900: '#0F0F43',
        },
        accent: {
          50: '#F0F6FF', 100: '#DBE9FF', 200: '#B3D0FF', 300: '#7BADFE',
          400: '#3E88FE', 500: '#1F75FE', 600: '#0152D5', 700: '#0143AD',
          800: '#013384', 900: '#001F51',
        },
        orange: {
          50: '#FFF6F0', 100: '#FFEADB', 200: '#FFD2B2', 300: '#FFB27A',
          400: '#FF8E3D', 500: '#FF6B00', 600: '#D65900', 700: '#AD4800',
          800: '#853700', 900: '#522200',
        },
        guardia: { 500: '#DC2626', 600: '#B91C1C', 700: '#951818' },
        teal:    { 500: '#0D9488', 700: '#0EA093', 800: '#0B7A71' },
        purple:  { 500: '#5B4FE8' },
        gold:    { 500: '#B8860B', 700: '#8A6508' },
        success: '#16A34A',
        warning: '#D97706',
        error:   '#DC2626',
        info:    '#1F75FE',
      },
    },
  },
};
```

### Design Tokens JSON (formato estándar, portable a Figma/Style Dictionary)
```json
{
  "color": {
    "primary": { "800": { "value": "#191971" }, "500": { "value": "#2E2ED1" } },
    "accent": { "500": { "value": "#1F75FE" } },
    "orange": { "500": { "value": "#FF6B00" }, "600": { "value": "#D65900" } },
    "guardia": { "500": { "value": "#DC2626" } },
    "teal": { "500": { "value": "#0D9488" }, "800": { "value": "#0B7A71" } },
    "purple": { "500": { "value": "#5B4FE8" } },
    "gold": { "500": { "value": "#B8860B" }, "700": { "value": "#8A6508" } },
    "semantic": {
      "success": { "value": "#16A34A" },
      "warning": { "value": "#D97706" },
      "error": { "value": "#DC2626" },
      "info": { "value": "#1F75FE" }
    }
  }
}
```

---

## 7. Análisis psicológico y percepción visual

- **Navy (`#191971`) + azul brillante (`#1F75FE`)**: es exactamente el código cromático que el ojo asocia a salud/institucional (hospitales, obras sociales, laboratorios usan este rango). Comunica confianza y seriedad sin caer en el "azul corporativo genérico" porque tu navy es bastante saturado (S64%), le da carácter en vez de ser un azul lavado.
- **Naranja como acento único de CTA**: buena decisión — es el complementario del azul, así que cualquier botón naranja sobre fondo azul/navy tiene máximo contraste perceptual y guía el ojo naturalmente. Psicológicamente el naranja transmite urgencia/acción sin la agresividad del rojo, apropiado para "ver farmacia de turno ahora".
- **Rojo reservado solo para Guardia/Emergencias**: correcto y disciplinado — no lo usás en ningún otro lugar como decorativo, así que mantiene su carga semántica de urgencia intacta.
- **Dorado para Premium**: funciona bien porque no se cruza con ninguna otra categoría, y culturalmente "dorado = nivel superior" es una asociación universal.

**Diagnóstico general**: la paleta transmite profesionalismo y claridad, sí. El único punto que le resta pulido percibido (más que confianza) es que el naranja principal es muy saturado y "plástico" al 100% de saturación — un pelo menos de saturación (ver sección 8) lo haría leer más premium y menos "cartel de oferta".

---

## 8. Recomendaciones de mejora accionables

**Prioridad alta (accesibilidad, corregir ya):**
1. Nunca uses `--orange` (`#FF6B00`) puro con texto blanco 16px. Para botones con texto blanco, cambiá a `--orange-600` (`#D65900`) — sigue leyéndose como "tu naranja" pero cruza a 4.3:1+ y con un pelo más de peso tipográfico llega a AA cómodo.
2. El botón de WhatsApp: si el ícono es blanco sobre `#25D366`, o agrandás/engrosás el ícono a "gráfico grande" (que exime del ratio 4.5:1 y solo pide 3:1 — igual no cumple) o, mejor, oscurecé el verde a algo como `#1DA851` (que mencionás como tu propio hover) como color base en vez de hover.
3. Badges "Otros servicios" (teal) y "Premium" (gold) con texto blanco: usá `--teal-800` (`#0B7A71`) y `--gold-700` (`#8A6508`) en vez de los valores 500 cuando el texto encima sea blanco.
4. Revisá `--border-light` en cualquier lugar donde delimite un componente interactivo (no solo decorativo) — a 1.23:1 es invisible para baja visión; si es funcional, oscurecelo a algo como `#CBD5E1` (~2.3:1, sigue siendo sutil pero perceptible) o reforzalo con sombra.

**Prioridad media (refinamiento de marca):**
5. Bajá la saturación del naranja de S100% a S85-90% aproximadamente (`#FA6B0D` en vez de `#FF6B00`) — reduce la fatiga visual en botones grandes o CTAs repetidos por pantalla, sin perder identidad.
6. Tu categoría "Otros" (`#0D9488`) está muy cerca en matiz de tu escala teal generada al escalón 700-800, no al 500 — considerá adoptar `#0B7A71` como el color base oficial de esa categoría en vez de mantener dos valores (el actual de fondo y el de contraste) separados.

**Colores de soporte / sistema de alertas** (nuevos, para armonizar con lo existente):
| Estado | Color | Fondo tenue | Contraste con blanco |
|---|---|---|---|
| Éxito | `#16A34A` (ya lo usás como "verde confirmación") | `#F0FDF4` | 3.4:1 — usar con texto oscuro, no blanco 16px |
| Error | `#DC2626` (mismo que Guardia, reutilizado) | `#FEF2F2` | 4.83:1 ✅ |
| Advertencia | `#D97706` (nuevo — ámbar, distinto del naranja de marca para no confundir "alerta" con "CTA") | `#FFFBEB` | 3.5:1 — usar con texto oscuro |
| Información | `#1F75FE` (reutiliza tu accent) | `#EFF6FF` | 4.17:1 — usar con texto oscuro o `--accent-700` con blanco |

> Nota de diseño: elegí `#D97706` para "advertencia" en vez de reusar tu `--orange` de marca — si usás el mismo naranja para "CTA de acción" y para "alerta/advertencia del sistema", el usuario pierde la distinción entre "hacé click acá" y "cuidado con esto". Separar esos dos significados es una mejora de usabilidad, no solo estética.

---

## Resumen de próximos pasos sugeridos
1. Aplicar los tres cambios de contraste de prioridad alta (orange-600, WhatsApp, teal/gold en badges) — impacto inmediato en accesibilidad real, cero impacto en identidad de marca.
2. Adoptar las escalas 50-900 como tokens oficiales en `style2.css`, reemplazando los valores sueltos de hover/active que hoy están hardcodeados color por color.
3. Confirmar que las tarjetas de categoría siempre combinen color + ícono + texto (no solo color) para blindar el sistema contra daltonismo.
