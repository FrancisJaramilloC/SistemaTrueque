from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from src.schema.persona_schema import PersonaSchema
from config.db import conn, engine
from src.model.persona import personas

persona_router = APIRouter()

def get_usuario_actual():
    return {"id": 1}

@persona_router.get("/api/personas")
def get_personas():
    result = conn.execute(personas.select()).fetchall()
    return [dict(row._mapping) for row in result]

@persona_router.get("/api/persona/{id}")
def get_persona(id: int):
    result = conn.execute(personas.select().where(personas.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró persona con id {id}"}

@persona_router.post("/api/persona/create")
def create_persona(data_persona: PersonaSchema):
    new_persona = data_persona.dict()
    with engine.begin() as conn:
        conn.execute(personas.insert().values(new_persona))
    return {"message": "Persona creada correctamente"}

@persona_router.put("/api/persona/update/{id}")
def update_persona(id: int, data_persona: PersonaSchema):
    data = data_persona.dict()
    if "id" in data:
        data.pop("id")
    with engine.begin() as conn:
        result = conn.execute(personas.update().where(personas.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró persona con id {id}"}
    return {"message": "Persona actualizada correctamente"}

@persona_router.delete("/api/persona/delete/{persona_id}")
def delete_persona(persona_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """Eliminar una persona"""
    persona = conn.execute(select(personas).where(personas.c.id == persona_id)).fetchone()

    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")

    # Si quieres validar propietario, descomentar:
    # if persona.id_usuario != usuario_actual["id"]:
    #     raise HTTPException(status_code=403, detail="No eres el propietario")

    conn.execute(personas.delete().where(personas.c.id == persona_id))
    return {"message": "Persona eliminada correctamente"}
