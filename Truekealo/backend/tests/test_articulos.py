#!/usr/bin/env python3
"""
Script de Prueba - Publicación de Artículos
Verifica que el flujo completo de creación de artículos funcione correctamente
"""
import requests
import json
import sys
from pathlib import Path

# Configuración
BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"

# Credenciales de prueba
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "TestPassword123!"
TEST_NAME = "Usuario Prueba"

# Colores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def print_status(message, status="INFO"):
    """Imprime mensaje con color"""
    colors = {
        "INFO": BLUE,
        "SUCCESS": GREEN,
        "ERROR": RED,
        "WARNING": YELLOW
    }
    color = colors.get(status, BLUE)
    print(f"{color}[{status}]{RESET} {message}")


def test_server_health():
    """Verifica que el servidor esté corriendo"""
    print_status("Verificando estado del servidor...", "INFO")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print_status("✅ Servidor corriendo", "SUCCESS")
            return True
        else:
            print_status("❌ Servidor respondiendo con error", "ERROR")
            return False
    except requests.exceptions.ConnectionError:
        print_status("❌ No se puede conectar al servidor. ¿Está corriendo en localhost:8000?", "ERROR")
        return False
    except Exception as e:
        print_status(f"❌ Error: {e}", "ERROR")
        return False


def test_register_user():
    """Registra un usuario de prueba"""
    print_status("Registrando usuario de prueba...", "INFO")
    
    data = {
        "email": TEST_EMAIL,
        "nombre_completo": TEST_NAME,
        "password": TEST_PASSWORD,
        "telefono": "123456789",
        "ubicacion": "Ciudad Prueba"
    }
    
    try:
        response = requests.post(f"{API_V1}/auth/register", json=data)
        
        if response.status_code == 201:
            print_status("✅ Usuario registrado", "SUCCESS")
            return True
        elif response.status_code == 422:
            print_status(f"⚠️ Validación rechazada: {response.json()}", "WARNING")
            return False
        elif response.status_code == 400:
            # Usuario ya existe, está bien
            print_status("⚠️ Usuario ya existe (normal en pruebas repetidas)", "WARNING")
            return True
        else:
            print_status(f"❌ Error {response.status_code}: {response.text}", "ERROR")
            return False
    except Exception as e:
        print_status(f"❌ Error de conexión: {e}", "ERROR")
        return False


def test_login_user():
    """Inicia sesión y obtiene token"""
    print_status("Iniciando sesión...", "INFO")
    
    data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{API_V1}/auth/login", json=data)
        
        if response.status_code == 200:
            token = response.json().get("access_token")
            if token:
                print_status(f"✅ Sesión iniciada, token: {token[:20]}...", "SUCCESS")
                return token
            else:
                print_status("❌ No se recibió token", "ERROR")
                return None
        else:
            print_status(f"❌ Error {response.status_code}: {response.text}", "ERROR")
            return None
    except Exception as e:
        print_status(f"❌ Error de conexión: {e}", "ERROR")
        return None


def test_create_articulo(token):
    """Crea un artículo de prueba"""
    print_status("Creando artículo de prueba...", "INFO")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "titulo": "Bicicleta de Prueba",
        "descripcion": "Esta es una bicicleta de prueba para verificar que el sistema funciona correctamente",
        "categoria": "deportes",
        "condicion": "Como nuevo",
        "valor_estimado": 250.00
    }
    
    try:
        response = requests.post(f"{API_V1}/articulos/", json=data, headers=headers)
        
        print_status(f"Respuesta del servidor: {response.status_code}", "INFO")
        
        if response.status_code == 201:
            result = response.json()
            print_status("✅ Artículo creado correctamente", "SUCCESS")
            print(json.dumps(result, indent=2, default=str))
            return result.get("id")
        elif response.status_code == 422:
            print_status(f"❌ Error de validación: {response.json()}", "ERROR")
            return None
        else:
            print_status(f"❌ Error {response.status_code}: {response.text}", "ERROR")
            return None
    except Exception as e:
        print_status(f"❌ Error de conexión: {e}", "ERROR")
        return None


def test_get_articulos(token):
    """Obtiene la lista de artículos"""
    print_status("Obteniendo lista de artículos...", "INFO")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_V1}/articulos/", headers=headers)
        
        if response.status_code == 200:
            articulos = response.json()
            print_status(f"✅ Se obtuvieron {len(articulos)} artículos", "SUCCESS")
            return articulos
        else:
            print_status(f"❌ Error {response.status_code}: {response.text}", "ERROR")
            return []
    except Exception as e:
        print_status(f"❌ Error de conexión: {e}", "ERROR")
        return []


def test_get_my_articulos(token):
    """Obtiene los artículos del usuario"""
    print_status("Obteniendo mis artículos...", "INFO")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(f"{API_V1}/articulos/mis-articulos", headers=headers)
        
        if response.status_code == 200:
            articulos = response.json()
            print_status(f"✅ Se obtuvieron {len(articulos)} mis artículos", "SUCCESS")
            return articulos
        else:
            print_status(f"❌ Error {response.status_code}: {response.text}", "ERROR")
            return []
    except Exception as e:
        print_status(f"❌ Error de conexión: {e}", "ERROR")
        return []


def main():
    """Ejecuta todas las pruebas"""
    print(f"""
{BLUE}
╔══════════════════════════════════════════════════════════╗
║        TEST DE PUBLICACIÓN DE ARTÍCULOS                 ║
║                  Truekealo Sistema                       ║
╚══════════════════════════════════════════════════════════╝
{RESET}
    """)
    
    # Test 1: Health check
    if not test_server_health():
        print_status("No se puede continuar sin el servidor", "ERROR")
        return False
    
    print()
    
    # Test 2: Registrar usuario
    if not test_register_user():
        print_status("Error registrando usuario", "WARNING")
    
    print()
    
    # Test 3: Login
    token = test_login_user()
    if not token:
        print_status("No se pudo obtener token", "ERROR")
        return False
    
    print()
    
    # Test 4: Crear artículo
    articulo_id = test_create_articulo(token)
    if articulo_id:
        print_status(f"Artículo creado con ID: {articulo_id}", "SUCCESS")
    else:
        print_status("Error creando artículo", "ERROR")
    
    print()
    
    # Test 5: Obtener artículos
    all_articulos = test_get_articulos(token)
    
    print()
    
    # Test 6: Obtener mis artículos
    my_articulos = test_get_my_articulos(token)
    
    print()
    print_status("Prueba completada", "SUCCESS")
    
    return articulo_id is not None


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
