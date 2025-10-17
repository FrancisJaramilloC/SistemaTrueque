from fastapi import APIRouter
from src.schema.user_schema import UserSchema
from config.db import conn
from src.model.users import users
from config.db import engine


user = APIRouter()

@user.get("/")
def root():
    return {"message": "bienvenido"}

@user.get("/api/user")
def get_users():
    result = conn.execute(users.select()).fetchall()
    return [dict(row._mapping) for row in result]

@user.get("/api/user/{id}")
def get_user(id: int):
    result = conn.execute(users.select().where(users.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró usuario con id {id}"}

@user.post("/api/user/create")
def create_user(data_user: UserSchema):
    new_user = data_user.dict()
    with engine.begin() as conn:
        conn.execute(users.insert().values(new_user))
    return {"message": "Usuario creado correctamente"}  

@user.put("/api/user/update/{id}")
def update_user(id: int, data_user: UserSchema):
    data = data_user.dict()
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as conn:
        result = conn.execute(users.update().where(users.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró usuario con id {id}"}
    return {"message": "Usuario actualizado correctamente"}


@user.delete("/api/user/delete/{id}")
def delete_user(id: int):
    with engine.begin() as conn:
        result = conn.execute(users.delete().where(users.c.id == id))
    if result.rowcount == 0:
        return {"message": f"No se encontró usuario con id {id}"}
    return {"message": "Usuario eliminado correctamente"}
    