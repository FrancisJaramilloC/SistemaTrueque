"""
Schemas de Artículo
Define los esquemas Pydantic para validación de datos de artículos
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from app.models.articulo import EstadoArticulo, CategoriaArticulo


# ==================== Schemas Base ====================
class ArticuloBase(BaseModel):
    """Schema base con campos comunes"""
    titulo: str = Field(..., min_length=3, max_length=255)
    descripcion: str = Field(..., min_length=10)
    categoria: CategoriaArticulo
    valor_estimado: Optional[float] = Field(None, ge=0)
    condicion: Optional[str] = Field(None, max_length=50)


class ArticuloCreate(ArticuloBase):
    """Schema para crear un nuevo artículo"""
    imagen_url: Optional[str] = None
    estado_articulo: Optional[EstadoArticulo] = None
    
    @validator('titulo')
    def titulo_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('El título no puede estar vacío')
        return v.strip()


class ArticuloUpdate(BaseModel):
    """Schema para actualizar un artículo"""
    titulo: Optional[str] = Field(None, min_length=3, max_length=255)
    descripcion: Optional[str] = Field(None, min_length=10)
    categoria: Optional[CategoriaArticulo] = None
    valor_estimado: Optional[float] = Field(None, ge=0)
    condicion: Optional[str] = Field(None, max_length=50)
    imagen_url: Optional[str] = None
    estado_articulo: Optional[EstadoArticulo] = None


class ArticuloResponse(ArticuloBase):
    """Schema de respuesta con datos del artículo"""
    id: int
    estado_articulo: EstadoArticulo
    imagen_url: Optional[str]
    propietario_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ArticuloWithOwner(ArticuloResponse):
    """Schema de artículo con información del propietario"""
    propietario: dict  # Información básica del propietario
    
    class Config:
        from_attributes = True
