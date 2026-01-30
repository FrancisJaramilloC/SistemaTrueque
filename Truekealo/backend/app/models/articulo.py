"""
Modelo de Artículo
Define la estructura de la tabla 'articulos' en la base de datos
"""
from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class EstadoArticulo(str, enum.Enum):
    """Estados posibles de un artículo"""
    DISPONIBLE = "disponible"
    EN_NEGOCIACION = "en_negociacion"
    INTERCAMBIADO = "intercambiado"
    NO_DISPONIBLE = "no_disponible"


class CategoriaArticulo(str, enum.Enum):
    """Categorías de artículos para el sistema de intercambio"""
    ELECTRONICA = "electronica"
    ROPA = "ropa"
    LIBROS = "libros"
    DEPORTES = "deportes"
    HOGAR = "hogar"
    JUGUETES = "juguetes"
    OTROS = "otros"


class Articulo(Base):
    """
    Modelo de Artículo para el sistema de intercambio
    
    Attributes:
        id: Identificador único del artículo
        titulo: Nombre del artículo
        descripcion: Descripción detallada
        categoria: Categoría del artículo
        estado_articulo: Estado del artículo (disponible, intercambiado, etc.)
        valor_estimado: Valor aproximado en moneda local
        imagen_url: URL de la imagen principal
        propietario_id: ID del usuario propietario
        created_at: Fecha de publicación
        updated_at: Fecha de última actualización
    """
    
    __tablename__ = "articulos"
    
    # ==================== Campos Principales ====================
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False, index=True)
    descripcion = Column(Text, nullable=False)
    categoria = Column(Enum(CategoriaArticulo), nullable=False)
    estado_articulo = Column(Enum(EstadoArticulo), default=EstadoArticulo.DISPONIBLE)
    
    # ==================== Información Adicional ====================
    valor_estimado = Column(Float, nullable=True)
    imagen_url = Column(String(500), nullable=True)
    condicion = Column(String(50), nullable=True)  # Nuevo, Usado, Como nuevo
    
    # ==================== Relación con Usuario ====================
    propietario_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    propietario = relationship("User", back_populates="articulos")
    
    # ==================== Timestamps ====================
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # ==================== Relaciones ====================
    propuestas_como_oferta = relationship("Propuesta", foreign_keys="Propuesta.articulo_ofrecido_id", back_populates="articulo_ofrecido")
    propuestas_como_solicitud = relationship("Propuesta", foreign_keys="Propuesta.articulo_solicitado_id", back_populates="articulo_solicitado")
    
    def __repr__(self):
        return f"<Articulo(id={self.id}, titulo='{self.titulo}', categoria='{self.categoria}')>"
