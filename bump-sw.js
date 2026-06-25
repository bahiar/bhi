/**
 * bump-sw.js
 * Incrementa el patch de CACHE_VERSION en sw.js.
 * Uso manual: node bump-sw.js
 * También es invocado por el GitHub Action .github/workflows/bump-sw.yml
 */

import { readFileSync, writeFileSync } from 'fs';

const SW_PATH = 'sw.js';

const content = readFileSync(SW_PATH, 'utf8');

const match = content.match(/const CACHE_VERSION\s*=\s*'v(\d+)\.(\d+)'/);
if (!match) {
    console.error('[bump-sw] No se encontró CACHE_VERSION en sw.js');
    process.exit(1);
}

const major = match[1];
const minor = parseInt(match[2], 10) + 1;
const newVersion = `v${major}.${minor}`;

const updated = content.replace(
    /const CACHE_VERSION\s*=\s*'v[\d.]+'/,
    `const CACHE_VERSION = '${newVersion}'`
);

writeFileSync(SW_PATH, updated, 'utf8');
console.log(`[bump-sw] CACHE_VERSION actualizada a ${newVersion}`);
