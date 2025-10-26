from fastapi import APIRouter, HTTPException
from categoria_schema import CategoriaSchema
from db import conn
from categoria import categorias

categoria_router = APIRouter()

@categoria_router.get("/api/categoria")
def get_categorias():
    result = conn.execute(categorias.select()).fetchall()
    return [dict(row._mapping) for row in result]

@categoria_router.post("/api/categoria/create")
def create_categoria(data_categoria: CategoriaSchema):
    new_categoria = data_categoria.dict()
    if new_categoria.get("id") is None:
        new_categoria.pop("id", None)
    conn.execute(categorias.insert().values(new_categoria))
    return {"message": "categoria creada"}

@categoria_router.patch("/api/categoria/update/{id}")
def patch_categoria(id: int, data_categoria: CategoriaSchema):
    data = data_categoria.dict(exclude_unset=True)
    if "id" in data:
        data.pop("id")
    result = conn.execute(categorias.update().where(categorias.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró categoria con id {id}"}
    return {"message": "categoria actualizada correctamente"}
