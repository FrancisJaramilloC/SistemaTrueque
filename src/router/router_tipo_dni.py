from fastapi import APIRouter
from src.schema.tipo_dni_schema import TipoDniSchema
from config.db import conn
from src.model.tipo_dni import tipo_dni

tipo_dni_router = APIRouter()

@tipo_dni_router.get("/api/tipo_dni")
def get_tipos_dni():
    result = conn.execute(tipo_dni.select()).fetchall()
    return [dict(row._mapping) for row in result]

@tipo_dni_router.get("/api/tipo_dni/{id}")
def get_tipo_dni(id: int):
    result = conn.execute(tipo_dni.select().where(tipo_dni.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró tipo de DNI con id {id}"}

@tipo_dni_router.post("/api/tipo_dni/create")
def create_tipo_dni(data_tipo_dni: TipoDniSchema):
    new_tipo_dni = data_tipo_dni.dict()
    conn.execute(tipo_dni.insert().values(new_tipo_dni))
    return {"message": "Tipo de DNI creado correctamente"}

@tipo_dni_router.patch("/api/tipo_dni/update/{id}")
def patch_tipo_dni(id: int, data_tipo_dni: TipoDniSchema):
    data = data_tipo_dni.dict(exclude_unset=True)
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    result = conn.execute(tipo_dni.update().where(tipo_dni.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró tipo de DNI con id {id}"}
    return {"message": "Tipo de DNI actualizado correctamente"}

