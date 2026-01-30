#!/usr/bin/env python3
"""
Test para verificar que las imágenes se muestran correctamente
Simula el flujo: crear artículo con imagen y verificar que se puede acceder
"""

import requests
import json

API_BASE = 'http://localhost:8000/api/v1'

def test_image_visibility():
    print("\n" + "="*60)
    print("🖼️  TEST DE VISIBILIDAD DE IMÁGENES")
    print("="*60)
    
    # 1️⃣ Obtener un artículo con imagen
    print("\n1️⃣ Obteniendo artículos disponibles...")
    response = requests.get(f'{API_BASE}/articulos/')
    
    if response.status_code != 200:
        print(f"❌ Error al obtener artículos: {response.status_code}")
        return False
    
    articulos = response.json()
    print(f"✅ Se encontraron {len(articulos)} artículos")
    
    # 2️⃣ Buscar un artículo con imagen
    articulos_con_imagen = [a for a in articulos if a.get('imagen_url')]
    
    if not articulos_con_imagen:
        print("⚠️ No hay artículos con imagen")
        print("   Primero crea un artículo y sube una imagen")
        return False
    
    print(f"✅ Se encontraron {len(articulos_con_imagen)} artículos con imagen")
    
    # 3️⃣ Verificar acceso a las imágenes
    print("\n3️⃣ Verificando acceso a las imágenes...")
    for art in articulos_con_imagen[:3]:  # Verificar los primeros 3
        imagen_url = art.get('imagen_url')
        print(f"\n   Artículo: {art.get('titulo')}")
        print(f"   URL relativa: {imagen_url}")
        
        # Construir URL completa
        url_completa = f"http://localhost:8000{imagen_url}"
        print(f"   URL completa: {url_completa}")
        
        # Intentar acceder
        try:
            img_response = requests.head(url_completa, timeout=5)
            if img_response.status_code == 200:
                print(f"   ✅ Imagen accesible (Status: {img_response.status_code})")
                print(f"   Size: {img_response.headers.get('content-length', 'desconocido')} bytes")
            else:
                print(f"   ❌ Error al acceder (Status: {img_response.status_code})")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n" + "="*60)
    print("✅ TEST COMPLETADO")
    print("="*60)
    print("\n💡 PRÓXIMOS PASOS:")
    print("1. Abre http://localhost:5500/templates/mis-articulos.html")
    print("2. Haz login")
    print("3. Deberías ver las imágenes de tus artículos")
    print("\nSi NO ves las imágenes:")
    print("- Abre F12 → Console")
    print("- Busca errores de CORS o imagen no encontrada")
    print("- Verifica que apiBase esté correcto: " + 'console.log(window.apiBase)')
    return True

if __name__ == '__main__':
    success = test_image_visibility()
    exit(0 if success else 1)
