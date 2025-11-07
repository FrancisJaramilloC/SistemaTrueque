from sqlalchemy import text
from config.db import engine

print("🔧 Actualizando base de datos...")

# Lista de columnas a agregar
columnas = [
    ("imagen_url", "VARCHAR(500) NULL"),
    ("thumbnail_url", "VARCHAR(500) NULL")
]

with engine.begin() as conn:
    for columna, tipo in columnas:
        try:
            # Intentar agregar la columna
            sql = f"ALTER TABLE articulos ADD COLUMN {columna} {tipo};"
            conn.execute(text(sql))
            print(f"✅ Columna '{columna}' agregada correctamente")
        except Exception as e:
            # Si la columna ya existe, ignorar el error
            if "Duplicate column name" in str(e) or "duplicate column" in str(e).lower():
                print(f"⚠️  Columna '{columna}' ya existe, saltando...")
            else:
                print(f"❌ Error al agregar '{columna}': {e}")

print("\n✅ Proceso completado!")
