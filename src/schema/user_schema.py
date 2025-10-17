from pydantic import BaseModel
from typing import Optional

class UserSchema(BaseModel):
    id: str | None = None #El id es opcional porque lo genera la base de datos
    name: str
    username: str
    user_password: str
    user_email: str