from fastapi import FastAPI
from src.router.router import user

app = FastAPI()

app.include_router(user)