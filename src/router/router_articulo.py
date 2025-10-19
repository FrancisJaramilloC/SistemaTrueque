from fastapi import APIRouter
from src.schema.articulo_schema import ArticuloSchema
from config.db import conn, engine
from src.model.articulo import articulos

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

@articulo_router.patch("/api/articulo/update/{id}")
def update_articulo(id: int, data_articulo: ArticuloSchema):
    data = data_articulo.dict(exclude_unset=True)
    if "id" in data:
        data.pop("id")  # Evitamos conflictos con el id en el cuerpo
    with engine.begin() as conn:
        result = conn.execute(articulos.update().where(articulos.c.id == id).values(data))
    if result.rowcount == 0:
        return {"message": f"No se encontró articulo con id {id}"}
    return {"message": "Articulo actualizado correctamente"}

@articulo_router.delete("/api/articulo/delete/{id}")
def delete_articulo(id: int):
    with engine.begin() as conn:
        result = conn.execute(articulos.delete().where(articulos.c.id == id))
    if result.rowcount == 0:
        return {"message": f"No se encontró articulo con id {id}"}
    return {"message": "Articulo eliminado correctamente"}

