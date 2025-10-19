from fastapi import APIRouter
from src.schema.trueque_schema import TruequeSchema
from config.db import conn 
from src.model.trueque import trueques

trueque_router = APIRouter()


@trueque_router.get("/api/trueque")
def get_trueques():
    result = conn.execute(trueques.select()).fetchall()
    return [dict(row._mapping) for row in result]

@trueque_router.get("/api/trueque/{id}")
def get_trueque(id: int):
    result = conn.execute(trueques.select().where(trueques.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró trueque con id {id}"}

@trueque_router.post("/api/trueque/create")
def create_trueque(data_trueque: TruequeSchema):
    new_trueque = data_trueque.dict()
    conn.execute(trueques.insert().values(new_trueque))
    return {"message": "Trueque creado"}


