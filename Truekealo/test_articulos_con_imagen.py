#!/usr/bin/env python3
"""
Script de prueba para crear artículos con imágenes
Verifica que el sistema de carga de imágenes funciona correctamente
"""

import requests
import json
import os
import sys
from pathlib import Path
from io import BytesIO
from PIL import Image
import uuid

# Configuración
API_BASE = "http://localhost:8000/api/v1"
# Usar un email único cada vez que se ejecuta el test
USER_EMAIL = f"test{uuid.uuid4().hex[:8]}@example.com"
USER_PASSWORD = "testpass123"

# Colores para output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def print_info(msg):
    print(f"{BLUE}ℹ️  {msg}{RESET}")

def print_warning(msg):
    print(f"{YELLOW}⚠️  {msg}{RESET}")

def create_test_image():
    """Crea una imagen PNG de prueba pequeña"""
    print_info("Creando imagen de prueba...")
    
    # Crear imagen de 100x100 píxeles
    img = Image.new('RGB', (100, 100), color='red')
    
    # Guardar en archivo temporal
    img_path = "test_image.png"
    img.save(img_path)
    
    print_success(f"Imagen creada: {img_path}")
    return img_path

def register_user(email, password):
    """Registra un nuevo usuario"""
    print_info(f"Registrando usuario: {email}...")
    
    response = requests.post(
        f"{API_BASE}/auth/register",
        json={
            "email": email,
            "password": password,
            "nombre_completo": "Usuario Prueba"
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        print_success(f"Usuario registrado. ID: {data.get('id')}")
        return True
    elif response.status_code == 400:
        print_warning(f"El usuario ya existe: {email}")
        return True
    else:
        print_error(f"Error al registrar: {response.text}")
        return False

def login_user(email, password):
    """Realiza login y obtiene el token"""
    print_info(f"Iniciando sesión como: {email}...")
    
    response = requests.post(
        f"{API_BASE}/auth/login",
        json={"email": email, "password": password}
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        print_success(f"Sesión iniciada. Token obtenido")
        return token
    else:
        print_error(f"Error al iniciar sesión: {response.text}")
        return None

def create_articulo(token, titulo, descripcion, categoria, condicion, valor_estimado):
    """Crea un artículo en el sistema"""
    print_info(f"Creando artículo: {titulo}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.post(
        f"{API_BASE}/articulos/",
        headers=headers,
        json={
            "titulo": titulo,
            "descripcion": descripcion,
            "categoria": categoria,
            "condicion": condicion,
            "valor_estimado": valor_estimado
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        articulo_id = data.get("id")
        print_success(f"Artículo creado. ID: {articulo_id}")
        return articulo_id
    else:
        print_error(f"Error al crear artículo: {response.text}")
        return None

def upload_image(token, articulo_id, image_path):
    """Carga una imagen para un artículo"""
    print_info(f"Subiendo imagen para artículo {articulo_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(image_path, "rb") as f:
        # Especificar el tipo MIME correctamente
        files = {"file": ("test_image.png", f, "image/png")}
        response = requests.post(
            f"{API_BASE}/articulos/{articulo_id}/imagen",
            headers=headers,
            files=files
        )
    
    if response.status_code == 200:
        data = response.json()
        imagen_url = data.get("imagen_url")
        print_success(f"Imagen subida correctamente")
        print_success(f"URL de imagen: {imagen_url}")
        return True
    else:
        print_error(f"Error al subir imagen: {response.text}")
        return False

def get_articulo(token, articulo_id):
    """Obtiene los detalles de un artículo"""
    print_info(f"Obteniendo detalles del artículo {articulo_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{API_BASE}/articulos/{articulo_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print_success("Artículo recuperado")
        
        # Mostrar detalles
        print(f"\n{BLUE}═══════════════════════════════════════{RESET}")
        print(f"Título: {data.get('titulo')}")
        print(f"Descripción: {data.get('descripcion')}")
        print(f"Categoría: {data.get('categoria')}")
        print(f"Condición: {data.get('condicion')}")
        print(f"Valor estimado: {data.get('valor_estimado')}")
        print(f"Imagen URL: {data.get('imagen_url')}")
        print(f"Estado: {data.get('estado')}")
        print(f"{BLUE}═══════════════════════════════════════{RESET}\n")
        
        return data
    else:
        print_error(f"Error al obtener artículo: {response.text}")
        return None

def list_articulos(token):
    """Lista todos los artículos"""
    print_info("Listando todos los artículos...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(
        f"{API_BASE}/articulos/?limit=50",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        articulos = data if isinstance(data, list) else data.get("items", [])
        print_success(f"Se encontraron {len(articulos)} artículos")
        
        for art in articulos:
            print(f"  - {art.get('titulo')} (ID: {art.get('id')})")
            if art.get('imagen_url'):
                print(f"    Imagen: {art.get('imagen_url')}")
        
        return articulos
    else:
        print_error(f"Error al listar artículos: {response.text}")
        return []

def main():
    """Función principal de prueba"""
    print(f"\n{BLUE}╔════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BLUE}║  🧪 TEST SISTEMA: Artículos con Imágenes             ║{RESET}")
    print(f"{BLUE}╚════════════════════════════════════════════════════════╝{RESET}\n")
    
    # 1. Crear imagen de prueba
    image_path = create_test_image()
    
    # 2. Registrar usuario
    if not register_user(USER_EMAIL, USER_PASSWORD):
        print_error("No se pudo registrar el usuario")
        return False
    
    # 3. Login
    token = login_user(USER_EMAIL, USER_PASSWORD)
    if not token:
        print_error("No se pudo obtener el token")
        return False
    
    # 4. Crear primer artículo SIN imagen
    print_info("\n" + "="*50)
    print_info("Prueba 1: Crear artículo SIN imagen")
    print_info("="*50)
    
    articulo1_id = create_articulo(
        token,
        titulo="Laptop Vieja",
        descripcion="Laptop en buen estado, funciona perfectamente",
        categoria="electronica",
        condicion="Bueno",
        valor_estimado=500
    )
    
    if not articulo1_id:
        print_error("No se pudo crear el primer artículo")
        return False
    
    # Obtener detalles
    get_articulo(token, articulo1_id)
    
    # 5. Crear segundo artículo Y subir imagen
    print_info("\n" + "="*50)
    print_info("Prueba 2: Crear artículo CON imagen")
    print_info("="*50)
    
    articulo2_id = create_articulo(
        token,
        titulo="Bicicleta Deportiva",
        descripcion="Bicicleta de montaña, poco uso",
        categoria="deportes",
        condicion="Excelente",
        valor_estimado=300
    )
    
    if not articulo2_id:
        print_error("No se pudo crear el segundo artículo")
        return False
    
    # Subir imagen
    if not upload_image(token, articulo2_id, image_path):
        print_error("No se pudo subir la imagen")
        return False
    
    # Obtener detalles
    get_articulo(token, articulo2_id)
    
    # 6. Listar todos los artículos
    print_info("\n" + "="*50)
    print_info("Listando todos los artículos del usuario")
    print_info("="*50)
    
    articulos = list_articulos(token)
    
    # 7. Verificar que los archivos están guardados
    print_info("\n" + "="*50)
    print_info("Verificando archivos en el sistema")
    print_info("="*50)
    
    uploads_dir = Path("uploads/articulos")
    if uploads_dir.exists():
        files = list(uploads_dir.glob("*"))
        print_success(f"Directorio de uploads existe con {len(files)} archivo(s)")
        for f in files:
            size = f.stat().st_size
            print(f"  - {f.name} ({size} bytes)")
    else:
        print_warning("Directorio de uploads no existe")
    
    # Resumen
    print(f"\n{BLUE}╔════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BLUE}║  📊 RESUMEN DE PRUEBAS                                 ║{RESET}")
    print(f"{BLUE}╚════════════════════════════════════════════════════════╝{RESET}\n")
    
    print(f"✅ {GREEN}Artículo 1 (sin imagen): {articulo1_id}{RESET}")
    print(f"✅ {GREEN}Artículo 2 (con imagen): {articulo2_id}{RESET}")
    print(f"✅ {GREEN}Total de artículos: {len(articulos)}{RESET}")
    print(f"\n✅ {GREEN}TODAS LAS PRUEBAS PASARON{RESET}\n")
    
    # Limpiar imagen de prueba
    if os.path.exists(image_path):
        os.remove(image_path)
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Prueba interrumpida por el usuario{RESET}")
        sys.exit(1)
    except Exception as e:
        print_error(f"Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
