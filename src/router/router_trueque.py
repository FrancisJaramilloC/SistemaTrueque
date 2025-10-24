from fastapi import APIRouter
from src.schema.trueque_schema import TruequeSchema
from config.db import conn 
from src.model.trueque import trueques
from fastapi import Depends, HTTPException
from sqlalchemy import select

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


@trueque_router.delete("/api/trueque/delete/{trueque_id}")
def delete_trueque(trueque_id: int):

    existing_trueque = conn.execute(select(trueques).where(trueques.c.id == trueque_id)).fetchone()
    if existing_trueque is None:
        raise HTTPException(status_code=404, detail="trueque no encontrado")

    conn.execute(trueques.delete().where(trueques.c.id == trueque_id))
    return {"message": "trueque eliminado correctamente"}

# Seguridad mejorada: solo el propietario puede eliminar su trueque
def get_usuario_actual():
    return {"id": 1}

@trueque_router.delete("/api/trueque/delete/{trueque_id}")
def delete_trueque(trueque_id: int, usuario_actual: dict = Depends(get_usuario_actual)):

    trueque = conn.execute(select(trueques).where(trueques.c.id == trueque_id)).fetchone()

    if not trueque:
        raise HTTPException(status_code=404, detail="trueque no encontrado")

    if trueque.id_usuario != usuario_actual["id"]:
        raise HTTPException(status_code=403, detail="Acción no permitida. No eres el propietario de este trueque.")

    conn.execute(trueques.delete().where(trueques.c.id == trueque_id))
    return {"message": "trueque eliminado correctamente"}