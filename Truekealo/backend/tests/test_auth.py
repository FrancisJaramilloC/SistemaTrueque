"""
Script de prueba para verificar el registro y login de usuarios
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Crear engine y sesión
engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("="*60)
print("🧪 Prueba de Registro y Login de Usuarios")
print("="*60)

# Datos de prueba
test_email = "usuario@test.com"
test_password = "12345678"
test_nombre = "Usuario Prueba"

try:
    from app.models.user import User
    from app.core.security import get_password_hash, verify_password
    
    # Limpiar usuario de prueba si existe
    existing_user = db.query(User).filter(User.email == test_email).first()
    if existing_user:
        print(f"\n🗑️ Eliminando usuario existente: {test_email}")
        db.delete(existing_user)
        db.commit()
    
    # 1. REGISTRO
    print(f"\n📝 1. Registrando usuario: {test_email}")
    print(f"   Contraseña: {test_password}")
    
    hashed_password = get_password_hash(test_password)
    print(f"   ✅ Hash generado correctamente")
    
    new_user = User(
        email=test_email,
        nombre_completo=test_nombre,
        hashed_password=hashed_password,
        telefono="555-1234",
        ubicacion="Ciudad"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"   ✅ Usuario registrado con ID: {new_user.id}")
    
    # 2. LOGIN - Verificar contraseña
    print(f"\n🔐 2. Verificando login...")
    user_in_db = db.query(User).filter(User.email == test_email).first()
    
    if user_in_db:
        print(f"   Usuario encontrado: {user_in_db.email}")
        
        # Verificar contraseña
        is_valid = verify_password(test_password, user_in_db.hashed_password)
        
        if is_valid:
            print(f"   ✅ Contraseña verificada correctamente - LOGIN EXITOSO")
        else:
            print(f"   ❌ Error: La contraseña no coincide - LOGIN FALLIDO")
            print(f"   Password ingresado: {test_password}")
    else:
        print(f"   ❌ Error: Usuario no encontrado en la BD")
    
    # 3. PROBAR CON CONTRASEÑA INCORRECTA
    print(f"\n🔒 3. Probando con contraseña incorrecta...")
    is_valid_wrong = verify_password("wrongpassword", user_in_db.hashed_password)
    if not is_valid_wrong:
        print(f"   ✅ Correctamente rechazó la contraseña incorrecta")
    else:
        print(f"   ❌ Error: Aceptó una contraseña incorrecta")
    
    # 4. LISTAR TODOS LOS USUARIOS
    print(f"\n👥 4. Usuarios en la base de datos:")
    all_users = db.query(User).all()
    for user in all_users:
        print(f"   - ID: {user.id} | Email: {user.email} | Nombre: {user.nombre_completo}")
    
    print("\n" + "="*60)
    print("✅ Prueba completada exitosamente")
    print("="*60)
    print("\n💡 Ahora puedes intentar:")
    print(f"   Email: {test_email}")
    print(f"   Password: {test_password}")
    
except Exception as e:
    print(f"\n❌ Error durante la prueba:")
    print(f"   {str(e)}")
    import traceback
    traceback.print_exc()

finally:
    db.close()
