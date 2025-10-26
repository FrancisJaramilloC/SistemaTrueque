from fastapi import FastAPI
from router_categoria import categoria_router

app = FastAPI()

app.include_router(categoria_router, prefix="/api/categorias", tags=["Categorias"])
