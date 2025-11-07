from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ContraofertaCreate(BaseModel):
    oferta_original_id: int
    articulo_alternativo_id: int
    mensaje: Optional[str] = None

class ContraofertaResponse(BaseModel):
    id: int
    oferta_original_id: int
    articulo_alternativo_id: int
    usuario_id: int
    mensaje: Optional[str] = None
    fecha_creacion: datetime
