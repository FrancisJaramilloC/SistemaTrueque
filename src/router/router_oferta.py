from fastapi import APIRouter
from src.schema.oferta_schema import OfertaSchema
from config.db import conn, engine
from src.model.oferta import ofertas

oferta_router = APIRouter()

@oferta_router.get("/api/ofertas")
def get_ofertas():
    result = conn.execute(ofertas.select()).fetchall()
    return [dict(row._mapping) for row in result]

@oferta_router.get("/api/oferta/{id}")
def get_oferta(id: int):
    result = conn.execute(ofertas.select().where(ofertas.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró oferta con id {id}"}

@oferta_router.post("/api/oferta/create")
def create_oferta(data_oferta: OfertaSchema):
    new_oferta = data_oferta.dict()
    with engine.begin() as conn:
        conn.execute(ofertas.insert().values(new_oferta))
    return {"message": "Oferta creada correctamente"}

@oferta_router.put("/api/oferta/update/{id}")
def update_oferta(id: int, data_oferta: OfertaSchema):
    data = data_oferta.dict()
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as conn:
        result = conn.execute(ofertas.update().where(ofertas.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró oferta con id {id}"}
    return {"message": "Oferta actualizada correctamente"}

@oferta_router.delete("/api/oferta/delete/{id}")
def delete_oferta(id: int): 
    with engine.begin() as conn:
        result = conn.execute(ofertas.delete().where(ofertas.c.id == id))
    if result.rowcount == 0:
        return {"message": f"No se encontró oferta con id {id}"}
    return {"message": "Oferta eliminada correctamente"}