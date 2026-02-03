"""
Script de prueba para verificar la eliminación de artículos
"""
import requests
import json

# Configuración
BASE_URL = "http://localhost:8001/api/v1"

def test_delete_articulo():
    print("=== Test de Eliminación de Artículos ===\n")
    
    # 1. Login
    print("1. Haciendo login...")
    login_data = {
        "username": "test@test.com",  # Cambia por tu usuario de prueba
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print("✅ Login exitoso")
            print(f"   Token: {token[:20]}...\n")
        else:
            print(f"❌ Error en login: {response.status_code}")
            print(f"   {response.text}")
            return
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Obtener mis artículos
    print("2. Obteniendo mis artículos...")
    try:
        response = requests.get(f"{BASE_URL}/articulos/mis-articulos", headers=headers)
        if response.status_code == 200:
            articulos = response.json()
            print(f"✅ Artículos obtenidos: {len(articulos)}")
            
            if articulos:
                print("\nArtículos disponibles:")
                for art in articulos[:3]:  # Mostrar solo los primeros 3
                    print(f"   - ID: {art['id']}, Título: {art['titulo']}, Estado: {art['estado_articulo']}")
                
                # 3. Intentar eliminar el primer artículo de prueba
                articulo_id = articulos[0]['id']
                print(f"\n3. Intentando eliminar artículo ID: {articulo_id}")
                
                response = requests.delete(f"{BASE_URL}/articulos/{articulo_id}", headers=headers)
                print(f"   Status Code: {response.status_code}")
                
                if response.status_code == 204:
                    print("✅ Artículo eliminado correctamente (204 No Content)")
                    
                    # 4. Verificar que se eliminó
                    print("\n4. Verificando eliminación...")
                    response = requests.get(f"{BASE_URL}/articulos/{articulo_id}", headers=headers)
                    if response.status_code == 404:
                        print("✅ Confirmado: artículo no existe (404)")
                    else:
                        print(f"⚠️  Artículo aún existe: {response.status_code}")
                elif response.status_code == 403:
                    print("❌ Sin permiso para eliminar (403 Forbidden)")
                elif response.status_code == 404:
                    print("❌ Artículo no encontrado (404)")
                else:
                    print(f"❌ Error al eliminar: {response.status_code}")
                    print(f"   {response.text}")
            else:
                print("⚠️  No hay artículos para probar")
        else:
            print(f"❌ Error al obtener artículos: {response.status_code}")
            print(f"   {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_delete_articulo()
