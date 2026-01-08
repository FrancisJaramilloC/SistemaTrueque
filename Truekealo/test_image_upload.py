#!/usr/bin/env python3
"""
Test completo del upload de imágenes desde publicar.html
Simula el flujo: registrar usuario -> crear artículo -> subir imagen
"""

import requests
import json
import os
import tempfile
from pathlib import Path

API_BASE = 'http://localhost:8000/api/v1'

# Test user credentials
TEST_USER = {
    'email': f'imagetest{os.urandom(4).hex()}@test.com',
    'password': 'Test123!@#'
}

def test_image_upload():
    print("\n" + "="*60)
    print("🖼️  TEST COMPLETO DE UPLOAD DE IMÁGENES")
    print("="*60)
    
    # 1️⃣ Registrar usuario
    print("\n1️⃣ Registrando usuario...")
    register_response = requests.post(
        f'{API_BASE}/auth/register',
        json={
            'email': TEST_USER['email'],
            'password': TEST_USER['password'],
            'nombre_completo': 'Test User Image'
        }
    )
    print(f"Status: {register_response.status_code}")
    if register_response.status_code != 201:
        print(f"❌ Error: {register_response.json()}")
        return False
    print("✅ Usuario registrado")
    
    # 2️⃣ Login
    print("\n2️⃣ Login...")
    login_response = requests.post(
        f'{API_BASE}/auth/login',
        json={'email': TEST_USER['email'], 'password': TEST_USER['password']}
    )
    print(f"Status: {login_response.status_code}")
    if login_response.status_code != 200:
        print(f"❌ Error: {login_response.json()}")
        return False
    
    token = login_response.json()['access_token']
    print(f"✅ Token obtenido")
    
    # 3️⃣ Crear artículo
    print("\n3️⃣ Creando artículo...")
    articulo_data = {
        'titulo': 'Artículo con Imagen',
        'descripcion': 'Test article with image upload',
        'categoria': 'electronica',
        'condicion': 'como_nuevo',
        'valor_estimado': 150.0
    }
    
    articulo_response = requests.post(
        f'{API_BASE}/articulos/',
        headers={'Authorization': f'Bearer {token}'},
        json=articulo_data
    )
    print(f"Status: {articulo_response.status_code}")
    if articulo_response.status_code != 201:
        print(f"❌ Error: {articulo_response.json()}")
        return False
    
    articulo_id = articulo_response.json()['id']
    print(f"✅ Artículo creado con ID: {articulo_id}")
    
    # 4️⃣ Crear imagen de prueba
    print("\n4️⃣ Creando imagen de prueba...")
    test_image_path = Path(tempfile.gettempdir()) / 'test_image.png'
    
    # Crear una imagen PNG simple
    try:
        from PIL import Image
        img = Image.new('RGB', (100, 100), color='red')
        img.save(test_image_path)
        print(f"✅ Imagen creada en {test_image_path}")
    except ImportError:
        print("⚠️ PIL no disponible, descargando imagen de prueba...")
        # Si PIL no está disponible, crear un PNG mínimal
        png_data = bytes.fromhex(
            '89504e470d0a1a0a0000000d494844520000001000000010080206000000'
            '0090916836000000194944415408d763f8cfcfc00ccc0ccc0cc0ccc00ccc'
            '0cc0cc2000ccc0c2cc0c0cc0c0cc0cc2000ccc0cc000048830002e7f3d00'
            '0000004945 nd'
        )
        test_image_path.write_bytes(png_data)
        print(f"✅ Imagen mínimal creada")
    
    # 5️⃣ Upload de imagen
    print("\n5️⃣ Subiendo imagen...")
    with open(test_image_path, 'rb') as f:
        files = {'file': ('test_image.png', f, 'image/png')}
        upload_response = requests.post(
            f'{API_BASE}/articulos/{articulo_id}/imagen',
            headers={'Authorization': f'Bearer {token}'},
            files=files
        )
    
    print(f"Status: {upload_response.status_code}")
    if upload_response.status_code != 200:
        error_data = upload_response.json()
        print(f"❌ Error: {error_data}")
        return False
    
    print("✅ Imagen subida correctamente")
    
    # 6️⃣ Verificar que la imagen fue guardada
    print("\n6️⃣ Verificando artículo con imagen...")
    verify_response = requests.get(
        f'{API_BASE}/articulos/{articulo_id}',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    if verify_response.status_code == 200:
        articulo = verify_response.json()
        print(f"Status: {verify_response.status_code}")
        print(f"✅ Imagen URL: {articulo.get('imagen_url', 'NO GUARDADA')}")
        
        if articulo.get('imagen_url'):
            print("\n" + "="*60)
            print("✅ TEST EXITOSO - IMAGEN SUBIDA CORRECTAMENTE")
            print("="*60)
            return True
        else:
            print("\n❌ La imagen no fue guardada en el artículo")
            return False
    else:
        print(f"❌ Error al verificar: {verify_response.json()}")
        return False

if __name__ == '__main__':
    success = test_image_upload()
    exit(0 if success else 1)
