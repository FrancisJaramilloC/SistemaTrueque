"""
Script de Prueba del Sistema de Mensajería
Verifica que el sistema de mensajes funcione correctamente
"""
import requests
import json

# Configuración
BASE_URL = "http://localhost:8000/api/v1"

# Colores para terminal
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

# Test 1: Registrar dos usuarios
print("\n" + "="*50)
print_info("Test 1: Registrar usuarios de prueba")
print("="*50)

usuarios = []

for i in range(1, 3):
    usuario_data = {
        "nombre_completo": f"Usuario Test {i}",
        "email": f"test{i}@mensaje.com",
        "password": f"Test123!{i}",
        "telefono": f"555000{i}",
        "ubicacion": "Ciudad Test"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=usuario_data)
        if response.status_code == 201:
            print_success(f"Usuario {i} registrado: {usuario_data['email']}")
            usuarios.append(usuario_data)
        elif response.status_code == 400 and "already registered" in response.text:
            print_warning(f"Usuario {i} ya existe: {usuario_data['email']}")
            usuarios.append(usuario_data)
        else:
            print_error(f"Error al registrar usuario {i}: {response.text}")
    except Exception as e:
        print_error(f"Excepción al registrar usuario {i}: {str(e)}")

# Test 2: Login de usuarios
print("\n" + "="*50)
print_info("Test 2: Autenticar usuarios")
print("="*50)

tokens = []
user_ids = []

for usuario in usuarios:
    try:
        login_data = {
            "email": usuario["email"],
            "password": usuario["password"]
        }
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json=login_data
        )
        
        if response.status_code == 200:
            data = response.json()
            tokens.append(data["access_token"])
            user_ids.append(data["user"]["id"])
            print_success(f"Login exitoso: {usuario['email']} (ID: {data['user']['id']})")
        else:
            print_error(f"Error en login: {response.text}")
    except Exception as e:
        print_error(f"Excepción en login: {str(e)}")

if len(tokens) < 2:
    print_error("No se pudieron autenticar ambos usuarios. Test cancelado.")
    exit(1)

# Test 3: Usuario 1 envía mensaje a Usuario 2
print("\n" + "="*50)
print_info("Test 3: Enviar mensaje de Usuario 1 a Usuario 2")
print("="*50)

mensaje_data = {
    "destinatario_id": user_ids[1],
    "contenido": "Hola! Este es un mensaje de prueba desde el Usuario 1"
}

try:
    headers = {"Authorization": f"Bearer {tokens[0]}"}
    response = requests.post(
        f"{BASE_URL}/mensajes",
        json=mensaje_data,
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print_success("Mensaje enviado correctamente")
        print(f"   - ID: {data['id']}")
        print(f"   - De: {data['remitente_id']}")
        print(f"   - Para: {data['destinatario_id']}")
        print(f"   - Contenido: {data['contenido']}")
    else:
        print_error(f"Error al enviar mensaje: {response.status_code} - {response.text}")
except Exception as e:
    print_error(f"Excepción al enviar mensaje: {str(e)}")

# Test 4: Usuario 2 responde
print("\n" + "="*50)
print_info("Test 4: Usuario 2 responde al mensaje")
print("="*50)

mensaje_respuesta = {
    "destinatario_id": user_ids[0],
    "contenido": "Hola! Gracias por tu mensaje. Este es el Usuario 2 respondiendo."
}

try:
    headers = {"Authorization": f"Bearer {tokens[1]}"}
    response = requests.post(
        f"{BASE_URL}/mensajes",
        json=mensaje_respuesta,
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print_success("Respuesta enviada correctamente")
        print(f"   - ID: {data['id']}")
        print(f"   - Contenido: {data['contenido']}")
    else:
        print_error(f"Error al enviar respuesta: {response.status_code} - {response.text}")
except Exception as e:
    print_error(f"Excepción al enviar respuesta: {str(e)}")

# Test 5: Usuario 1 obtiene conversación
print("\n" + "="*50)
print_info("Test 5: Usuario 1 obtiene la conversación completa")
print("="*50)

try:
    headers = {"Authorization": f"Bearer {tokens[0]}"}
    response = requests.get(
        f"{BASE_URL}/mensajes/conversacion/{user_ids[1]}",
        headers=headers
    )
    
    if response.status_code == 200:
        mensajes = response.json()
        print_success(f"Conversación obtenida: {len(mensajes)} mensajes")
        for i, msg in enumerate(mensajes, 1):
            direccion = "➡️ Enviado" if msg['remitente_id'] == user_ids[0] else "⬅️ Recibido"
            print(f"   {i}. {direccion}: {msg['contenido'][:50]}...")
    else:
        print_error(f"Error al obtener conversación: {response.text}")
except Exception as e:
    print_error(f"Excepción al obtener conversación: {str(e)}")

# Test 6: Usuario 2 lista sus conversaciones
print("\n" + "="*50)
print_info("Test 6: Usuario 2 lista sus conversaciones")
print("="*50)

try:
    headers = {"Authorization": f"Bearer {tokens[1]}"}
    response = requests.get(
        f"{BASE_URL}/mensajes/conversaciones",
        headers=headers
    )
    
    if response.status_code == 200:
        conversaciones = response.json()
        print_success(f"Conversaciones encontradas: {len(conversaciones)}")
        for conv in conversaciones:
            print(f"   - Con: {conv['otro_usuario_nombre']}")
            print(f"     Último mensaje: {conv['ultimo_mensaje'][:50]}...")
            print(f"     No leídos: {conv['mensajes_no_leidos']}")
    else:
        print_error(f"Error al listar conversaciones: {response.text}")
except Exception as e:
    print_error(f"Excepción al listar conversaciones: {str(e)}")

# Test 7: Contador de mensajes no leídos
print("\n" + "="*50)
print_info("Test 7: Usuario 1 verifica mensajes no leídos")
print("="*50)

try:
    headers = {"Authorization": f"Bearer {tokens[0]}"}
    response = requests.get(
        f"{BASE_URL}/mensajes/unread-count",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print_success(f"Mensajes no leídos: {data['unread']}")
    else:
        print_error(f"Error al obtener contador: {response.text}")
except Exception as e:
    print_error(f"Excepción al obtener contador: {str(e)}")

# Resumen
print("\n" + "="*50)
print_success("Tests completados!")
print("="*50)
print_info("Ahora puedes:")
print("  1. Iniciar sesión en el frontend con:")
print(f"     - Email: test1@mensaje.com | Password: Test123!1")
print(f"     - Email: test2@mensaje.com | Password: Test123!2")
print("  2. Ir a la sección 'Mensajes'")
print("  3. Verificar que las conversaciones aparezcan")
print("  4. Enviar más mensajes desde la interfaz")
print("="*50)
