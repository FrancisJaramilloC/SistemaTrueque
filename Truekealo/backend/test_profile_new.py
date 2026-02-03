#!/usr/bin/env python
"""
Test del endpoint de actualización de perfil - Registrar nuevo usuario
"""
import requests
import json
import random
import string

BASE_URL = "http://localhost:8000/api/v1"

# Generar email único
random_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
test_email = f"test_profile_{random_id}@example.com"
test_password = "TestPassword123"

# Registrar usuario
register_data = {
    "email": test_email,
    "nombre_completo": "Test Profile User",
    "password": test_password,
    "telefono": "+57 300 0000000",
    "ubicacion": "Bogotá, Colombia"
}

print(f"1. Registrando usuario: {test_email}")
register_response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
print(f"Status: {register_response.status_code}")
print(f"Response: {register_response.json()}")

if register_response.status_code == 201:
    print("\n2. Intentando login...")
    login_data = {
        "email": test_email,
        "password": test_password
    }
    
    login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        print(f"[OK] Token obtenido: {token[:20]}...")
        
        # Actualizar perfil
        print("\n3. Intentando actualizar perfil...")
        headers = {"Authorization": f"Bearer {token}"}
        
        profile_data = {
            "nombre_completo": "Test Profile User UPDATED",
            "telefono": "+57 300 9999999",
            "ubicacion": "Medellín, Antioquia"
        }
        
        profile_response = requests.put(
            f"{BASE_URL}/auth/profile",
            json=profile_data,
            headers=headers
        )
        
        print(f"Status: {profile_response.status_code}")
        print(f"Response: {json.dumps(profile_response.json(), indent=2, default=str)}")
    else:
        print(f"[ERROR] Login failed: {login_response.json()}")
else:
    print(f"[ERROR] Registration failed: {register_response.json()}")
