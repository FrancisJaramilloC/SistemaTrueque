from pydantic import BaseModel

class ArticuloSchema(BaseModel):
    id: int | None = None
    nombre: str
    descripcion: str
    estado: bool
    fecha: str
    cliente_id: int  # Llave foranea
    categoria_id: int  # Llave foranea