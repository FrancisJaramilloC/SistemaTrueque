from fastapi import APIRouter, HTTPException
from src.schema.cliente_schema import ClienteSchema
from src.model.cliente import clientes
from config.db import engine
from passlib.context import CryptContext
from sqlalchemy import select

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

cliente_router = APIRouter()

@cliente_router.get("/")
def get_clientes():
    with engine.connect() as db:
        result = db.execute(clientes.select()).fetchall()
    return [dict(row._mapping) for row in result]


@cliente_router.get("/{id}")
def get_cliente(id: int):
    with engine.connect() as db:
        result = db.execute(clientes.select().where(clientes.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró cliente con id {id}"}
 

# Toma la contraseña en texto plano que viene del usuario.
# Reemplaza en el diccionario new_cliente por su versión hasheada.
# Guarda ese diccionario en la base de datos. Por lo tanto, lo que se almacena no es la contraseña original, sino el hash.
@cliente_router.post("/")
def create_cliente(data_cliente: ClienteSchema):
    new_cliente = data_cliente.dict()
    hashed_password = pwd_context.hash(new_cliente["contrasena"])
    new_cliente["contrasena"] = hashed_password
    with engine.begin() as db:
        db.execute(clientes.insert().values(new_cliente))
    return {"message": "Cliente creado correctamente"}



@cliente_router.put("/{id}")
def update_cliente(id: int, data_cliente: ClienteSchema):
    data = data_cliente.dict()
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as db:
        result = db.execute(clientes.update().where(clientes.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró cliente con id {id}"}
    return {"message": "Cliente actualizado correctamente"}

@cliente_router.delete("/{cliente_id}")
def delete_cliente(cliente_id: int):
    with engine.connect() as db:
        existing_cliente = db.execute(select(clientes).where(clientes.c.id == cliente_id)).fetchone()
    if existing_cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    with engine.begin() as db:
        db.execute(clientes.delete().where(clientes.c.id == cliente_id))
    return {"message": "Cliente eliminado correctamente"}
