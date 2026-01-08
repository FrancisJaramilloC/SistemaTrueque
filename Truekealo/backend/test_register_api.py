"""
Script para probar el endpoint de registro exactamente como lo hace el frontend
"""
import requests
import json

API_URL = "http://localhost:8000/api/v1"

print("="*60)
print("🧪 Prueba de Registro desde Frontend")
print("="*60)

# Datos del nuevo usuario (simula lo que envía el formulario)
nuevo_usuario = {
    "nombre_completo": "Maria Garcia",
    "email": "maria@ejemplo.com",
    "password": "12345678",
    "telefono": "",
    "ubicacion": ""
}

print(f"\n📝 1. Registrando usuario desde frontend...")
print(f"   Email: {nuevo_usuario['email']}")
print(f"   Nombre: {nuevo_usuario['nombre_completo']}")
print(f"   Password: {nuevo_usuario['password']}")

try:
    # Hacer petición POST al endpoint de registro
    response = requests.post(
        f"{API_URL}/auth/register",
        json=nuevo_usuario,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"\n   Status Code: {response.status_code}")
    
    if response.status_code == 201:
        user_data = response.json()
        print(f"   ✅ Usuario registrado exitosamente!")
        print(f"   ID: {user_data['id']}")
        print(f"   Email: {user_data['email']}")
        print(f"   Nombre: {user_data['nombre_completo']}")
        
        # Ahora intentar login
        print(f"\n🔐 2. Intentando login con las credenciales...")
        login_data = {
            "email": nuevo_usuario['email'],
            "password": nuevo_usuario['password']
        }
        
        login_response = requests.post(
            f"{API_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status Code: {login_response.status_code}")
        
        if login_response.status_code == 200:
            token_data = login_response.json()
            print(f"   ✅ Login exitoso!")
            print(f"   Token: {token_data['access_token'][:50]}...")
            print(f"   Usuario: {token_data['user']['nombre_completo']}")
            
            print("\n" + "="*60)
            print("✅ TODO FUNCIONA CORRECTAMENTE")
            print("="*60)
            print(f"\n💡 Ahora puedes usar estas credenciales en el navegador:")
            print(f"   Email: {nuevo_usuario['email']}")
            print(f"   Password: {nuevo_usuario['password']}")
            
        else:
            print(f"   ❌ Error en login: {login_response.text}")
    
    elif response.status_code == 400:
        error_data = response.json()
        if "ya está registrado" in error_data.get('detail', ''):
            print(f"   ⚠️ El email ya existe, intentando login directamente...")
            
            login_data = {
                "email": nuevo_usuario['email'],
                "password": nuevo_usuario['password']
            }
            
            login_response = requests.post(
                f"{API_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if login_response.status_code == 200:
                print(f"   ✅ Login exitoso con usuario existente!")
                print(f"\n💡 Usa estas credenciales:")
                print(f"   Email: {nuevo_usuario['email']}")
                print(f"   Password: {nuevo_usuario['password']}")
            else:
                print(f"   ❌ Error en login: {login_response.text}")
        else:
            print(f"   ❌ Error: {error_data.get('detail', 'Error desconocido')}")
    else:
        print(f"   ❌ Error: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("\n❌ ERROR: No se puede conectar al servidor")
    print("   Asegúrate de que el backend esté corriendo:")
    print("   cd backend")
    print("   .\\venv\\Scripts\\Activate.ps1")
    print("   python -m uvicorn app.main:app --reload")
    
except Exception as e:
    print(f"\n❌ Error inesperado: {str(e)}")
    import traceback
    traceback.print_exc()
