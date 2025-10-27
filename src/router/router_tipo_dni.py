from fastapi import APIRouter, HTTPException
from src.schema.tipo_dni_schema import TipoDniSchema
from config.db import engine
from src.model.tipo_dni import tipo_dni
from sqlalchemy import select

tipo_dni_router = APIRouter()

@tipo_dni_router.get("/")
def get_tipos_dni():
    with engine.connect() as db:
        result = db.execute(tipo_dni.select()).fetchall()
    return [dict(row._mapping) for row in result]

@tipo_dni_router.get("/{id}")
def get_tipo_dni(id: int):
    with engine.connect() as db:
        result = db.execute(tipo_dni.select().where(tipo_dni.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró tipo de DNI con id {id}"}

@tipo_dni_router.post("/")
def create_tipo_dni(data_tipo_dni: TipoDniSchema):
    new_tipo_dni = data_tipo_dni.dict()
    with engine.begin() as db:
        db.execute(tipo_dni.insert().values(new_tipo_dni))
    return {"message": "Tipo de DNI creado correctamente"}

@tipo_dni_router.patch("/{id}")
def patch_tipo_dni(id: int, data_tipo_dni: TipoDniSchema):
    data = data_tipo_dni.dict(exclude_unset=True)
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as db:
        result = db.execute(tipo_dni.update().where(tipo_dni.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró tipo de DNI con id {id}"}
    return {"message": "Tipo de DNI actualizado correctamente"}

@tipo_dni_router.delete("/{tipo_dni_id}")
def delete_tipo_dni(tipo_dni_id: int):
    with engine.connect() as db:
        existing_tipo_dni = db.execute(select(tipo_dni).where(tipo_dni.c.id == tipo_dni_id)).fetchone()
    if existing_tipo_dni is None:
        raise HTTPException(status_code=404, detail="Tipo de DNI no encontrado")
    with engine.begin() as db:
        db.execute(tipo_dni.delete().where(tipo_dni.c.id == tipo_dni_id))
    return {"message": "Tipo de DNI eliminado correctamente"}
