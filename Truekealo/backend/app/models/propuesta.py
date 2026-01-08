"""
Modelo de Propuesta de Intercambio
Define la estructura de la tabla 'propuestas' en la base de datos
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class EstadoPropuesta(str, enum.Enum):
    """Estados posibles de una propuesta de intercambio"""
    PENDIENTE = "pendiente"
    ACEPTADA = "aceptada"
    RECHAZADA = "rechazada"
    CANCELADA = "cancelada"
    COMPLETADA = "completada"


class Propuesta(Base):
    """
    Modelo de Propuesta de Intercambio
    Representa una oferta de intercambio entre dos usuarios
    
    Attributes:
        id: Identificador único de la propuesta
        usuario_ofertante_id: Usuario que hace la propuesta
        usuario_receptor_id: Usuario que recibe la propuesta
        articulo_ofrecido_id: Artículo que se ofrece
        articulo_solicitado_id: Artículo que se solicita
        mensaje: Mensaje opcional del ofertante
        estado: Estado actual de la propuesta
        created_at: Fecha de creación
        updated_at: Fecha de última actualización
    """
    
    __tablename__ = "propuestas"
    
    # ==================== Campos Principales ====================
    id = Column(Integer, primary_key=True, index=True)
    
    # ==================== Usuarios Involucrados ====================
    usuario_ofertante_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    usuario_receptor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # ==================== Artículos Involucrados ====================
    articulo_ofrecido_id = Column(Integer, ForeignKey("articulos.id", ondelete="CASCADE"), nullable=False)
    articulo_solicitado_id = Column(Integer, ForeignKey("articulos.id", ondelete="CASCADE"), nullable=False)
    
    # ==================== Información Adicional ====================
    mensaje = Column(Text, nullable=True)
    estado = Column(Enum(EstadoPropuesta), default=EstadoPropuesta.PENDIENTE)
    
    # ==================== Timestamps ====================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # ==================== Relaciones ====================
    usuario_ofertante = relationship("User", foreign_keys=[usuario_ofertante_id], back_populates="propuestas_enviadas")
    usuario_receptor = relationship("User", foreign_keys=[usuario_receptor_id], back_populates="propuestas_recibidas")
    articulo_ofrecido = relationship("Articulo", foreign_keys=[articulo_ofrecido_id], back_populates="propuestas_como_oferta")
    articulo_solicitado = relationship("Articulo", foreign_keys=[articulo_solicitado_id], back_populates="propuestas_como_solicitud")
    
    def __repr__(self):
        return f"<Propuesta(id={self.id}, estado='{self.estado}')>"
