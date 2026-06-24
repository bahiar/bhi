"""
geocodificar_bd.py
==================
Agrega lat/lng a cada prestador de bd_bahiar.json usando Nominatim (OSM).

Uso:
    python geocodificar_bd.py

Requisitos:
    pip install requests

El script es seguro para correr múltiples veces:
- Saltea los prestadores que ya tienen lat/lng
- Guarda el progreso cada 10 registros (si se interrumpe, retomá desde donde quedó)
- Genera bd_bahiar_geo.json como salida (no pisa el original)
"""

import json
import time
import requests

ENTRADA  = 'bd_bahiar.json'
SALIDA   = 'bd_bahiar_geo.json'
DELAY    = 1.1   # Nominatim pide máximo 1 req/seg
TIMEOUT  = 8

HEADERS = {
    'User-Agent': 'BAHIar-geocoder/1.0 (contacto@bahi.ar)',
    'Accept-Language': 'es',
}

def geocodificar(domicilio: str, localidad: str) -> dict | None:
    query = f"{domicilio}, {localidad}, Buenos Aires, Argentina"
    try:
        r = requests.get(
            'https://nominatim.openstreetmap.org/search',
            params={'q': query, 'format': 'json', 'limit': 1, 'countrycodes': 'ar'},
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        r.raise_for_status()
        results = r.json()
        if results:
            return {'lat': float(results[0]['lat']), 'lng': float(results[0]['lon'])}
    except Exception as e:
        print(f"    ⚠ Error: {e}")
    return None


def guardar(data: dict) -> None:
    with open(SALIDA, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    with open(ENTRADA, encoding='utf-8') as f:
        data = json.load(f)

    prestadores = data.get('prestadores', [])
    total = len(prestadores)

    ya_tienen   = sum(1 for p in prestadores if p.get('lat') and p.get('lng'))
    sin_coords  = total - ya_tienen

    print(f"BD: {total} prestadores  |  {ya_tienen} ya con coords  |  {sin_coords} a geocodificar")
    if sin_coords == 0:
        print("Todos los prestadores ya tienen coordenadas. Nada que hacer.")
        guardar(data)
        return

    tiempo_est = sin_coords * DELAY
    print(f"Tiempo estimado: ~{int(tiempo_est // 60)}m {int(tiempo_est % 60)}s\n")

    ok = 0
    fallidos = []

    for i, p in enumerate(prestadores):
        if p.get('lat') and p.get('lng'):
            continue  # ya geocodificado

        domicilio = p.get('DOMICILIO', '').strip()
        localidad = p.get('LOCALIDAD', 'Bahia Blanca').strip()

        print(f"[{i+1:>3}/{total}] {p.get('ID','?'):>8}  {domicilio}, {localidad} ...", end=' ', flush=True)

        coords = geocodificar(domicilio, localidad)

        if coords:
            p['lat'] = coords['lat']
            p['lng'] = coords['lng']
            ok += 1
            print(f"✓  ({coords['lat']:.5f}, {coords['lng']:.5f})")
        else:
            fallidos.append(p.get('ID'))
            print("✗  sin resultado")

        time.sleep(DELAY)

        # Guardar progreso cada 10 registros
        if (ok + len(fallidos)) % 10 == 0:
            guardar(data)

    # Guardar resultado final
    guardar(data)

    print(f"\n{'='*55}")
    print(f"Geocodificados: {ok}")
    print(f"Fallidos:       {len(fallidos)}")
    print(f"Archivo salida: {SALIDA}")

    if fallidos:
        print(f"\nIDs sin coordenadas ({len(fallidos)}):")
        for fid in fallidos:
            p = next((x for x in prestadores if x.get('ID') == fid), {})
            print(f"  {fid}: {p.get('DOMICILIO','')} — completar manualmente")
        print("\nPara completar manualmente, buscá la dirección en")
        print("https://nominatim.openstreetmap.org/ y agregá lat/lng en bd_bahiar_geo.json")


if __name__ == '__main__':
    main()
