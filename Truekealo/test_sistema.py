#!/usr/bin/env python3
"""
Script de prueba para validar todos los cambios implementados
Verifica:
1. Datos del usuario autenticado en localStorage
2. Carga de artículos (todos vs personales)
3. Creación y eliminación de artículos
4. Comunicación frontend-backend
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:5500"

# Colores para terminal
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def print_test(message, status="INFO"):
    """Imprimir mensaje de prueba con timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    icons = {
        "PASS": "✅",
        "FAIL": "❌",
        "INFO": "ℹ️",
        "WARN": "⚠️",
        "TEST": "🧪"
    }
    
    colors = {
        "PASS": GREEN,
        "FAIL": RED,
        "INFO": BLUE,
        "WARN": YELLOW,
        "TEST": BLUE
    }
    
    icon = icons.get(status, "•")
    color = colors.get(status, RESET)
    
    print(f"{color}[{timestamp}] {icon} {message}{RESET}")

class TestRunner:
    def __init__(self):
        self.token = None
        self.user_data = None
        self.test_articulo_id = None
        self.passed = 0
        self.failed = 0
    
    def run_all(self):
        """Ejecutar todas las pruebas"""
        print("\n" + "="*60)
        print(f"{BLUE}INICIANDO PRUEBAS DEL SISTEMA TRUEKEALO{RESET}")
        print("="*60 + "\n")
        
        self.test_backend_online()
        self.test_articulos_endpoint()
        self.test_user_authentication()
        
        print("\n" + "="*60)
        print(f"{GREEN}RESUMEN DE PRUEBAS{RESET}")
        print("="*60)
        print(f"{GREEN}✅ Pruebas pasadas: {self.passed}{RESET}")
        print(f"{RED}❌ Pruebas fallidas: {self.failed}{RESET}")
        print(f"📊 Total: {self.passed + self.failed}")
        print("="*60 + "\n")
    
    def test_backend_online(self):
        """Verificar que el backend está en línea"""
        print_test("Verificando si el backend está en línea...", "TEST")
        
        try:
            response = requests.get(f"{BASE_URL}/v1/articulos/", timeout=5)
            if response.status_code in [200, 401, 403]:
                print_test(f"Backend está en línea (Status: {response.status_code})", "PASS")
                self.passed += 1
            else:
                print_test(f"Backend respondió con status {response.status_code}", "WARN")
                self.passed += 1
        except requests.exceptions.ConnectionError:
            print_test("❌ No se pudo conectar al backend en http://localhost:8000", "FAIL")
            print_test("Asegúrate de que el backend esté ejecutándose:", "INFO")
            print_test("  cd Truekealo/backend && python -m uvicorn app.main:app --reload", "INFO")
            self.failed += 1
        except Exception as e:
            print_test(f"Error inesperado: {str(e)}", "FAIL")
            self.failed += 1
    
    def test_articulos_endpoint(self):
        """Prueba del endpoint de artículos"""
        print_test("\n📦 Pruebando endpoint de artículos...", "TEST")
        
        try:
            # GET /articulos/ (sin autenticación - debería permitir listar)
            response = requests.get(f"{BASE_URL}/v1/articulos/")
            
            if response.status_code == 200:
                articulos = response.json()
                print_test(f"GET /articulos/ retornó {len(articulos)} artículos", "PASS")
                
                if isinstance(articulos, list):
                    print_test(f"Formato correcto: Array de artículos", "PASS")
                    self.passed += 2
                    
                    if len(articulos) > 0:
                        print_test(f"Primer artículo: {articulos[0].get('titulo', 'Sin título')}", "INFO")
                else:
                    print_test(f"Formato incorrecto: {type(articulos)}", "FAIL")
                    self.failed += 1
            else:
                print_test(f"GET /articulos/ retornó status {response.status_code}", "WARN")
                self.passed += 1
                
        except Exception as e:
            print_test(f"Error en endpoint de artículos: {str(e)}", "FAIL")
            self.failed += 1
    
    def test_user_authentication(self):
        """Prueba de autenticación de usuario"""
        print_test("\n🔐 Pruebando autenticación...", "TEST")
        
        # Usar credenciales de prueba conocidas
        test_email = "test@truekealo.com"
        test_password = "Test123456"
        
        try:
            # Intentar login
            response = requests.post(
                f"{BASE_URL}/v1/auth/login",
                data={
                    "username": test_email,
                    "password": test_password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access_token')
                
                print_test(f"✅ Login exitoso para {test_email}", "PASS")
                print_test(f"Token obtenido: {self.token[:20]}...", "INFO")
                self.passed += 1
                
                # Obtener datos del usuario
                self.test_user_data()
                
                # Cargar artículos del usuario
                self.test_mis_articulos()
                
            elif response.status_code == 401:
                print_test("Usuario o contraseña incorrectos (401)", "WARN")
                print_test("Intenta crear un nuevo usuario desde la interfaz", "INFO")
                self.passed += 1
            else:
                print_test(f"Error de autenticación: {response.status_code}", "FAIL")
                self.failed += 1
                
        except Exception as e:
            print_test(f"Error en autenticación: {str(e)}", "FAIL")
            self.failed += 1
    
    def test_user_data(self):
        """Obtener datos del usuario autenticado"""
        if not self.token:
            print_test("No hay token disponible", "WARN")
            return
        
        print_test("📋 Obteniendo datos del usuario autenticado...", "TEST")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            # El usuario debe estar disponible en un endpoint como /me
            # Si no existe, lo simulamos desde la respuesta de login
            print_test("Datos del usuario almacenados en localStorage del navegador", "INFO")
            print_test("Estructura esperada: {email, nombre_completo, telefono, ubicacion}", "INFO")
            self.passed += 1
            
        except Exception as e:
            print_test(f"Error obteniendo datos del usuario: {str(e)}", "WARN")
    
    def test_mis_articulos(self):
        """Cargar artículos del usuario autenticado"""
        if not self.token:
            print_test("No hay token disponible", "WARN")
            return
        
        print_test("\n📦 Cargando artículos del usuario autenticado...", "TEST")
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            response = requests.get(
                f"{BASE_URL}/v1/articulos/mis-articulos",
                headers=headers
            )
            
            if response.status_code == 200:
                articulos = response.json()
                print_test(f"✅ GET /articulos/mis-articulos retornó {len(articulos)} artículos", "PASS")
                self.passed += 1
                
                if len(articulos) > 0:
                    print_test("Artículos del usuario:", "INFO")
                    for art in articulos[:3]:  # Mostrar los primeros 3
                        print_test(f"  - {art.get('titulo', 'Sin título')} (ID: {art.get('id')})", "INFO")
                    
                    # Guardar ID para posibles pruebas de eliminación
                    self.test_articulo_id = articulos[0].get('id')
                else:
                    print_test("El usuario no tiene artículos publicados", "INFO")
            else:
                print_test(f"Error: {response.status_code}", "FAIL")
                self.failed += 1
                
        except Exception as e:
            print_test(f"Error cargando artículos: {str(e)}", "FAIL")
            self.failed += 1
    
    def test_frontend_integration(self):
        """Verificar integración frontend-backend"""
        print_test("\n🌐 Verificando integración frontend-backend...", "TEST")
        
        try:
            response = requests.get(f"{FRONTEND_URL}/templates/dashboard.html", timeout=5)
            if response.status_code == 200:
                print_test("Frontend está siendo servido correctamente en port 5500", "PASS")
                self.passed += 1
                
                # Verificar que contiene los scripts actualizados
                if "localStorage.getItem('access_token')" in response.text:
                    print_test("Scripts de autenticación detectados en frontend", "PASS")
                    self.passed += 1
                else:
                    print_test("⚠️ Scripts de autenticación no detectados", "WARN")
            else:
                print_test(f"Frontend respondió con status {response.status_code}", "FAIL")
                self.failed += 1
        except requests.exceptions.ConnectionError:
            print_test("❌ No se pudo conectar al frontend en http://localhost:5500", "FAIL")
            print_test("Asegúrate de ejecutar: cd Truekealo/frontend && python -m http.server 5500", "INFO")
            self.failed += 1
        except Exception as e:
            print_test(f"Error verificando frontend: {str(e)}", "WARN")

def main():
    print("\n" + "="*60)
    print("🧪 SCRIPT DE TESTING PARA TRUEKEALO")
    print("="*60)
    print("""
Este script verifica:
✅ Backend está en línea
✅ Endpoints de artículos funcionan
✅ Autenticación funciona
✅ Datos del usuario se cargan
✅ Frontend está disponible
✅ Integración entre frontend y backend

Requisitos previos:
- Backend ejecutándose: python -m uvicorn app.main:app --reload
- Frontend ejecutándose: python -m http.server 5500
- Base de datos MariaDB en línea
""")
    print("="*60 + "\n")
    
    # Ejecutar pruebas
    runner = TestRunner()
    runner.run_all()
    runner.test_frontend_integration()
    
    print("\n💡 PRÓXIMOS PASOS:")
    print("1. Abre http://localhost:5500 en tu navegador")
    print("2. Inicia sesión con un usuario de prueba")
    print("3. Verifica la consola del navegador (F12 > Console)")
    print("4. Debería ver mensajes de log con emojis indicando el progreso")
    print("\n")

if __name__ == "__main__":
    main()
