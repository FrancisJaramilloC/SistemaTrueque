from fastapi import APIRouter, HTTPException
from src.schema.trueque_schema import TruequeSchema
from config.db import engine
from src.model.trueque import trueques
from sqlalchemy import select

trueque_router = APIRouter()

@trueque_router.get("/")
def get_trueques():
    with engine.connect() as db:
        result = db.execute(trueques.select()).fetchall()
    return [dict(row._mapping) for row in result]

@trueque_router.get("/{id}")
def get_trueque(id: int):
    with engine.connect() as db:
        result = db.execute(trueques.select().where(trueques.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró trueque con id {id}"}

@trueque_router.post("/")
def create_trueque(data_trueque: TruequeSchema):
    new_trueque = data_trueque.dict()
    with engine.begin() as db:
        db.execute(trueques.insert().values(new_trueque))
    return {"message": "Trueque creado correctamente"}

@trueque_router.delete("/{trueque_id}")
def delete_trueque(trueque_id: int):
    with engine.connect() as db:
        existing_trueque = db.execute(select(trueques).where(trueques.c.id == trueque_id)).fetchone()
    if existing_trueque is None:
        raise HTTPException(status_code=404, detail="Trueque no encontrado")
    with engine.begin() as db:
        db.execute(trueques.delete().where(trueques.c.id == trueque_id))
    return {"message": "Trueque eliminado correctamente"}
