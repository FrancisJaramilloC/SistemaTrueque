#!/usr/bin/env python
"""
Test de contadores del Dashboard
"""
import requests
import random
import string

BASE_URL = "http://localhost:8000/api/v1"

# Generar email único
random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
test_email = f"test_dashboard_{random_id}@example.com"
test_password = "TestPassword123"

# 1. Registrar usuario
register_data = {
    "email": test_email,
    "nombre_completo": "Test Dashboard User",
    "password": test_password,
    "telefono": "+57 300 1111111",
    "ubicacion": "Bogota, Colombia"
}

print(f"1. Registrando usuario: {test_email}")
try:
    register_response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"Status: {register_response.status_code}")
    
    if register_response.status_code != 201:
        print(f"[ERROR] Registration failed: {register_response.json()}")
        exit(1)

    # 2. Login
    login_data = {
        "email": test_email,
        "password": test_password
    }

    print("\n2. Intentando login...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"[OK] Token obtenido")
        
        # 3. Obtener resumen de propuestas
        print("\n3. Obteniendo resumen de propuestas...")
        propuestas_response = requests.get(f"{BASE_URL}/propuestas/resumen", headers=headers)
        print(f"Status: {propuestas_response.status_code}")
        if propuestas_response.status_code == 200:
            resumen = propuestas_response.json()
            print(f"Propuestas pendientes: {resumen.get('pendientes', 0)}")
            print(f"Total propuestas: {resumen.get('total', 0)}")
        else:
            print(f"Error: {propuestas_response.json()}")
        
        # 4. Obtener mis articulos
        print("\n4. Obteniendo mis articulos...")
        articulos_response = requests.get(f"{BASE_URL}/articulos/mis-articulos", headers=headers)
        print(f"Status: {articulos_response.status_code}")
        if articulos_response.status_code == 200:
            articulos = articulos_response.json()
            print(f"Total articulos: {len(articulos)}")
        else:
            print(f"Error: {articulos_response.json()}")
        
        # 5. Obtener mensajes no leidos
        print("\n5. Obteniendo mensajes no leidos...")
        mensajes_response = requests.get(f"{BASE_URL}/mensajes/unread-count", headers=headers)
        print(f"Status: {mensajes_response.status_code}")
        if mensajes_response.status_code == 200:
            unread = mensajes_response.json()
            print(f"Mensajes no leidos: {unread.get('unread', 0)}")
        else:
            print(f"Error: {mensajes_response.json()}")
            
    else:
        print(f"[ERROR] Login failed: {login_response.json()}")
except Exception as e:
    print(f"[ERROR] Exception: {e}")
