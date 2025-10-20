from fastapi import APIRouter
from src.schema.articulo_schema import ArticuloSchema
from config.db import conn, engine
from src.model.articulo import articulos
from fastapi import Depends, HTTPException

articulo_router = APIRouter()

@articulo_router.get("/api/articulos")
def get_articulos():
    result = conn.execute(articulos.select()).fetchall()
    return [dict(row._mapping) for row in result]

@articulo_router.get("/api/articulo/{id}")
def get_articulo(id: int):
    result = conn.execute(articulos.select().where(articulos.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró articulo con id {id}"}

@articulo_router.post("/api/articulo/create")
def create_articulo(data_articulo: ArticuloSchema):
    new_articulo = data_articulo.dict()
    with engine.begin() as conn:
        conn.execute(articulos.insert().values(new_articulo))
    return {"message": "Articulo creado correctamente"}

@articulo_router.delete("/api/articulo/delete/{articulo_id}")
def delete_articulo(articulo_id: int):

    existing_articulo = conn.execute(select(articulos).where(articulos.c.id == articulo_id)).fetchone()
    if existing_articulo is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")

    conn.execute(articulos.delete().where(articulos.c.id == articulo_id))
    return {"message": "Artículo eliminado correctamente"}

# Seguridad mejorada: solo el propietario puede eliminar su artículo

@articulo_router.delete("/api/articulo/delete/{articulo_id}")
def delete_articulo(articulo_id: int, usuario_actual: dict = Depends(get_usuario_actual)): 
    
    articulo = conn.execute(select(articulos).where(articulos.c.id == articulo_id)).fetchone()

    if not articulo:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")

    if articulo.id_usuario != usuario_actual["id"]:
        raise HTTPException(status_code=403, detail="Acción no permitida. No eres el propietario de este artículo.")

    conn.execute(articulos.delete().where(articulos.c.id == articulo_id))
    return {"message": "Artículo eliminado correctamente"}
