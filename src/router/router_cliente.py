from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from src.schema.cliente_schema import ClienteSchema
from config.db import conn, engine
from src.model.cliente import clientes
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

cliente_router = APIRouter()

def get_usuario_actual():
    return {"id": 1}

@cliente_router.get("/")
def root():
    return {"message": "bienvenido"}

@cliente_router.get("/api/clientes")
def get_clientes():
    result = conn.execute(clientes.select()).fetchall()
    return [dict(row._mapping) for row in result]

@cliente_router.get("/api/cliente/{id}")
def get_cliente(id: int):
    result = conn.execute(clientes.select().where(clientes.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró cliente con id {id}"}

@cliente_router.post("/api/cliente/create")
def create_cliente(data_cliente: ClienteSchema):
    new_cliente = data_cliente.dict()
    hashed_password = pwd_context.hash(new_cliente["contrasena"])
    new_cliente["contrasena"] = hashed_password
    
    with engine.begin() as conn:
        conn.execute(clientes.insert().values(new_cliente))
    return {"message": "Cliente creado correctamente"}

@cliente_router.put("/api/cliente/update/{id}")
def update_cliente(id: int, data_cliente: ClienteSchema):
    data = data_cliente.dict()
    if "id" in data:
        data.pop("id")
    with engine.begin() as conn:
        result = conn.execute(clientes.update().where(clientes.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró cliente con id {id}"}
    return {"message": "Cliente actualizado correctamente"}

@cliente_router.delete("/api/cliente/delete/{cliente_id}")
def delete_cliente(cliente_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """Eliminar un cliente"""
    cliente = conn.execute(select(clientes).where(clientes.c.id == cliente_id)).fetchone()

    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Si quieres validar propietario, descomentar:
    # if cliente.id_usuario != usuario_actual["id"]:
    #     raise HTTPException(status_code=403, detail="No eres el propietario")

    conn.execute(clientes.delete().where(clientes.c.id == cliente_id))
    return {"message": "Cliente eliminado correctamente"}