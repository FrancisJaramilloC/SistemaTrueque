from fastapi import FastAPI
from src.router.router_user import user
from src.router.router_trueque import trueque

app = FastAPI()

app.include_router(user)
app.include_router(trueque)