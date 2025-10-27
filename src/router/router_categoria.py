from fastapi import APIRouter
from src.schema.categoria_schema import CategoriaSchema
from config.db import conn, engine
from src.model.categoria import categorias
from fastapi import HTTPException
from sqlalchemy import select

# Nota de rutas: este router se incluye en main.py con prefix="/api/categorias".
# Por eso, aquí usamos rutas relativas ("/", "/{id}") y NO repetimos "/api".

categoria_router = APIRouter()

@categoria_router.get("/")
def get_categorias():
    """Lista todas las categorías.
    Ruta final: GET /api/categorias
    """
    result = conn.execute(categorias.select()).fetchall()
    return [dict(row._mapping) for row in result]

@categoria_router.post("/")
def create_categoria(data_categoria: CategoriaSchema):
    """Crea una categoría.
    Ruta final: POST /api/categorias
    """
    new_categoria = data_categoria.dict()
    with engine.begin() as db:
        db.execute(categorias.insert().values(new_categoria))
    return {"message": "Categoría creada"}

@categoria_router.patch("/{id}")
def patch_categoria(id: int, data_categoria: CategoriaSchema):
    """Actualiza parcialmente una categoría por id.
    Ruta final: PATCH /api/categorias/{id}
    """
    data = data_categoria.dict(exclude_unset=True)
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as db:
        result = db.execute(categorias.update().where(categorias.c.id == id).values(data))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail=f"No se encontró categoría con id {id}")
    return {"message": "Categoría actualizada correctamente"}

@categoria_router.delete("/{categoria_id}")
def delete_categoria(categoria_id: int):
    """Elimina una categoría por id.
    Ruta final: DELETE /api/categorias/{categoria_id}
    """
    existing_categoria = conn.execute(
        select(categorias).where(categorias.c.id == categoria_id)
    ).fetchone()
    if existing_categoria is None:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    with engine.begin() as db:
        db.execute(categorias.delete().where(categorias.c.id == categoria_id))
    return {"message": "Categoría eliminada correctamente"}
