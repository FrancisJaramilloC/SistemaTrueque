from pydantic import BaseModel

class TipoDniSchema(BaseModel):
    id: str | None = None 
    nombre: str