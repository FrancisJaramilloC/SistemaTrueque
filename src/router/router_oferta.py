from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from src.schema.oferta_schema import OfertaSchema
from config.db import conn, engine
from src.model.oferta import ofertas

oferta_router = APIRouter()

def get_usuario_actual():
    return {"id": 1}

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
        data.pop("id")
    with engine.begin() as conn:
        result = conn.execute(ofertas.update().where(ofertas.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró oferta con id {id}"}
    return {"message": "Oferta actualizada correctamente"}

@oferta_router.delete("/api/oferta/delete/{oferta_id}")
def delete_oferta(oferta_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """Eliminar una oferta"""
    oferta = conn.execute(select(ofertas).where(ofertas.c.id == oferta_id)).fetchone()

    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")

    # Si quieres validar propietario, descomentar:
    # if oferta.idCliente != usuario_actual["id"]:
    #     raise HTTPException(status_code=403, detail="No eres el propietario")

    conn.execute(ofertas.delete().where(ofertas.c.id == oferta_id))
    return {"message": "Oferta eliminada correctamente"}