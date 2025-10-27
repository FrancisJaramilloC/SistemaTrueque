import requests
import json

# Configuración
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

# Datos de prueba (CAMBIA persona_id según tu BD)
datos_registro = {
    "email": "prueba@test.com",
    "username": "usuarioprueba",
    "contrasena": "TestPassword123!",
    "persona_id": 1  # ← CAMBIA ESTO si no tienes persona con id=1
}

def print_separador():
    print("\n" + "="*70 + "\n")

def print_resultado(titulo, response):
    print(f"📋 {titulo}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Respuesta: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    except:
        print(f"Respuesta: {response.text}")

# TEST 1: REGISTRO DE USUARIO
print_separador()
print("🔹 TEST 1: REGISTRO DE USUARIO")
print_separador()

try:
    response = requests.post(
        f"{API_BASE}/auth/registro",
        json=datos_registro
    )
    print_resultado("Resultado del Registro", response)
    
    if response.status_code == 201:
        print("✅ Usuario registrado exitosamente!")
    elif response.status_code == 400 and "ya está registrado" in response.text:
        print("⚠️ El usuario ya existe (esto es normal si ya lo probaste antes)")
    else:
        print("❌ Error al registrar usuario")
        
except Exception as e:
    print(f"❌ Error de conexión: {e}")
    print("¿Está el servidor corriendo? Ejecuta: uvicorn main:app --reload")
    exit()

# TEST 2: LOGIN
print_separador()
print("🔹 TEST 2: LOGIN")
print_separador()

credenciales = {
    "username": datos_registro["username"],
    "contrasena": datos_registro["contrasena"]
}

try:
    response = requests.post(
        f"{API_BASE}/auth/login",
        json=credenciales
    )
    print_resultado("Resultado del Login", response)
    
    if response.status_code == 200:
        print("✅ Login exitoso!")
        token_data = response.json()
        token = token_data["access_token"]
        print(f"\n🎫 Token obtenido: {token[:50]}...")
    else:
        print("❌ Error al hacer login")
        exit()
        
except Exception as e:
    print(f"❌ Error: {e}")
    exit()

# TEST 3: ACCEDER A RUTA PROTEGIDA

print_separador()
print("🔹 TEST 3: ACCESO A RUTA PROTEGIDA (/api/auth/me)")
print_separador()

headers = {
    "Authorization": f"Bearer {token}"
}

try:
    response = requests.get(
        f"{API_BASE}/auth/me",
        headers=headers
    )
    print_resultado("Resultado de ruta protegida", response)
    
    if response.status_code == 200:
        print("✅ Acceso a ruta protegida exitoso!")
        print("✅ El token JWT está funcionando correctamente!")
    else:
        print("❌ Error al acceder a ruta protegida")
        
except Exception as e:
    print(f"❌ Error: {e}")

# TEST 4: ACCESO SIN TOKEN (debe fallar)
print_separador()
print("🔹 TEST 4: ACCESO SIN TOKEN (debe dar error 401)")
print_separador()

try:
    response = requests.get(f"{API_BASE}/auth/me")
    print_resultado("Resultado sin token", response)
    
    if response.status_code == 403:
        print("✅ Correcto! La ruta está protegida (rechaza peticiones sin token)")
    else:
        print("⚠️ Inesperado: debería rechazar peticiones sin token")
        
except Exception as e:
    print(f"❌ Error: {e}")

# TEST 5: LOGIN CON CONTRASEÑA INCORRECTA
print_separador()
print("🔹 TEST 5: LOGIN CON CONTRASEÑA INCORRECTA (debe fallar)")
print_separador()

credenciales_malas = {
    "username": datos_registro["username"],
    "contrasena": "ContraseñaIncorrecta123"
}

try:
    response = requests.post(
        f"{API_BASE}/auth/login",
        json=credenciales_malas
    )
    print_resultado("Resultado con contraseña incorrecta", response)
    
    if response.status_code == 401:
        print("✅ Correcto! Rechaza contraseñas incorrectas")
    else:
        print("❌ Error: debería rechazar contraseñas incorrectas")
        
except Exception as e:
    print(f"❌ Error: {e}")
