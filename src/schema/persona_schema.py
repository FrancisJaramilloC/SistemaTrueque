from pydantic import BaseModel

class PersonaSchema(BaseModel):
    id: str | None = None #El id es opcional porque lo genera la base de datos
    nombre: str
    apellido: str
    telefono: str
    dni: str
    tipo_dni_id: int #Llave foranea
    
    