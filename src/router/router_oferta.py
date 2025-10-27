from fastapi import APIRouter, HTTPException
from src.schema.oferta_schema import OfertaSchema
from config.db import engine
from src.model.oferta import ofertas
from sqlalchemy import select

oferta_router = APIRouter()

@oferta_router.get("/")
def get_ofertas():
    with engine.connect() as db:
        result = db.execute(ofertas.select()).fetchall()
    return [dict(row._mapping) for row in result]

@oferta_router.get("/{id}")
def get_oferta(id: int):
    with engine.connect() as db:
        result = db.execute(ofertas.select().where(ofertas.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró oferta con id {id}"}

@oferta_router.post("/")
def create_oferta(data_oferta: OfertaSchema):
    new_oferta = data_oferta.dict()
    with engine.begin() as db:
        db.execute(ofertas.insert().values(new_oferta))
    return {"message": "Oferta creada correctamente"}

@oferta_router.put("/{id}")
def update_oferta(id: int, data_oferta: OfertaSchema):
    data = data_oferta.dict()
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as db:
        result = db.execute(ofertas.update().where(ofertas.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró oferta con id {id}"}
    return {"message": "Oferta actualizada correctamente"}

@oferta_router.delete("/{oferta_id}")
def delete_oferta(oferta_id: int):
    with engine.connect() as db:
        existing_oferta = db.execute(select(ofertas).where(ofertas.c.id == oferta_id)).fetchone()
    if existing_oferta is None:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    with engine.begin() as db:
        db.execute(ofertas.delete().where(ofertas.c.id == oferta_id))
    return {"message": "Oferta eliminada correctamente"}
