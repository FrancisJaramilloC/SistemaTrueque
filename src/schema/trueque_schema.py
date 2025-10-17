from pydantic import BaseModel
from datetime import date

class TruequeSchema(BaseModel):
    id: str | None = None #El id es opcional porque lo genera la base de datos
    fecha: date
