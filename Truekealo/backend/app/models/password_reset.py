"""
Modelo de Token de Recuperación de Contraseña
Define la estructura de la tabla 'password_reset_tokens' en la base de datos
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PasswordResetToken(Base):
    """
    Modelo para guardar tokens de recuperación de contraseña con expiración
    
    Attributes:
        id: Identificador único del token
        user_id: ID del usuario
        token: Token único de recuperación
        expires_at: Fecha de expiración del token
        created_at: Fecha de creación
    """
    
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relación con User
    user = relationship("User")
    
    def __repr__(self):
        return f"<PasswordResetToken(user_id={self.user_id}, token='{self.token[:20]}...')>"
