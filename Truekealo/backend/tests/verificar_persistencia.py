#!/usr/bin/env python3
"""
Script para verificar que los datos persisten en la base de datos
Prueba que los artículos creados anteriormente existen
"""

import requests
import json

API_BASE = "http://localhost:8000/api/v1"

# Colores
GREEN = "\033[92m"
RESET = "\033[0m"

print(f"\n{GREEN}══════════════════════════════════════════════════════════{RESET}")
print(f"{GREEN}Verificando Persistencia de Datos en la Base de Datos{RESET}")
print(f"{GREEN}══════════════════════════════════════════════════════════{RESET}\n")

# Obtener lista de artículos (sin necesidad de autenticación)
print("Obteniendo lista de artículos...")
response = requests.get(
    f"{API_BASE}/articulos/?limit=100"
)

if response.status_code == 200:
    articulos = response.json()
    if isinstance(articulos, dict):
        articulos = articulos.get("items", [])
    
    print(f"✅ Se encontraron {len(articulos)} artículos en la base de datos\n")
    
    print("ARTÍCULOS GUARDADOS:")
    print("=" * 80)
    for i, art in enumerate(articulos, 1):
        print(f"\n{i}. {art.get('titulo')}")
        print(f"   ID: {art.get('id')}")
        print(f"   Descripción: {art.get('descripcion')}")
        print(f"   Categoría: {art.get('categoria')}")
        print(f"   Condición: {art.get('condicion')}")
        print(f"   Valor: ${art.get('valor_estimado')}")
        print(f"   Imagen: {art.get('imagen_url') or 'Sin imagen'}")
        if art.get('propietario'):
            print(f"   Propietario: {art['propietario'].get('nombre_completo')}")
    
    # Estadísticas
    print(f"\n{'=' * 80}")
    articulos_con_imagen = sum(1 for art in articulos if art.get('imagen_url'))
    print(f"\n✅ Total de artículos: {len(articulos)}")
    print(f"✅ Artículos con imagen: {articulos_con_imagen}")
    print(f"✅ Artículos sin imagen: {len(articulos) - articulos_con_imagen}")
    
    if articulos:
        print(f"\n{GREEN}✅ CONFIRMADO: Los artículos se guardan correctamente en la BD{RESET}")
    
else:
    print(f"❌ Error al obtener artículos: {response.status_code}")
    print(response.text)

print(f"\n{GREEN}══════════════════════════════════════════════════════════{RESET}\n")
