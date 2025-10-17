from fastapi import APIRouter
from src.schema.user_schema import UserSchema
from config.db import conn 
from src.model.users import users

user = APIRouter()

@user.get("/")
def root():
    return {"message": "bienvenido"}

@user.get("/api/user")
def get_users(data_user: UserSchema): #ANALIZAR ESTO
    pass

@user.post("/api/user/create")
def create_user(data_user: UserSchema):
    new_user = data_user.dict()
    conn.execute(users.insert().values(new_user))
    return {"message": "Usuario creado"}

@user.put("/api/user/update/{id}")
def update_user(id: str, data_user: UserSchema):
    conn.execute(users.update().where(users.c.id == id).values(data_user.dict()))
    return {"message": "Usuario actualizado"}

@user.delete("/api/user/delete/{id}")
def delete_user(id: str):
    conn.execute(users.delete().where(users.c.id == id))
    return {"message": "Usuario eliminado"}