from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.mensaje import Mensaje
from app.models.user import User

engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    user1 = db.query(User).filter(User.email == "riofrio.2013.23@gmail.com").first()
    user2 = db.query(User).filter(User.email == "mallalisbeth146@gmail.com").first()
    
    print("[INFO] User1 (ID {}): {}".format(user1.id if user1 else "N/A", user1.email if user1 else "Not found"))
    print("[INFO] User2 (ID {}): {}".format(user2.id if user2 else "N/A", user2.email if user2 else "Not found"))
    
    if user1:
        mensajes = db.query(Mensaje).filter(
            ((Mensaje.remitente_id == user1.id) & (Mensaje.destinatario_id == user2.id)) |
            ((Mensaje.remitente_id == user2.id) & (Mensaje.destinatario_id == user1.id))
        ).all()
        
        print("\n[INFO] Total de mensajes entre usuarios: {}".format(len(mensajes)))
        for msg in mensajes:
            print("  - De: {} | Para: {} | Contenido: {}".format(msg.remitente_id, msg.destinatario_id, msg.contenido[:50]))
    
    if user1:
        conversaciones_count = db.query(Mensaje).filter(
            (Mensaje.remitente_id == user1.id) | (Mensaje.destinatario_id == user1.id)
        ).count()
        print("\n[INFO] Total de mensajes para User1: {}".format(conversaciones_count))
        
except Exception as e:
    print("[ERROR] {}".format(str(e)))
    import traceback
    traceback.print_exc()
finally:
    db.close()
