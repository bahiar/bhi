# BAHI.ar — Paleta de colores y fuentes

## Colores principales

| Uso | HEX |
|---|---|
| Primario (azul marino) | `#191971` |
| Accent (azul brillante) | `#1F75FE` |
| Fondo principal | `#EEF2F7` |
| Fondo de tarjetas | `#FFFFFF` |
| Texto principal | `#0F172A` |
| Texto atenuado (muted) | `#48536B` |
| Borde claro | `#E2E8F0` |
| Superficie secundaria | `#F8FAFC` |

## Naranja (marca / acento)

| Uso | HEX |
|---|---|
| Naranja | `#FF6B00` |
| Naranja oscuro | `#CC5500` |
| Naranja botón (bg) | `#B84D00` |
| Naranja botón hover | `#963E00` |

## Categorías

| Categoría | HEX |
|---|---|
| Guardia (rojo) | `#DC2626` |
| Guardia hover | `#B91C1C` |
| Guardia active | `#991B1B` |
| Otros (teal) | `#0D9488` |
| Laboratorio | usa `--accent` (`#1F75FE`) |
| Farmacia | usa `--orange` (`#FF6B00`) |

## Dorado (texto de marca)

| Uso | HEX |
|---|---|
| Gold | `#B8860B` |
| Gold dark | `#8A6508` |

## Otros

| Uso | HEX |
|---|---|
| WhatsApp verde | `#25D366` |
| WhatsApp hover | `#1DA851` |

---

## Fuentes

**Font base** (texto general):
```
system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif
```

**Font brand** (marca / headings):
```
Roboto, 'varela_roundregular', var(--font-base)
```

- `varela_roundregular` es una fuente custom cargada vía `@font-face` desde:
  - `/bhi/assets/fonts/varelaround-regular-webfont.woff2`
  - `/bhi/assets/fonts/varelaround-regular-webfont.woff` (fallback)
