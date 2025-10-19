from pydantic import BaseModel

class ClienteSchema(BaseModel):
    id: str | None = None #El id es opcional porque lo genera la base de datos
    email: str
    username: str
    contrasena: str
    estado: bool
    persona_id: int #Llave foranea