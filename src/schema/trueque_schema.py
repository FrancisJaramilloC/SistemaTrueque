from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class TruequeSchema(BaseModel):
    id: int | None = None
    fecha: date
    idOferta: int
    
    class Config:
        from_attributes = True

class TruequeHistorialResponse(BaseModel):
    id: int
    oferta_id: int
    articulo1_id: int
    articulo2_id: int
    usuario1_id: int
    usuario2_id: int
    fecha_trueque: datetime
    notas: Optional[str] = None