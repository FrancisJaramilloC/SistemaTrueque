"""
Script de verificación de salud del proyecto Truekealo
Verifica que todos los componentes estén correctamente configurados
"""
import os
import sys
from pathlib import Path

# Colores para terminal
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

def check_file(path, description):
    """Verifica si un archivo existe"""
    if os.path.exists(path):
        print(f"{GREEN}✅{RESET} {description}: {path}")
        return True
    else:
        print(f"{RED}❌{RESET} {description}: {path} - NO ENCONTRADO")
        return False

def check_directory(path, description):
    """Verifica si un directorio existe"""
    if os.path.isdir(path):
        print(f"{GREEN}✅{RESET} {description}: {path}")
        return True
    else:
        print(f"{RED}❌{RESET} {description}: {path} - NO ENCONTRADO")
        return False

def main():
    print("\n" + "="*60)
    print("🔍 Verificación de Salud del Proyecto Truekealo")
    print("="*60 + "\n")
    
    # Directorio raíz del proyecto (subir dos niveles desde backend/scripts/)
    project_root = Path(__file__).parent.parent.parent
    backend_root = project_root / "backend"
    
    issues = 0
    warnings = 0
    
    # Verificar estructura de directorios
    print("📁 Estructura de Directorios:")
    issues += not check_directory(backend_root, "Backend")
    issues += not check_directory(backend_root / "app", "App Backend")
    issues += not check_directory(backend_root / "tests", "Tests")
    issues += not check_directory(backend_root / "scripts", "Scripts")
    issues += not check_directory(project_root / "frontend", "Frontend")
    issues += not check_directory(project_root / "docs", "Documentación")
    issues += not check_directory(project_root / "uploads", "Uploads")
    
    print("\n📄 Archivos Esenciales:")
    issues += not check_file(project_root / ".gitignore", ".gitignore")
    issues += not check_file(project_root / ".env.example", ".env.example")
    issues += not check_file(project_root / "README.md", "README principal")
    issues += not check_file(backend_root / "requirements.txt", "Requirements")
    issues += not check_file(backend_root / "init_db.py", "Init DB")
    
    print("\n🔐 Configuración de Seguridad:")
    env_file = backend_root / ".env"
    if check_file(env_file, "Archivo .env"):
        # Verificar contenido básico del .env
        with open(env_file, 'r') as f:
            content = f.read()
            if "CHANGE_THIS_SECRET_KEY" in content or "tu_secret_key" in content:
                print(f"{YELLOW}⚠️{RESET}  SECRET_KEY parece ser el valor por defecto. Cámbialo!")
                warnings += 1
            else:
                print(f"{GREEN}✅{RESET} SECRET_KEY configurada")
    else:
        print(f"{RED}❌{RESET} Archivo .env no encontrado. Cópialo desde .env.example")
        issues += 1
    
    print("\n📦 Módulos de Python:")
    backend_modules = [
        ("app/core", "Core"),
        ("app/models", "Models"),
        ("app/routers", "Routers"),
        ("app/schemas", "Schemas"),
    ]
    for module, name in backend_modules:
        issues += not check_directory(backend_root / module, name)
    
    print("\n🌐 Frontend:")
    frontend_files = [
        ("assets/css/app.css", "CSS Principal"),
        ("assets/js/app.js", "JS Principal"),
        ("assets/js/api-client.js", "API Client"),
        ("templates/login.html", "Login Page"),
        ("templates/dashboard.html", "Dashboard"),
    ]
    for file, name in frontend_files:
        issues += not check_file(project_root / "frontend" / file, name)
    
    # Resumen
    print("\n" + "="*60)
    if issues == 0 and warnings == 0:
        print(f"{GREEN}✅ ¡Todo perfecto! El proyecto está bien configurado.{RESET}")
        return 0
    elif issues == 0:
        print(f"{YELLOW}⚠️  Hay {warnings} advertencia(s) pero el proyecto funcional.{RESET}")
        return 0
    else:
        print(f"{RED}❌ Encontrados {issues} problema(s) y {warnings} advertencia(s).{RESET}")
        print(f"{YELLOW}Por favor, revisa los errores arriba y corrige.{RESET}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
