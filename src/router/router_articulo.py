from fastapi import APIRouter, Depends, HTTPException
from src.schema.articulo_schema import ArticuloSchema
from config.db import engine
from src.model.articulo import articulos
from sqlalchemy import select
from src.auth.dependencies import get_current_user  # Autenticación JWT
from src.model.cliente import clientes  # Para verificar propietario vía persona_id

articulo_router = APIRouter()

@articulo_router.get("/")
def get_articulos():
    with engine.connect() as db:
        result = db.execute(articulos.select()).fetchall()
    return [dict(row._mapping) for row in result]

@articulo_router.get("/{id}")
def get_articulo(id: int):
    with engine.connect() as db:
        result = db.execute(articulos.select().where(articulos.c.id == id)).fetchone()
    if result:
        return dict(result._mapping)
    return {"message": f"No se encontró articulo con id {id}"}

@articulo_router.post("/")
def create_articulo(data_articulo: ArticuloSchema):
    new_articulo = data_articulo.dict()
    with engine.begin() as db:
        db.execute(articulos.insert().values(new_articulo))
    return {"message": "Artículo creado correctamente"}

@articulo_router.delete("/{articulo_id}")
def delete_articulo(articulo_id: int):
    with engine.connect() as db:
        existing_articulo = db.execute(select(articulos).where(articulos.c.id == articulo_id)).fetchone()
    if existing_articulo is None:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    with engine.begin() as db:
        db.execute(articulos.delete().where(articulos.c.id == articulo_id))
    return {"message": "Artículo eliminado correctamente"}

# Ruta de ejemplo PROTEGIDA con JWT para eliminar si eres dueño
@articulo_router.delete("/secure-delete/{articulo_id}")
def secure_delete_articulo(articulo_id: int, usuario_actual: dict = Depends(get_current_user)):
    # Obtener cliente y su persona_id
    q_cliente = select(clientes).where(clientes.c.id == usuario_actual["user_id"])
    with engine.connect() as db:
        cliente_row = db.execute(q_cliente).fetchone()
    if not cliente_row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    persona_id_cliente = cliente_row.persona_id

    # Buscar artículo
    with engine.connect() as db:
        articulo_row = db.execute(select(articulos).where(articulos.c.id == articulo_id)).fetchone()
    if not articulo_row:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")

    # Verificar propiedad a través de persona_id
    if articulo_row.persona_id != persona_id_cliente:
        raise HTTPException(status_code=403, detail="No puedes eliminar artículos de otra persona")

    # Eliminar
    with engine.begin() as db:
        db.execute(articulos.delete().where(articulos.c.id == articulo_id))
    return {"message": "Artículo eliminado correctamente (autenticado)", "articulo_id": articulo_id}



