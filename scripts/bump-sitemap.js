#!/usr/bin/env node
/**
 * bump-sitemap.js
 *
 * Actualiza automáticamente el <lastmod> de sitemap.xml, pero SOLO para
 * las páginas que realmente cambiaron en el push actual — no pisa la fecha
 * de páginas que no se tocaron.
 *
 * Uso (pensado para correr en GitHub Actions, ver bump-sitemap.yml):
 *   node scripts/bump-sitemap.js <archivo1.html> <archivo2.html> ...
 *
 * Si no se pasan argumentos, no modifica nada (evita bumps accidentales).
 */

const fs = require('fs');
const path = require('path');

const SITEMAP_PATH = path.join(process.cwd(), 'sitemap.xml');

// Mapea el nombre de archivo (tal como aparece en el diff de git) a la URL
// exacta que figura en <loc> dentro del sitemap.
function fileToLoc(file) {
  const base = path.basename(file).toLowerCase();
  if (base === 'index.html') return 'https://www.bahi.ar/';
  return `https://www.bahi.ar/${base}`;
}

// Fecha de hoy en America/Argentina/Buenos_Aires, formato YYYY-MM-DD
function todayAR() {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(new Date()); // en-CA ya da formato YYYY-MM-DD
}

function main() {
  const changedFiles = process.argv.slice(2)
    .filter(f => f.toLowerCase().endsWith('.html'));

  if (changedFiles.length === 0) {
    console.log('bump-sitemap: no hay archivos .html modificados, no se toca sitemap.xml');
    return;
  }

  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('bump-sitemap: no se encontró sitemap.xml en la raíz del repo');
    process.exit(1);
  }

  let xml = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const today = todayAR();
  const targetLocs = new Set(changedFiles.map(fileToLoc));

  let updatedCount = 0;
  const skipped = [];

  // Reemplaza el <lastmod> dentro de cada bloque <url>...</url> cuyo <loc>
  // coincida con una de las páginas modificadas.
  xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
    const locMatch = inner.match(/<loc>(.*?)<\/loc>/);
    if (!locMatch) return block;
    const loc = locMatch[1].trim();

    if (targetLocs.has(loc)) {
      targetLocs.delete(loc);
      updatedCount++;
      const newInner = inner.replace(
        /<lastmod>.*?<\/lastmod>/,
        `<lastmod>${today}</lastmod>`
      );
      return `<url>${newInner}</url>`;
    }
    return block;
  });

  // Lo que quede en targetLocs son archivos que cambiaron pero no tienen
  // entrada en el sitemap (por ejemplo, páginas nuevas todavía no agregadas).
  targetLocs.forEach(loc => skipped.push(loc));

  if (updatedCount > 0) {
    fs.writeFileSync(SITEMAP_PATH, xml, 'utf-8');
    console.log(`bump-sitemap: actualizado <lastmod> a ${today} en ${updatedCount} URL(s).`);
  } else {
    console.log('bump-sitemap: ninguna URL del sitemap coincidió con los archivos modificados.');
  }

  if (skipped.length > 0) {
    console.log('bump-sitemap: aviso — estos archivos cambiaron pero no están en sitemap.xml:');
    skipped.forEach(loc => console.log(`  - ${loc}`));
  }
}

main();
