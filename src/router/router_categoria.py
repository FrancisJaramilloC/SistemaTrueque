from fastapi import APIRouter
from sqlalchemy import select
from src.schema.categoria_schema import CategoriaSchema
from config.db import conn
from src.model.categoria import categorias
from fastapi import Depends
from fastapi import HTTPException

categoria_router = APIRouter()

def get_usuario_actual():
    return {"id": 1}

@categoria_router.get("/api/categoria")
def get_categorias():
    result = conn.execute(categorias.select()).fetchall()
    return [dict(row._mapping) for row in result]

@categoria_router.post("/api/categoria/create")
def create_categoria(data_categoria: CategoriaSchema):
    new_categoria = data_categoria.dict()
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

@categoria_router.delete("/api/categoria/delete/{categoria_id}")
def delete_categoria(categoria_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """Eliminar una categoría (con validación de usuario)"""
    categoria = conn.execute(select(categorias).where(categorias.c.id == categoria_id)).fetchone()

    if not categoria:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # Si las categorías tienen dueño, descomentar:
    # if categoria.id_usuario != usuario_actual["id"]:
    #     raise HTTPException(status_code=403, detail="Acción no permitida. No eres el propietario de esta categoría.")

    conn.execute(categorias.delete().where(categorias.c.id == categoria_id))
    return {"message": "Categoría eliminada correctamente"}
