"""
Script de prueba para verificar el sistema de mensajería completo
Prueba:
1. Registro de dos usuarios
2. Creación de un artículo
3. Envío de mensajes entre usuarios
4. Listado de conversaciones
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_mensajeria():
    print("=" * 60)
    print("TEST DE SISTEMA DE MENSAJERÍA COMPLETO")
    print("=" * 60)
    
    # 1. Crear dos usuarios
    print("\n1️⃣ CREANDO USUARIOS DE PRUEBA...")
    
    usuario1_data = {
        "nombre_completo": "Usuario Vendedor",
        "email": f"vendedor_{hash('test1')}@test.com",
        "password": "password123",
        "ubicacion": "Ciudad A"
    }
    
    usuario2_data = {
        "nombre_completo": "Usuario Comprador",
        "email": f"comprador_{hash('test2')}@test.com",
        "password": "password123",
        "ubicacion": "Ciudad B"
    }
    
    try:
        r1 = requests.post(f"{BASE_URL}/auth/register", json=usuario1_data)
        if r1.status_code == 201:
            print(f"✅ Usuario 1 creado: {usuario1_data['nombre_completo']}")
        else:
            print(f"⚠️ Usuario 1 ya existe o error: {r1.status_code}")
    except Exception as e:
        print(f"❌ Error creando usuario 1: {e}")
        return
    
    try:
        r2 = requests.post(f"{BASE_URL}/auth/register", json=usuario2_data)
        if r2.status_code == 201:
            print(f"✅ Usuario 2 creado: {usuario2_data['nombre_completo']}")
        else:
            print(f"⚠️ Usuario 2 ya existe o error: {r2.status_code}")
    except Exception as e:
        print(f"❌ Error creando usuario 2: {e}")
        return
    
    # 2. Login de ambos usuarios
    print("\n2️⃣ OBTENIENDO TOKENS...")
    
    login1 = requests.post(f"{BASE_URL}/auth/login", 
                          data={"username": usuario1_data['email'], "password": usuario1_data['password']})
    
    if login1.status_code != 200:
        print(f"❌ Error login usuario 1: {login1.status_code}")
        print(login1.text)
        return
    
    token1 = login1.json()['access_token']
    headers1 = {"Authorization": f"Bearer {token1}"}
    print(f"✅ Token usuario 1 obtenido")
    
    login2 = requests.post(f"{BASE_URL}/auth/login",
                          data={"username": usuario2_data['email'], "password": usuario2_data['password']})
    
    if login2.status_code != 200:
        print(f"❌ Error login usuario 2: {login2.status_code}")
        return
    
    token2 = login2.json()['access_token']
    headers2 = {"Authorization": f"Bearer {token2}"}
    print(f"✅ Token usuario 2 obtenido")
    
    # Obtener IDs de usuarios
    me1 = requests.get(f"{BASE_URL}/auth/me", headers=headers1).json()
    me2 = requests.get(f"{BASE_URL}/auth/me", headers=headers2).json()
    user1_id = me1['id']
    user2_id = me2['id']
    
    print(f"Usuario 1 ID: {user1_id}")
    print(f"Usuario 2 ID: {user2_id}")
    
    # 3. Usuario 1 crea un artículo
    print("\n3️⃣ CREANDO ARTÍCULO...")
    
    articulo_data = {
        "titulo": "Laptop Dell XPS 13",
        "descripcion": "Laptop en excelente estado, apenas usada",
        "categoria": "Electrónica",
        "condicion": "Como Nuevo",
        "valor_estimado": 800.0
    }
    
    r_art = requests.post(f"{BASE_URL}/articulos/", json=articulo_data, headers=headers1)
    if r_art.status_code == 201:
        articulo = r_art.json()
        print(f"✅ Artículo creado: {articulo['titulo']} (ID: {articulo['id']})")
    else:
        print(f"❌ Error creando artículo: {r_art.status_code}")
        print(r_art.text)
        return
    
    # 4. Usuario 2 lista artículos (debe ver el del usuario 1)
    print("\n4️⃣ LISTANDO ARTÍCULOS PÚBLICOS...")
    
    r_list = requests.get(f"{BASE_URL}/articulos/", headers=headers2)
    if r_list.status_code == 200:
        articulos = r_list.json()
        print(f"✅ Artículos visibles: {len(articulos)}")
        
        # Verificar que el artículo del usuario 1 está visible
        encontrado = any(a['id'] == articulo['id'] for a in articulos)
        if encontrado:
            print(f"✅ El artículo del Usuario 1 es visible para Usuario 2")
        else:
            print(f"❌ El artículo del Usuario 1 NO es visible para Usuario 2")
    else:
        print(f"❌ Error listando artículos: {r_list.status_code}")
    
    # 5. Usuario 2 envía mensaje a Usuario 1
    print("\n5️⃣ ENVIANDO MENSAJE...")
    
    mensaje_data = {
        "destinatario_id": user1_id,
        "contenido": f"Hola! Me interesa tu artículo: {articulo['titulo']}"
    }
    
    r_msg = requests.post(f"{BASE_URL}/mensajes/", json=mensaje_data, headers=headers2)
    if r_msg.status_code == 200:
        mensaje = r_msg.json()
        print(f"✅ Mensaje enviado: {mensaje['contenido'][:50]}...")
    else:
        print(f"❌ Error enviando mensaje: {r_msg.status_code}")
        print(r_msg.text)
        return
    
    # 6. Usuario 1 lista conversaciones
    print("\n6️⃣ LISTANDO CONVERSACIONES (Usuario 1)...")
    
    r_conv = requests.get(f"{BASE_URL}/mensajes/conversaciones", headers=headers1)
    if r_conv.status_code == 200:
        conversaciones = r_conv.json()
        print(f"✅ Conversaciones: {len(conversaciones)}")
        for conv in conversaciones:
            print(f"   - Con: {conv['otro_usuario_nombre']} | No leídos: {conv['mensajes_no_leidos']}")
    else:
        print(f"❌ Error listando conversaciones: {r_conv.status_code}")
    
    # 7. Usuario 1 lee la conversación con Usuario 2
    print("\n7️⃣ LEYENDO CONVERSACIÓN...")
    
    r_chat = requests.get(f"{BASE_URL}/mensajes/conversacion/{user2_id}", headers=headers1)
    if r_chat.status_code == 200:
        mensajes = r_chat.json()
        print(f"✅ Mensajes en conversación: {len(mensajes)}")
        for msg in mensajes:
            remitente = "Usuario 1" if msg['remitente_id'] == user1_id else "Usuario 2"
            print(f"   [{remitente}]: {msg['contenido'][:50]}...")
    else:
        print(f"❌ Error leyendo conversación: {r_chat.status_code}")
    
    # 8. Usuario 1 responde
    print("\n8️⃣ ENVIANDO RESPUESTA...")
    
    respuesta_data = {
        "destinatario_id": user2_id,
        "contenido": "¡Hola! Claro, está disponible. ¿Cuándo puedes pasar a verla?"
    }
    
    r_resp = requests.post(f"{BASE_URL}/mensajes/", json=respuesta_data, headers=headers1)
    if r_resp.status_code == 200:
        print(f"✅ Respuesta enviada")
    else:
        print(f"❌ Error enviando respuesta: {r_resp.status_code}")
    
    # 9. Usuario 2 lista sus conversaciones
    print("\n9️⃣ LISTANDO CONVERSACIONES (Usuario 2)...")
    
    r_conv2 = requests.get(f"{BASE_URL}/mensajes/conversaciones", headers=headers2)
    if r_conv2.status_code == 200:
        conversaciones2 = r_conv2.json()
        print(f"✅ Conversaciones: {len(conversaciones2)}")
        for conv in conversaciones2:
            print(f"   - Con: {conv['otro_usuario_nombre']} | No leídos: {conv['mensajes_no_leidos']}")
    else:
        print(f"❌ Error listando conversaciones: {r_conv2.status_code}")
    
    print("\n" + "=" * 60)
    print("✅ TEST COMPLETADO")
    print("=" * 60)


if __name__ == "__main__":
    print("⚠️ ASEGÚRATE DE QUE EL BACKEND ESTÉ CORRIENDO")
    print("   python backend/app/main.py")
    print()
    input("Presiona ENTER para continuar...")
    test_mensajeria()
