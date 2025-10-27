from fastapi import APIRouter, HTTPException
from src.schema.persona_schema import PersonaSchema
from config.db import engine
from src.model.persona import personas
from sqlalchemy import select

persona_router = APIRouter()

@persona_router.get("/")
def get_personas():
    with engine.connect() as db:
        result = db.execute(personas.select()).fetchall()
    return [dict(row._mapping) for row in result]

@persona_router.get("/{id}")
def get_persona(id: int):
    with engine.connect() as db:
        result = db.execute(personas.select().where(personas.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró persona con id {id}"}

@persona_router.post("/")
def create_persona(data_persona: PersonaSchema):
    new_persona = data_persona.dict()
    with engine.begin() as db:
        db.execute(personas.insert().values(new_persona))
    return {"message": "Persona creada correctamente"}

@persona_router.put("/{id}")
def update_persona(id: int, data_persona: PersonaSchema):
    data = data_persona.dict()
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as db:
        result = db.execute(personas.update().where(personas.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró persona con id {id}"}
    return {"message": "Persona actualizada correctamente"}

@persona_router.delete("/{persona_id}")
def delete_persona(persona_id: int):
    with engine.connect() as db:
        existing_persona = db.execute(select(personas).where(personas.c.id == persona_id)).fetchone()
    if existing_persona is None:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    with engine.begin() as db:
        db.execute(personas.delete().where(personas.c.id == persona_id))
    return {"message": "Persona eliminada correctamente"}
