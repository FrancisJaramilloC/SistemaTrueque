from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Actualizar todos los mensajes con tipo 'user' a 'USER'
    result = db.execute(text("UPDATE mensajes SET tipo = 'USER' WHERE tipo = 'user'"))
    db.commit()
    print("[OK] {} mensajes actualizados a tipo 'USER'".format(result.rowcount))
    
except Exception as e:
    print("[ERROR] {}".format(str(e)))
    import traceback
    traceback.print_exc()
finally:
    db.close()
