"""
Schemas de Mensaje
Define los esquemas Pydantic para validación de mensajes
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ==================== Schemas Base ====================
class MensajeBase(BaseModel):
    """Schema base con campos comunes"""
    contenido: str = Field(..., min_length=1, max_length=2000)


class MensajeCreate(MensajeBase):
    """Schema para crear un nuevo mensaje"""
    destinatario_id: int


class MensajeResponse(MensajeBase):
    """Schema de respuesta con datos del mensaje"""
    id: int
    remitente_id: int
    destinatario_id: int
    leido: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class MensajeDetalle(MensajeResponse):
    """Schema de mensaje con información de usuarios"""
    remitente: dict
    destinatario: dict
    
    class Config:
        from_attributes = True
