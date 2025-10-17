from pydantic import BaseModel
from typing import Optional

class TruequeSchema(BaseModel):
    id: str | None = None #El id es opcional porque lo genera la base de datos
    fecha: str

