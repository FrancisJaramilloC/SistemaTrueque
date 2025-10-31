from fastapi import APIRouter, HTTPException
from src.schema.cliente_schema import ClienteSchema
from src.model.cliente import clientes
from src.model.persona import personas
from config.db import engine
from src.auth.auth_utils import hash_password
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

"""El hashing se centraliza en `src.auth.auth_utils.hash_password`.
Se intentará argon2 y luego bcrypt_sha256 como fallback."""

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
    # Validar que la persona referenciada exista para evitar errores de FK
    persona_id = new_cliente.get("persona_id")
    with engine.connect() as db:
        persona_existente = db.execute(personas.select().where(personas.c.id == persona_id)).fetchone()
    if persona_existente is None:
        raise HTTPException(status_code=400, detail=f"Persona con id {persona_id} no existe")

    # Hashear contraseña y guardar. hash_password levanta ValueError si falla.
    try:
        hashed_password = hash_password(new_cliente["contrasena"])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    new_cliente["contrasena"] = hashed_password
    try:
        with engine.begin() as db:
            db.execute(clientes.insert().values(new_cliente))
    except IntegrityError as e:
        # Devuelve error legible en vez de 500
        raise HTTPException(status_code=400, detail=f"Error de integridad al crear cliente: {str(e.orig)}") from e
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
