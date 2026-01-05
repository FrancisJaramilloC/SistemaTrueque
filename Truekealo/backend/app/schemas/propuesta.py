"""
Schemas de Propuesta
Define los esquemas Pydantic para validación de propuestas de intercambio
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.propuesta import EstadoPropuesta


# ==================== Schemas Base ====================
class PropuestaBase(BaseModel):
    """Schema base con campos comunes"""
    articulo_ofrecido_id: int
    articulo_solicitado_id: int
    mensaje: Optional[str] = Field(None, max_length=1000)


class PropuestaCreate(PropuestaBase):
    """Schema para crear una nueva propuesta"""
    pass


class PropuestaUpdate(BaseModel):
    """Schema para actualizar una propuesta"""
    estado: EstadoPropuesta
    mensaje: Optional[str] = Field(None, max_length=1000)


class PropuestaResponse(PropuestaBase):
    """Schema de respuesta con datos de la propuesta"""
    id: int
    usuario_ofertante_id: int
    usuario_receptor_id: int
    estado: EstadoPropuesta
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class PropuestaDetalle(PropuestaResponse):
    """Schema de propuesta con información detallada"""
    articulo_ofrecido: dict
    articulo_solicitado: dict
    usuario_ofertante: dict
    usuario_receptor: dict
    
    class Config:
        from_attributes = True
