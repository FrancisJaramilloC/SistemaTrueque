from fastapi import APIRouter
from src.schema.cliente_schema import ClienteSchema
from config.db import conn
from src.model.cliente import clientes
from config.db import engine


cliente_router = APIRouter()

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
    with engine.begin() as conn:
        conn.execute(clientes.insert().values(new_cliente))
    return {"message": "Cliente creado correctamente"}

@cliente_router.put("/api/cliente/update/{id}")
def update_cliente(id: int, data_cliente: ClienteSchema):
    data = data_cliente.dict()
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as conn:
        result = conn.execute(clientes.update().where(clientes.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró cliente con id {id}"}
    return {"message": "Cliente actualizado correctamente"}


@cliente_router.delete("/api/cliente/delete/{id}")
def delete_cliente(id: int):
    with engine.begin() as conn:
        result = conn.execute(clientes.delete().where(clientes.c.id == id))
    if result.rowcount == 0:
        return {"message": f"No se encontró cliente con id {id}"}
    return {"message": "Usuario eliminado correctamente"}
    