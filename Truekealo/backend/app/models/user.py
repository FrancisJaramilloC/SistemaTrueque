"""
Modelo de Usuario
Define la estructura de la tabla 'users' en la base de datos
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    Modelo de Usuario para el sistema de intercambio
    
    Attributes:
        id: Identificador único del usuario
        email: Correo electrónico (único)
        nombre_completo: Nombre completo del usuario
        hashed_password: Contraseña hasheada (nunca en texto plano)
        telefono: Número de teléfono (opcional)
        ubicacion: Ciudad o dirección del usuario
        is_active: Estado del usuario (activo/inactivo)
        is_verified: Si el email ha sido verificado
        created_at: Fecha de creación del registro
        updated_at: Fecha de última actualización
    """
    
    __tablename__ = "users"
    
    # ==================== Campos Principales ====================
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    nombre_completo = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # ==================== Información Adicional ====================
    telefono = Column(String(20), nullable=True)
    ubicacion = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # ==================== Estados ====================
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # ==================== Timestamps ====================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # ==================== Relaciones ====================
    articulos = relationship("Articulo", back_populates="propietario", cascade="all, delete-orphan")
    mensajes_enviados = relationship("Mensaje", foreign_keys="Mensaje.remitente_id", back_populates="remitente")
    mensajes_recibidos = relationship("Mensaje", foreign_keys="Mensaje.destinatario_id", back_populates="destinatario")
    propuestas_enviadas = relationship("Propuesta", foreign_keys="Propuesta.usuario_ofertante_id", back_populates="usuario_ofertante")
    propuestas_recibidas = relationship("Propuesta", foreign_keys="Propuesta.usuario_receptor_id", back_populates="usuario_receptor")
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', nombre='{self.nombre_completo}')>"
