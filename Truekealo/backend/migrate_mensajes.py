from app.database import engine
from sqlalchemy import text

conn = engine.connect()

try:
    # Agregar columna tipo
    conn.execute(text("ALTER TABLE mensajes ADD COLUMN tipo VARCHAR(10) DEFAULT 'user' NOT NULL"))
    print("Columna 'tipo' agregada")
    
    # Agregar columna propuesta_id
    conn.execute(text("ALTER TABLE mensajes ADD COLUMN propuesta_id INTEGER"))
    print("Columna 'propuesta_id' agregada")
    
    # Agregar constraint
    conn.execute(text("ALTER TABLE mensajes ADD CONSTRAINT fk_propuesta FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE SET NULL"))
    print("Foreign key agregada")
    
    conn.commit()
    print("\n✅ Migración completada exitosamente")
    
except Exception as e:
    print(f"❌ Error: {e}")
    conn.rollback()
finally:
    conn.close()
