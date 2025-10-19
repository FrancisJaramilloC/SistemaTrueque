from pydantic import BaseModel

class OfertaSchema(BaseModel):
    id: int | None = None
    estado: bool
    fecha: str
    persona_id: int  # Llave foranea
    articulo_id: int  # Llave foranea
