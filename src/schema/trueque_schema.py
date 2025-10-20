from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TruequeSchema(BaseModel):
   
    id: int | None = None  
    id_articulo_ofertado: int
    id_articulo_solicitado: int
    estado: str
    fecha_propuesta: datetime | None = None
    fecha_aceptacion: datetime | None = None