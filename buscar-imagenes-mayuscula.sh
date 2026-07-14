#!/bin/bash
# Busca todas las referencias a "Imagenes.html" con mayúscula inicial
# dentro del repo, para detectar links internos que apunten a la versión rota.
#
# Uso: parado en la raíz del repo (donde está index.html), correr:
#   bash buscar-imagenes-mayuscula.sh

echo "=== 1) Archivos que contienen la palabra 'Imagenes.html' (con mayúscula) ==="
grep -rn "Imagenes\.html" --include="*.html" --include="*.js" --include="*.json" --include="*.xml" --include="*.txt" .

echo ""
echo "=== 2) Archivos físicos en el repo cuyo NOMBRE empieza con mayúscula ==="
find . -iname "imagenes.html"

echo ""
echo "=== 3) Diferencia entre mayúscula y minúscula en el propio git (case-sensitive) ==="
git ls-files | grep -i "imagenes.html"
