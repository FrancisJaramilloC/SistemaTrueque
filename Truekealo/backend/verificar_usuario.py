"""
Script para verificar usuarios en la base de datos
"""
from app.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password, get_password_hash

db = SessionLocal()

# Buscar todos los usuarios
print("\n" + "="*60)
print("USUARIOS EN LA BASE DE DATOS")
print("="*60)

usuarios = db.query(User).all()

if not usuarios:
    print("❌ No hay usuarios en la base de datos")
else:
    for user in usuarios:
        print(f"\n👤 Usuario ID: {user.id}")
        print(f"   Nombre: {user.nombre_completo}")
        print(f"   Email: {user.email}")
        print(f"   Activo: {user.is_active}")
        print(f"   Hash: {user.hashed_password[:50]}...")

# Buscar el usuario específico
print("\n" + "="*60)
print("VERIFICANDO USUARIO: jose.f.riofrio@unl.edu.ec")
print("="*60)

user = db.query(User).filter(User.email == "jose.f.riofrio@unl.edu.ec").first()

if user:
    print(f"✅ Usuario encontrado")
    print(f"   ID: {user.id}")
    print(f"   Nombre: {user.nombre_completo}")
    print(f"   Email: {user.email}")
    print(f"   Activo: {user.is_active}")
    print(f"   Hash almacenado: {user.hashed_password[:50]}...")
    
    # Probar diferentes contraseñas comunes
    passwords_to_test = ["12345678", "password", "test1234", "admin123", "jose123"]
    
    print("\n🔍 Probando contraseñas comunes:")
    for pwd in passwords_to_test:
        if verify_password(pwd, user.hashed_password):
            print(f"   ✅ La contraseña es: {pwd}")
            break
    else:
        print("   ❌ Ninguna contraseña común funcionó")
        print("\n💡 Para resetear la contraseña, ejecuta:")
        print(f"   python resetear_password.py {user.email} NUEVA_CONTRASEÑA")
else:
    print("❌ Usuario NO encontrado")
    print("\n💡 Para crear el usuario, regístralo desde el frontend")

db.close()
print("\n" + "="*60)
