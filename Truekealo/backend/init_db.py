"""
Script para inicializar la base de datos
Crea todas las tablas definidas en los modelos
"""
import sys
from pathlib import Path

# Agregar el directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from app.core.config import settings

# Importar Base y modelos directamente
from app.database import Base
from app.models import user, articulo, propuesta, mensaje

# Crear engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
    pool_recycle=3600
)

print("="*60)
print(" Inicializando base de datos Truekealo...")
print("="*60)

try:
    # Verificar conexión
    with engine.connect() as conn:
        result = conn.execute(text("SELECT DATABASE()"))
        db_name = result.scalar()
        print(f"✅ Conectado a la base de datos: {db_name}")
    
    # Crear todas las tablas
    print("\n📦 Creando tablas...")
    Base.metadata.create_all(bind=engine)
    
    # Verificar tablas creadas
    with engine.connect() as conn:
        result = conn.execute(text("SHOW TABLES"))
        tables = [row[0] for row in result]
        
    print(f"\n✅ Se crearon {len(tables)} tablas:")
    for table in tables:
        print(f"   - {table}")
    
    print("\n" + "="*60)
    print("✅ Base de datos inicializada correctamente")
    print("="*60)
    
except Exception as e:
    print(f"\n❌ Error al inicializar la base de datos:")
    print(f"   {str(e)}")
    print("\nVerifica que:")
    print("  1. MariaDB esté corriendo")
    print("  2. Las credenciales en .env sean correctas")
    print("  3. La base de datos 'truekealo_db' exista")
