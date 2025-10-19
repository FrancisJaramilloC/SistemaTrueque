from pydantic import BaseModel

class CategoriaSchema(BaseModel):
    id: int | None = None
    descripcion: str