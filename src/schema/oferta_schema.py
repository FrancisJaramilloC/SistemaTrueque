from pydantic import BaseModel
from datetime import date
from typing import Optional

class OfertaSchema(BaseModel):
    id: int | None = None
    estado: bool
    fecha: date
    idCliente: int
    idArticulo: int
    
    class Config:
        from_attributes = True

class OfertaBase(BaseModel):
    estado: bool
    idCliente: int
    idArticulo: int

class OfertaCreate(OfertaBase):
    pass

class OfertaUpdate(BaseModel):
    estado: bool | None = None
