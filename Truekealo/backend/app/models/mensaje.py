"""
Modelo de Mensaje
Define la estructura de la tabla 'mensajes' en la base de datos
"""
from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Mensaje(Base):
    """
    Modelo de Mensaje para comunicación entre usuarios
    
    Attributes:
        id: Identificador único del mensaje
        remitente_id: Usuario que envía el mensaje
        destinatario_id: Usuario que recibe el mensaje
        contenido: Contenido del mensaje
        leido: Si el mensaje ha sido leído
        created_at: Fecha de envío
    """
    
    __tablename__ = "mensajes"
    
    # ==================== Campos Principales ====================
    id = Column(Integer, primary_key=True, index=True)
    
    # ==================== Usuarios Involucrados ====================
    remitente_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    destinatario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # ==================== Contenido ====================
    contenido = Column(Text, nullable=False)
    leido = Column(Boolean, default=False)
    
    # ==================== Timestamps ====================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # ==================== Relaciones ====================
    remitente = relationship("User", foreign_keys=[remitente_id], back_populates="mensajes_enviados")
    destinatario = relationship("User", foreign_keys=[destinatario_id], back_populates="mensajes_recibidos")
    
    def __repr__(self):
        return f"<Mensaje(id={self.id}, de={self.remitente_id}, para={self.destinatario_id})>"
