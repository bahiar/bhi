/**
 * BAHI.ar — Configuración centralizada de PILLS (filtros por chip)
 * ─────────────────────────────────────────────────────────────────
 * Esta es la ÚNICA fuente de verdad sobre qué filtros (pills) se
 * generan en cada página. Para prender o apagar un pill, tocá
 * únicamente el campo `activo` (true = SI, false = NO). No hace
 * falta tocar el HTML ni el script de cada página.
 *
 * Estructura de cada entrada de `pills`:
 *   campo     -> nombre exacto de la columna en el JSON de origen
 *   tipoPill  -> 'select'  = desplegable con valores únicos (ej. Localidad, Obra Social)
 *                'boolean' = chip on/off (ej. Inyectables, Delivery, Stock)
 *   activo    -> true (SI) / false (NO) — si se renderiza o no el pill
 *   label     -> texto visible del chip/desplegable
 *
 * IMPORTANTE: cargar este archivo ANTES que app.js y antes que el
 * script de cada página, ej:
 *   <script src="pills-config.js" defer></script>
 *   <script src="app.js" defer></script>
 */

'use strict';

window.PILLS_CONFIG = {

  // ─────────────────────────────────────────────────────────────
  farmacias: {
    fuente: 'data/bd_bahiar.json',
    tipo: 'FARMACIA',   // filtra el array `prestadores` por item.TIPO
    pills: [
      { campo: 'LOCALIDAD',   tipoPill: 'select',  activo: true,  label: 'Localidad' },
      { campo: 'STOCK',       tipoPill: 'boolean', activo: false,  label: '¿Tienen...?' },
      { campo: 'INYECTABLES', tipoPill: 'boolean', activo: false,  label: 'Inyectables' },
      { campo: 'DELIVERY',    tipoPill: 'boolean', activo: false,  label: 'Cadete' },
      { campo: 'OOSS',        tipoPill: 'select',  activo: false,  multivalor: true, label: 'Obra Social' },
      { campo: 'RX',          tipoPill: 'boolean', activo: false, label: 'RX' },
      { campo: 'ECO',         tipoPill: 'boolean', activo: false, label: 'ECO' },
      { campo: 'DMO',         tipoPill: 'boolean', activo: false, label: 'DMO' },
      { campo: 'MAMO',        tipoPill: 'boolean', activo: false, label: 'MAMO' },
      { campo: 'DENT',        tipoPill: 'boolean', activo: false, label: 'DENT' },
      { campo: 'PET',         tipoPill: 'boolean', activo: false, label: 'PET' },
      { campo: 'GAMMA',       tipoPill: 'boolean', activo: false, label: 'GAMMA' },
      { campo: 'TAC',         tipoPill: 'boolean', activo: false, label: 'TAC' },
      { campo: 'RMN',         tipoPill: 'boolean', activo: false, label: 'RMN' },
      { campo: 'DOPPLER',     tipoPill: 'boolean', activo: false, label: 'DOPPLER' },
    ]
  },

  // ─────────────────────────────────────────────────────────────
  laboratorios: {
    fuente: 'data/bd_bahiar.json',
    tipo: 'LABORATORIO',
    pills: [
      { campo: 'LOCALIDAD',   tipoPill: 'select',  activo: true,  label: 'Localidad' },
      { campo: 'STOCK',       tipoPill: 'boolean', activo: false, label: '¿Tienen...?' },
      { campo: 'INYECTABLES', tipoPill: 'boolean', activo: false,  label: 'Inyectables' },
      { campo: 'DELIVERY',    tipoPill: 'boolean', activo: false,  label: 'Domicilio' },
      { campo: 'OOSS',        tipoPill: 'select',  activo: false,  multivalor: false, label: 'Obra Social' },
      { campo: 'RX',          tipoPill: 'boolean', activo: false, label: 'RX' },
      { campo: 'ECO',         tipoPill: 'boolean', activo: false, label: 'ECO' },
      { campo: 'DMO',         tipoPill: 'boolean', activo: false, label: 'DMO' },
      { campo: 'MAMO',        tipoPill: 'boolean', activo: false, label: 'MAMO' },
      { campo: 'DENT',        tipoPill: 'boolean', activo: false, label: 'DENT' },
      { campo: 'PET',         tipoPill: 'boolean', activo: false, label: 'PET' },
      { campo: 'GAMMA',       tipoPill: 'boolean', activo: false, label: 'GAMMA' },
      { campo: 'TAC',         tipoPill: 'boolean', activo: false, label: 'TAC' },
      { campo: 'RMN',         tipoPill: 'boolean', activo: false, label: 'RMN' },
      { campo: 'DOPPLER',     tipoPill: 'boolean', activo: false, label: 'DOPPLER' },
    ]
  },

  // ─────────────────────────────────────────────────────────────
  kinesiologia: {
    fuente: 'data/kft.json',
    tipo: 'KINESIOLOGIA',
    pills: [
      { campo: 'LOCALIDAD',   tipoPill: 'select',  activo: true,  label: 'Localidad' },
      { campo: 'DELIVERY',    tipoPill: 'boolean', activo: true,  label: 'Atención a domicilio' },
      { campo: 'GRUPO',       tipoPill: 'select',  activo: false, label: 'Grupo' },
      { campo: 'NIVEL',       tipoPill: 'select',  activo: false, label: 'Nivel' },
      { campo: 'OOSS',        tipoPill: 'select',  activo: false, multivalor: false, label: 'Obra Social' },
    ]
  },

  // ─────────────────────────────────────────────────────────────
  opticas: {
    fuente: 'data/opticas.json',
    tipo: 'OPTICA',
    pills: [
      { campo: 'LOCALIDAD',   tipoPill: 'select',  activo: true,  label: 'Localidad' },
      { campo: 'DELIVERY',    tipoPill: 'boolean', activo: false, label: 'Delivery' },
      { campo: 'GRUPO',       tipoPill: 'select',  activo: false, label: 'Grupo' },
      { campo: 'NIVEL',       tipoPill: 'select',  activo: false, label: 'Nivel' },
      { campo: 'OOSS',        tipoPill: 'select',  activo: false, multivalor: false, label: 'Obra Social' },
    ]
  },

  // ─────────────────────────────────────────────────────────────
  ortopedia: {
    fuente: 'data/ortopedia.json',
    tipo: 'ORTOPEDIA',
    pills: [
      { campo: 'LOCALIDAD',   tipoPill: 'select',  activo: true,  label: 'Localidad' },
      { campo: 'STOCK',       tipoPill: 'boolean', activo: false,  label: 'Con stock detallado' },
      { campo: 'INYECTABLES', tipoPill: 'boolean', activo: false, label: 'Inyectables' },
      { campo: 'DELIVERY',    tipoPill: 'boolean', activo: false, label: 'Delivery' },
      { campo: 'OOSS',        tipoPill: 'select',  activo: false, label: 'Obra Social' },
      { campo: 'RX',          tipoPill: 'boolean', activo: false, label: 'RX' },
      { campo: 'ECO',         tipoPill: 'boolean', activo: false, label: 'ECO' },
      { campo: 'DMO',         tipoPill: 'boolean', activo: false, label: 'DMO' },
      { campo: 'MAMO',        tipoPill: 'boolean', activo: false, label: 'MAMO' },
      { campo: 'DENT',        tipoPill: 'boolean', activo: false, label: 'DENT' },
      { campo: 'PET',         tipoPill: 'boolean', activo: false, label: 'PET' },
      { campo: 'GAMMA',       tipoPill: 'boolean', activo: false, label: 'GAMMA' },
      { campo: 'TAC',         tipoPill: 'boolean', activo: false, label: 'TAC' },
      { campo: 'RMN',         tipoPill: 'boolean', activo: false, label: 'RMN' },
      { campo: 'DOPPLER',     tipoPill: 'boolean', activo: false, label: 'DOPPLER' },
    ]
  },

  // ─────────────────────────────────────────────────────────────
  imagenes: {
    fuente: 'data/RX_bahiar.json',
    tipo: 'RADIOLOGIA',
    pills: [
      { campo: 'LOCALIDAD', tipoPill: 'select', activo: true, label: 'Localidad' },
      // tipoPill 'campo-dinamico': un único <select> cuyas OPCIONES son nombres
      // de campo del JSON (no valores de datos). Al elegir una opción, se filtra
      // por item[opcion] === true. Así funciona hoy en vivo el selector "Servicio".
      {
        campo: 'SERVICIO',
        tipoPill: 'campo-dinamico',
        activo: true,
        label: 'Práctica',
        opciones: [
          { valor: 'RX',   label: 'Radiografías' },
          { valor: 'ECO',  label: 'Ecografías' },
          { valor: 'TAC',  label: 'Tomografías (TAC)' },
          { valor: 'RMN',  label: 'Resonancias (RMN)' },
          { valor: 'MAMO', label: 'Mamografías' },
          { valor: 'DMO',  label: 'Densitometrías' },
          { valor: 'DENT', label: 'Estudios dentales' },
        ]
      },
    ]
  },

};
