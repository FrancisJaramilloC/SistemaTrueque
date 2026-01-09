#!/usr/bin/env python3
"""
Test para verificar el endpoint mis-articulos
"""

import requests
import json

API_BASE = "http://localhost:8000/api/v1"

# Primero, crear un usuario y hacer login
print("=" * 60)
print("TEST: Verificar endpoint mis-articulos")
print("=" * 60)

# 1. Registrar usuario
print("\n1️⃣  Registrando usuario...")
import uuid
email = f"test{uuid.uuid4().hex[:8]}@example.com"
password = "testpass123"

response = requests.post(
    f"{API_BASE}/auth/register",
    json={
        "email": email,
        "password": password,
        "nombre_completo": "Usuario Test"
    }
)

print(f"Status: {response.status_code}")
if response.status_code == 201:
    print(f"✅ Usuario registrado: {email}")
else:
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

# 2. Login
print("\n2️⃣  Iniciando sesión...")
response = requests.post(
    f"{API_BASE}/auth/login",
    json={"email": email, "password": password}
)

if response.status_code == 200:
    token = response.json().get("access_token")
    print(f"✅ Token obtenido")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
    exit(1)

# 3. Crear un artículo
print("\n3️⃣  Creando artículo...")
response = requests.post(
    f"{API_BASE}/articulos/",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "titulo": "Test Artículo",
        "descripcion": "Este es un artículo de prueba para verificar",
        "categoria": "otros",
        "condicion": "Bueno",
        "valor_estimado": 50
    }
)

if response.status_code == 201:
    articulo = response.json()
    print(f"✅ Artículo creado con ID: {articulo.get('id')}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)

# 4. Obtener mis-articulos
print("\n4️⃣  Obteniendo mis-articulos...")
response = requests.get(
    f"{API_BASE}/articulos/mis-articulos",
    headers={"Authorization": f"Bearer {token}"}
)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    articulos = response.json()
    print(f"✅ Se obtuvieron {len(articulos)} artículos")
    if articulos:
        print("\nArtículos encontrados:")
        for art in articulos:
            print(f"  - {art.get('titulo')} (ID: {art.get('id')})")
    else:
        print("❌ Sin artículos (pero endpoint funcionó)")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)

print("\n" + "=" * 60)
