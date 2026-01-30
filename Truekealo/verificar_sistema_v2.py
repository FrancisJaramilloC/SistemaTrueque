#!/usr/bin/env python3
"""
Script para verificar que el sistema está funcionando correctamente
Revisa autenticación y datos del usuario
"""

import json
import requests
import sys

# Colores para terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

BASE_URL = "http://localhost:8000/api/v1"

print(f"{BLUE}{'='*60}")
print("🔍 VERIFICACIÓN DEL SISTEMA TRUEKEALO")
print(f"{'='*60}{RESET}\n")

# 1. Verificar conectividad con el servidor
print(f"{YELLOW}1. Verificando conexión con el servidor...{RESET}")
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    if response.status_code == 200:
        print(f"{GREEN}✅ Servidor está en línea{RESET}")
        print(f"   Estado: {response.json().get('status')}")
        print(f"   Versión: {response.json().get('version')}\n")
    else:
        print(f"{RED}❌ Servidor respondió con error: {response.status_code}{RESET}\n")
except Exception as e:
    print(f"{RED}❌ No se puede conectar al servidor: {e}{RESET}")
    print(f"{RED}   Asegúrate que el backend está corriendo en puerto 8000{RESET}\n")
    sys.exit(1)

# 2. Prueba de login (usando datos de prueba)
print(f"{YELLOW}2. Probando endpoint de login...{RESET}")
test_credentials = {
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
}

try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json=test_credentials,
        timeout=5
    )
    
    if response.status_code == 200:
        login_data = response.json()
        token = login_data.get('access_token')
        user = login_data.get('user', {})
        
        print(f"{GREEN}✅ Login respondiendo correctamente{RESET}")
        print(f"   Token obtenido: {'Sí' if token else 'No'}")
        print(f"   Datos de usuario retornados:")
        print(f"   - Nombre: {user.get('nombre_completo', 'N/A')}")
        print(f"   - Email: {user.get('email', 'N/A')}")
        print(f"   - ID: {user.get('id', 'N/A')}\n")
        
        if token:
            # 3. Probar endpoint de artículos
            print(f"{YELLOW}3. Probando endpoint de artículos...{RESET}")
            try:
                headers = {'Authorization': f'Bearer {token}'}
                response = requests.get(
                    f"{BASE_URL}/articulos/",
                    headers=headers,
                    timeout=5
                )
                
                if response.status_code == 200:
                    articulos = response.json()
                    print(f"{GREEN}✅ Endpoint de artículos funcionando{RESET}")
                    print(f"   Total de artículos: {len(articulos) if isinstance(articulos, list) else 'N/A'}\n")
                else:
                    print(f"{YELLOW}⚠️  Error obteniendo artículos: {response.status_code}{RESET}\n")
            except Exception as e:
                print(f"{RED}❌ Error al obtener artículos: {e}{RESET}\n")
    else:
        print(f"{YELLOW}⚠️  Error en login (esperado con datos de prueba): {response.status_code}{RESET}")
        print(f"   Respuesta: {response.json().get('detail', 'Unknown error')}\n")
        
except Exception as e:
    print(f"{RED}❌ Error probando login: {e}{RESET}\n")

# 4. Información para el usuario
print(f"{BLUE}{'='*60}")
print("📋 PASOS SIGUIENTES:")
print(f"{'='*60}{RESET}")
print(f"""
{GREEN}Para que el nombre del usuario aparezca correctamente:{RESET}

1. Abre tu navegador en: http://localhost:5500
2. Inicia sesión con tu cuenta
3. Abre la consola (F12 o Ctrl+Shift+I)
4. Copia y pega esto en la consola:
   
   console.log(JSON.parse(localStorage.getItem('user_data')))
   
5. Deberías ver tu nombre completo en el objeto 'nombre_completo'
6. Si lo ves, recarga la página (F5) y deberías ver tu nombre

{YELLOW}Si no ves tu nombre después de recargar:{RESET}
- Abre DevTools (F12)
- Ve a la pestaña Console
- Busca emojis ✅, ⚠️, ❌ para ver qué está pasando
- Revisa los errores de red en la pestaña Network
""")

print(f"{BLUE}{'='*60}{RESET}")
print("✅ Verificación completada")
print(f"{BLUE}{'='*60}{RESET}\n")
