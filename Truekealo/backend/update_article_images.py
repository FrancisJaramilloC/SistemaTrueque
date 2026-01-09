#!/usr/bin/env python
"""
Script para actualizar las imágenes de artículos en la base de datos
Busca los archivos de imagen en la carpeta de uploads y los asocia con los artículos correspondientes
"""

import os
import re
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models.articulo import Articulo
from app.core.config import settings

# Crear conexión a la base de datos
engine = create_engine(settings.DATABASE_URL)

# Directorio de uploads
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "articulos")

def update_article_images():
    """Actualiza las imágenes de artículos en la base de datos"""
    
    if not os.path.exists(UPLOAD_DIR):
        print(f"❌ Directorio de uploads no existe: {UPLOAD_DIR}")
        return
    
    # Obtener lista de archivos
    image_files = os.listdir(UPLOAD_DIR)
    print(f"📁 Encontrados {len(image_files)} archivos en uploads/articulos/")
    
    # Patrón: articulo_{id}_{timestamp}_{random}.{ext}
    pattern = r"articulo_(\d+)_"
    
    with Session(engine) as session:
        for filename in image_files:
            match = re.match(pattern, filename)
            if match:
                articulo_id = int(match.group(1))
                image_url = f"/uploads/articulos/{filename}"
                
                # Actualizar artículo
                articulo = session.query(Articulo).filter(Articulo.id == articulo_id).first()
                
                if articulo:
                    if articulo.imagen_url is None:
                        articulo.imagen_url = image_url
                        session.commit()
                        print(f"✅ Artículo {articulo_id}: {image_url}")
                    else:
                        print(f"⚠️  Artículo {articulo_id}: Ya tiene imagen: {articulo.imagen_url}")
                else:
                    print(f"❌ Artículo {articulo_id}: No encontrado en BD")
            else:
                print(f"⚠️  Archivo no coincide con patrón: {filename}")
    
    print("\n✨ Actualización completada")

if __name__ == "__main__":
    update_article_images()
