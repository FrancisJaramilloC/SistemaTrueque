from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ArticuloSchema(BaseModel):
    id: int | None = None
    descripcion: str
    categoria: str
    estado: str
    fecha: datetime | None = None
    id_usuario: int
    imagen_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    
    class Config:
        from_attributes = True