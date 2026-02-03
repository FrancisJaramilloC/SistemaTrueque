#!/usr/bin/env python
"""
Test del endpoint de actualización de perfil
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# Primero, hacer login
login_data = {
    "email": "riofrio.2013.23@gmail.com",
    "password": "Riofrio.2013"
}

print("1. Intentando login...")
login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
print(f"Status: {login_response.status_code}")
print(f"Response: {login_response.json()}")

if login_response.status_code == 200:
    token = login_response.json()["access_token"]
    print(f"\n✅ Token obtenido: {token[:20]}...")
    
    # Ahora intentar actualizar el perfil
    print("\n2. Intentando actualizar perfil...")
    headers = {"Authorization": f"Bearer {token}"}
    
    profile_data = {
        "nombre_completo": "Jose Riofrio Updated",
        "telefono": "+57 300 1234567",
        "ubicacion": "Medellín, Antioquia"
    }
    
    profile_response = requests.put(
        f"{BASE_URL}/auth/profile",
        json=profile_data,
        headers=headers
    )
    
    print(f"Status: {profile_response.status_code}")
    print(f"Response: {profile_response.json()}")
else:
    print("❌ No se pudo hacer login")
