"""
Script de prueba para crear mensajes y conversaciones de ejemplo
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.database import Base
from app.models.user import User
from app.models.articulo import Articulo, EstadoArticulo
from app.models.propuesta import Propuesta, EstadoPropuesta
from app.models.mensaje import Mensaje, TipoMensaje
from datetime import datetime, timedelta

# Conectar a la BD
engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # Obtener los dos primeros usuarios
    users = db.query(User).limit(2).all()
    
    if len(users) < 2:
        print("[ERROR] Se necesitan al menos 2 usuarios en la BD")
        exit()
    
    user1 = users[0]
    user2 = users[1]
    
    print("[INFO] Usuario 1: {} (ID: {})".format(user1.email, user1.id))
    print("[INFO] Usuario 2: {} (ID: {})".format(user2.email, user2.id))
    
    # Crear un artículo para user1 si no existe
    articulo_user1 = db.query(Articulo).filter(Articulo.propietario_id == user1.id).first()
    if not articulo_user1:
        articulo_user1 = Articulo(
            propietario_id=user1.id,
            titulo="Bicicleta de montaña",
            descripcion="Bicicleta en buen estado",
            estado_articulo=EstadoArticulo.DISPONIBLE,
            imagen_url="default.jpg"
        )
        db.add(articulo_user1)
        db.commit()
        print("[OK] Articulo creado para User1: {}".format(articulo_user1.titulo))
    
    # Crear un artículo para user2 si no existe
    articulo_user2 = db.query(Articulo).filter(Articulo.propietario_id == user2.id).first()
    if not articulo_user2:
        articulo_user2 = Articulo(
            propietario_id=user2.id,
            titulo="Laptop",
            descripcion="Laptop en buen estado",
            estado_articulo=EstadoArticulo.DISPONIBLE,
            imagen_url="default.jpg"
        )
        db.add(articulo_user2)
        db.commit()
        print("[OK] Articulo creado para User2: {}".format(articulo_user2.titulo))
    
    # Crear una propuesta: user2 ofrece su laptop por la bicicleta de user1
    propuesta = db.query(Propuesta).filter(
        Propuesta.articulo_ofrecido_id == articulo_user2.id,
        Propuesta.usuario_ofertante_id == user2.id,
        Propuesta.usuario_receptor_id == user1.id
    ).first()
    
    if not propuesta:
        propuesta = Propuesta(
            articulo_ofrecido_id=articulo_user2.id,
            articulo_solicitado_id=articulo_user1.id,
            usuario_ofertante_id=user2.id,
            usuario_receptor_id=user1.id,
            estado=EstadoPropuesta.PENDIENTE
        )
        db.add(propuesta)
        db.commit()
        print("[OK] Propuesta creada: {}".format(propuesta.id))
    
    # Crear mensajes de prueba
    mensajes_existentes = db.query(Mensaje).filter(
        ((Mensaje.remitente_id == user1.id) & (Mensaje.destinatario_id == user2.id)) |
        ((Mensaje.remitente_id == user2.id) & (Mensaje.destinatario_id == user1.id))
    ).count()
    
    if mensajes_existentes == 0:
        msg1 = Mensaje(
            remitente_id=user2.id,
            destinatario_id=user1.id,
            contenido="¡Hola! Me interesa tu bicicleta, ¿está disponible?",
            tipo=TipoMensaje.USER,
            propuesta_id=propuesta.id,
            created_at=datetime.utcnow() - timedelta(hours=2),
            leido=False
        )
        
        msg2 = Mensaje(
            remitente_id=user1.id,
            destinatario_id=user2.id,
            contenido="¡Claro! Está en perfectas condiciones",
            tipo=TipoMensaje.USER,
            propuesta_id=propuesta.id,
            created_at=datetime.utcnow() - timedelta(hours=1),
            leido=False
        )
        
        msg3 = Mensaje(
            remitente_id=user2.id,
            destinatario_id=user1.id,
            contenido="Excelente, ¿cuándo podemos hacer el intercambio?",
            tipo=TipoMensaje.USER,
            propuesta_id=propuesta.id,
            created_at=datetime.utcnow(),
            leido=False
        )
        
        db.add_all([msg1, msg2, msg3])
        db.commit()
        print("[OK] Mensajes de prueba creados")
    else:
        print("[OK] Ya existen mensajes entre estos usuarios")
    
    print("\n[SUCCESS] Datos de prueba cargados exitosamente")
    print("[INFO] Inicia sesion con: {}".format(user1.email))
    print("[INFO] Deberias ver una conversacion con: {}".format(user2.nombre_completo))
    
except Exception as e:
    print("[ERROR] {}".format(str(e)))
    import traceback
    traceback.print_exc()
finally:
    db.close()
