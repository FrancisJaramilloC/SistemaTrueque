#!/usr/bin/env python3
"""
Script rápido de verificación sin dependencias externas
Solo usa urllib que viene incluido en Python
"""

import urllib.request
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

def print_status(message, status="INFO"):
    """Imprimir estado con timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    icons = {
        "✅": "✅",
        "❌": "❌",
        "⚠️": "⚠️",
        "ℹ️": "ℹ️"
    }
    print(f"[{timestamp}] {status} {message}")

def check_backend():
    """Verificar que el backend está en línea"""
    print_status("Verificando backend...", "⚠️")
    
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/v1/articulos/",
            method='GET'
        )
        
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                print_status(f"✅ Backend en línea - Artículos encontrados: {len(data) if isinstance(data, list) else 'N/A'}", "✅")
                return True
            else:
                print_status(f"⚠️ Backend respondió con status {response.status}", "⚠️")
                return True
                
    except urllib.error.URLError as e:
        print_status(f"❌ No se pudo conectar al backend: {e.reason}", "❌")
        print_status("Asegúrate de ejecutar: uvicorn app.main:app --reload", "ℹ️")
        return False
    except Exception as e:
        print_status(f"❌ Error: {str(e)}", "❌")
        return False

def check_database():
    """Verificar que la base de datos tiene datos"""
    print_status("Verificando datos en la base de datos...", "⚠️")
    
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/v1/articulos/",
            method='GET'
        )
        
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            
            if isinstance(data, list):
                if len(data) > 0:
                    print_status(f"✅ Base de datos contiene {len(data)} artículos", "✅")
                else:
                    print_status(f"✅ Base de datos accesible pero sin artículos (Esperado para usuarios nuevos)", "✅")
                return True
            else:
                print_status(f"⚠️ Formato inesperado de datos", "⚠️")
                return True
                
    except Exception as e:
        print_status(f"❌ Error accediendo a datos: {str(e)}", "❌")
        return False

def main():
    print("\n" + "="*60)
    print("🧪 VERIFICACIÓN RÁPIDA DEL SISTEMA TRUEKEALO")
    print("="*60 + "\n")
    
    checks = [
        check_backend,
        check_database,
    ]
    
    results = []
    for check in checks:
        try:
            results.append(check())
        except Exception as e:
            print_status(f"Error en prueba: {str(e)}", "❌")
            results.append(False)
    
    print("\n" + "="*60)
    print("📊 RESUMEN")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Verificaciones pasadas: {passed}/{total}\n")
    
    if passed == total:
        print("✅ ¡El sistema está operativo!")
        print("\n🚀 Siguientes pasos:")
        print("1. Abre http://localhost:5500 en tu navegador")
        print("2. Inicia sesión o crea una nueva cuenta")
        print("3. Verifica la consola del navegador (F12) para logs detallados")
        print("4. Prueba publicar un artículo")
        print("5. Verifica que aparezca en 'Mis Artículos' y en 'Explorar'")
    else:
        print("❌ Hay problemas en el sistema. Revisa los errores arriba.")
        print("\n📝 Checklist de startup:")
        print("  [ ] Backend ejecutándose: uvicorn app.main:app --reload")
        print("  [ ] Frontend ejecutándose: python -m http.server 5500")
        print("  [ ] MariaDB en línea (puerto 3307)")
        print("  [ ] Database 'truekealo_db' creada")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
