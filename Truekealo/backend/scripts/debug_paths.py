#!/usr/bin/env python3
"""
Debug de rutas en FastAPI
"""
import os
from pathlib import Path
import sys

# Simular lo que hace main.py
print("🔍 DEBUG DE RUTAS")
print("="*60)

# Cuando se ejecuta desde backend/
cwd = os.getcwd()
print(f"Current working directory: {cwd}")

# Simular main.py
main_file = os.path.join(cwd, "app", "main.py")
print(f"\nAsumiendo main.py en: {main_file}")

if os.path.exists(main_file):
    base_dir = Path(main_file).resolve().parent.parent.parent
    print(f"BASE_DIR calculado (3 parents): {base_dir}")
    
    uploads_dir = os.path.join(base_dir, "uploads")
    print(f"UPLOADS_DIR: {uploads_dir}")
    
    if os.path.exists(uploads_dir):
        print(f"✅ UPLOADS_DIR existe")
        
        articulos_dir = os.path.join(uploads_dir, "articulos")
        if os.path.exists(articulos_dir):
            files = os.listdir(articulos_dir)
            print(f"✅ Archivos en uploads/articulos: {len(files)}")
            for f in files[:3]:
                print(f"   - {f}")
        else:
            print(f"❌ {articulos_dir} NO existe")
    else:
        print(f"❌ {uploads_dir} NO existe")
else:
    print(f"❌ main.py no encontrado en {main_file}")
    print("\n💡 Asegúrate de estar en el directorio backend/")
    print("   Y que app/ sea una subcarpeta de backend/")

print("\n" + "="*60)
print("Para acceder a las imágenes:")
print(f"URL: http://localhost:8000/uploads/articulos/[nombre_archivo]")
