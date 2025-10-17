from fastapi import APIRouter
from src.schema.user_schema import UserSchema
from config.db import conn 
from src.model.users import users

user = APIRouter()

@user.get("/")
def root():
    return {"message": "Usuarios"}

@user.post("/api/user/create")
def create_user(data_user: UserSchema):
    new_user = data_user.dict()
    conn.execute(users.insert().values(new_user))
    return {"message": "Usuario creado"}

@user.put("/api/user/update")
def update_user():
    pass