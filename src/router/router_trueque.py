from fastapi import APIRouter
from src.schema.trueque_schema import TruequeSchema
from config.db import conn 
from src.model.trueques import trueques

trueque = APIRouter()

@trueque.get("/")
def root():
    return {"message": "bienvenido"}

@trueque.get("/api/trueque")
def get_trueques(data_trueque: TruequeSchema): #ANALIZAR ESTO
    pass

@trueque.post("/api/trueque/create")
def create_trueque(data_trueque: TruequeSchema):
    new_trueque = data_trueque.dict()
    conn.execute(trueques.insert().values(new_trueque))
    return {"message": "Trueque creado"}

@trueque.put("/api/trueque/update/{id}")
def update_trueque(id: str, data_trueque: TruequeSchema):
    conn.execute(trueques.update().where(trueques.c.id == id).values(data_trueque.dict()))
    return {"message": "Trueque actualizado"}

@trueque.delete("/api/trueque/delete/{id}")
def delete_trueque(id: str):
    conn.execute(trueques.delete().where(trueques.c.id == id))
    return {"message": "Trueque eliminado"}