from pydantic import BaseModel

class ClienteSchema(BaseModel):
    email: str
    username: str
    contrasena: str
    estado: bool
    persona_id: int #Llave foranea