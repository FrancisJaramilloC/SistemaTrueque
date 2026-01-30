from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.user import User
from app.core.security import get_password_hash

engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    user = db.query(User).filter(User.email == "riofrio.2013.23@gmail.com").first()
    
    if user:
        nueva_contraseña = "123456"
        user.hashed_password = get_password_hash(nueva_contraseña)
        db.commit()
        print("[OK] Contraseña actualizada para: {}".format(user.email))
        print("[INFO] Usuario: {}".format(user.email))
        print("[INFO] Contraseña: {}".format(nueva_contraseña))
    else:
        print("[ERROR] Usuario no encontrado")
        
except Exception as e:
    print("[ERROR] {}".format(str(e)))
    import traceback
    traceback.print_exc()
finally:
    db.close()
