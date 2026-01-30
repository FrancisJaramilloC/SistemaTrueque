"""
Script para resetear la contraseña de un usuario
Uso: python resetear_password.py EMAIL NUEVA_CONTRASEÑA
"""
import sys
from app.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

if len(sys.argv) < 3:
    print("❌ Uso: python resetear_password.py EMAIL NUEVA_CONTRASEÑA")
    print("Ejemplo: python resetear_password.py user@example.com MiNueva123")
    sys.exit(1)

email = sys.argv[1]
new_password = sys.argv[2]

db = SessionLocal()

# Buscar el usuario
user = db.query(User).filter(User.email == email).first()

if not user:
    print(f"❌ Usuario con email '{email}' no encontrado")
    db.close()
    sys.exit(1)

# Actualizar la contraseña
user.hashed_password = get_password_hash(new_password)
db.commit()

print(f"✅ Contraseña actualizada exitosamente para {user.nombre_completo}")
print(f"   Email: {email}")
print(f"   Nueva contraseña: {new_password}")
print("\nAhora puedes iniciar sesión con estas credenciales.")

db.close()
