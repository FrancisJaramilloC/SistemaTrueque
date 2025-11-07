from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from datetime import date
from config.db import conn, engine
from src.model.oferta import ofertas
from src.model.articulo import articulos
from src.schema.oferta_schema import OfertaSchema

oferta_trueque_router = APIRouter()

def get_usuario_actual():
    """Función temporal para obtener usuario actual"""
    return {"id": 1}

# ==================== OFERTAS ====================

@oferta_trueque_router.post("/ofertas/crear", response_model=dict, status_code=201)
def crear_oferta(
    idArticulo: int,
    usuario_actual: dict = Depends(get_usuario_actual)
):
    """
    Crear una nueva oferta de trueque
    
    - **idArticulo**: ID del artículo que se solicita
    """
    # Verificar que el artículo existe
    articulo = conn.execute(
        select(articulos).where(articulos.c.id == idArticulo)
    ).fetchone()
    
    if not articulo:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    # Verificar que el artículo está disponible
    if not articulo.estado:
        raise HTTPException(status_code=400, detail="El artículo no está disponible")
    
    # Crear la oferta
    nueva_oferta = {
        "estado": True,
        "fecha": date.today(),
        "idCliente": usuario_actual["id"],
        "idArticulo": idArticulo
    }
    
    with engine.begin() as connection:
        result = connection.execute(ofertas.insert().values(nueva_oferta))
        oferta_id = result.inserted_primary_key[0]
    
    return {
        "message": "Oferta creada exitosamente",
        "oferta_id": oferta_id
    }

@oferta_trueque_router.get("/ofertas/mis-ofertas")
def listar_mis_ofertas(usuario_actual: dict = Depends(get_usuario_actual)):
    """Listar todas las ofertas del usuario actual"""
    result = conn.execute(
        select(ofertas).where(ofertas.c.idCliente == usuario_actual["id"])
        .order_by(ofertas.c.fecha.desc())
    ).fetchall()
    
    return [dict(row._mapping) for row in result]

@oferta_trueque_router.get("/ofertas/{oferta_id}")
def obtener_oferta(oferta_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """Obtener detalles de una oferta específica"""
    oferta = conn.execute(
        select(ofertas).where(ofertas.c.id == oferta_id)
    ).fetchone()
    
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    
    return dict(oferta._mapping)

@oferta_trueque_router.put("/ofertas/{oferta_id}/cancelar")
def cancelar_oferta(oferta_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """Cancelar una oferta (cambiar estado a False)"""
    oferta = conn.execute(
        select(ofertas).where(ofertas.c.id == oferta_id)
    ).fetchone()
    
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    
    if oferta.idCliente != usuario_actual["id"]:
        raise HTTPException(status_code=403, detail="Solo el propietario puede cancelar la oferta")
    
    if not oferta.estado:
        raise HTTPException(status_code=400, detail="La oferta ya está cancelada")
    
    with engine.begin() as connection:
        connection.execute(
            ofertas.update()
            .where(ofertas.c.id == oferta_id)
            .values(estado=False)
        )
    
    return {"message": "Oferta cancelada"}

@oferta_trueque_router.get("/ofertas/articulo/{articulo_id}")
def listar_ofertas_articulo(articulo_id: int):
    """Listar ofertas relacionadas a un artículo"""
    result = conn.execute(
        select(ofertas).where(ofertas.c.idArticulo == articulo_id)
        .order_by(ofertas.c.fecha.desc())
    ).fetchall()
    
    return [dict(row._mapping) for row in result]

@oferta_trueque_router.delete("/ofertas/{oferta_id}")
def eliminar_oferta(oferta_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """Eliminar una oferta"""
    oferta = conn.execute(
        select(ofertas).where(ofertas.c.id == oferta_id)
    ).fetchone()
    
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    
    if oferta.idCliente != usuario_actual["id"]:
        raise HTTPException(status_code=403, detail="Solo el propietario puede eliminar la oferta")
    
    with engine.begin() as connection:
        connection.execute(ofertas.delete().where(ofertas.c.id == oferta_id))
    
    return {"message": "Oferta eliminada correctamente"}
