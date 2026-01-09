"""
Configuración de conexión a la base de datos MariaDB
Gestiona la sesión de SQLAlchemy y el engine
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# ==================== Configuración del Engine ====================
# echo=True muestra las queries SQL en consola (útil para desarrollo)
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,  # Verifica conexiones antes de usarlas
    pool_recycle=3600    # Recicla conexiones cada hora
)

# ==================== Configuración de Sesión ====================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ==================== Base para Modelos ====================
Base = declarative_base()


# ==================== Dependencia de Sesión ====================
def get_db():
    """
    Generador de sesiones de base de datos
    Se usa como dependencia en FastAPI para inyectar la sesión
    
    Yields:
        Session: Sesión de SQLAlchemy
        
    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================== Función de Inicialización ====================
def init_db():
    """
    Inicializa la base de datos creando todas las tablas
    Se debe llamar al iniciar la aplicación
    """
    Base.metadata.create_all(bind=engine)
