from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_, and_
from datetime import datetime, date
from config.db import engine
from src.model.articulo import articulos
from src.model.oferta import ofertas
from src.model.trueque import trueques
from src.model.trueque_detalle import trueques_detalle
from src.schema.oferta_trueque_schema import (
    OfertaCreateRequest, 
    OfertaResponse, 
    OfertaConDetalles,
    TruequeDetalleResponse,
    HistorialTruequeResponse
)
from src.utils.trueque_manager import TruequeManager

sistema_trueque_router = APIRouter()

def get_usuario_actual():
    """Función temporal - reemplazar con autenticación real"""
    return {"id": 1}

# ==================== OFERTAS ====================

@sistema_trueque_router.post("/ofertas/crear", response_model=dict, status_code=status.HTTP_201_CREATED)
def crear_oferta(
    oferta_data: OfertaCreateRequest,
    usuario_actual: dict = Depends(get_usuario_actual)
):
    """
    Crear una nueva oferta de trueque
    
    - **articulo_ofrecido_id**: ID del artículo que ofreces
    - **articulo_solicitado_id**: ID del artículo que deseas
    - **mensaje**: Mensaje opcional para el receptor
    
    **Validaciones:**
    - Ambos artículos deben existir y estar disponibles
    - Debes ser dueño del artículo que ofreces
    - No puedes ofertar tu propio artículo
    """
    with engine.begin() as conn:
        # Validar artículo ofrecido
        articulo_ofrecido = TruequeManager.validar_articulo_disponible(
            oferta_data.articulo_ofrecido_id, conn
        )
        
        # Validar artículo solicitado
        articulo_solicitado = TruequeManager.validar_articulo_disponible(
            oferta_data.articulo_solicitado_id, conn
        )
        
        # Validar que seas dueño del artículo ofrecido
        if articulo_ofrecido['id_usuario'] != usuario_actual["id"]:
            raise HTTPException(
                status_code=403, 
                detail="No eres el dueño del artículo ofrecido"
            )
        
        # Validar que no sea tu propio artículo
        if articulo_solicitado['id_usuario'] == usuario_actual["id"]:
            raise HTTPException(
                status_code=400, 
                detail="No puedes hacer una oferta por tu propio artículo"
            )
        
        # Crear la oferta
        nueva_oferta = {
            "articulo_ofrecido_id": oferta_data.articulo_ofrecido_id,
            "articulo_solicitado_id": oferta_data.articulo_solicitado_id,
            "usuario_ofertante_id": usuario_actual["id"],
            "usuario_receptor_id": articulo_solicitado['id_usuario'],
            "mensaje": oferta_data.mensaje,
            "estado": "pendiente",
            "id_persona": usuario_actual["id"],     # <- requerido por la BD
            "fecha": date.today(),                  # <- requerido por la BD (Date)
            "fecha_creacion": datetime.now(),       # <- si existe en la BD (DateTime)
        }
        result = conn.execute(ofertas.insert().values(nueva_oferta))
        oferta_id = result.inserted_primary_key[0]
        
        # Cambiar estado del artículo ofrecido a "reservado"
        TruequeManager.cambiar_estado_articulo(
            oferta_data.articulo_ofrecido_id, 
            "reservado", 
            conn
        )
    
    return {
        "message": "Oferta creada exitosamente",
        "oferta_id": oferta_id,
        "estado": "pendiente"
    }

@sistema_trueque_router.get("/ofertas/recibidas", response_model=list[OfertaConDetalles])
def listar_ofertas_recibidas(usuario_actual: dict = Depends(get_usuario_actual)):
    """Listar todas las ofertas que has recibido"""
    with engine.connect() as conn:
        # Obtener ofertas recibidas
        result = conn.execute(
            select(ofertas)
            .where(ofertas.c.usuario_receptor_id == usuario_actual["id"])
            .order_by(ofertas.c.fecha_creacion.desc())
        ).fetchall()
        
        ofertas_con_detalles = []
        for oferta in result:
            # Obtener detalles de artículos
            art_ofrecido = conn.execute(
                select(articulos).where(articulos.c.id == oferta.articulo_ofrecido_id)
            ).fetchone()
            
            art_solicitado = conn.execute(
                select(articulos).where(articulos.c.id == oferta.articulo_solicitado_id)
            ).fetchone()
            
            ofertas_con_detalles.append({
                "oferta": dict(oferta._mapping),
                "articulo_ofrecido": dict(art_ofrecido._mapping) if art_ofrecido else {},
                "articulo_solicitado": dict(art_solicitado._mapping) if art_solicitado else {}
            })
        
        return ofertas_con_detalles

@sistema_trueque_router.get("/ofertas/enviadas", response_model=list[OfertaConDetalles])
def listar_ofertas_enviadas(usuario_actual: dict = Depends(get_usuario_actual)):
    """Listar todas las ofertas que has enviado"""
    with engine.connect() as conn:
        result = conn.execute(
            select(ofertas)
            .where(ofertas.c.usuario_ofertante_id == usuario_actual["id"])
            .order_by(ofertas.c.fecha_creacion.desc())
        ).fetchall()
        
        ofertas_con_detalles = []
        for oferta in result:
            art_ofrecido = conn.execute(
                select(articulos).where(articulos.c.id == oferta.articulo_ofrecido_id)
            ).fetchone()
            
            art_solicitado = conn.execute(
                select(articulos).where(articulos.c.id == oferta.articulo_solicitado_id)
            ).fetchone()
            
            ofertas_con_detalles.append({
                "oferta": dict(oferta._mapping),
                "articulo_ofrecido": dict(art_ofrecido._mapping) if art_ofrecido else {},
                "articulo_solicitado": dict(art_solicitado._mapping) if art_solicitado else {}
            })
        
        return ofertas_con_detalles

@sistema_trueque_router.put("/ofertas/{oferta_id}/aceptar")
def aceptar_oferta(oferta_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """
    Aceptar una oferta de trueque
    
    - Valida que seas el receptor de la oferta
    - Crea un registro de trueque
    - Actualiza el estado de ambos artículos a "trueque-completado"
    - Actualiza la oferta como "aceptada"
    """
    with engine.begin() as conn:
        # Obtener oferta
        oferta = conn.execute(
            select(ofertas).where(ofertas.c.id == oferta_id)
        ).fetchone()
        
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        # Validar que seas el receptor
        if oferta.usuario_receptor_id != usuario_actual["id"]:
            raise HTTPException(
                status_code=403, 
                detail="Solo el receptor puede aceptar la oferta"
            )
        
        # Validar que esté pendiente
        if oferta.estado != "pendiente":
            raise HTTPException(
                status_code=400, 
                detail=f"La oferta ya fue {oferta.estado}"
            )
        
        # Crear trueque completo
        trueque_id = TruequeManager.crear_trueque_completo(oferta_id, conn)
        
        # Actualizar oferta
        conn.execute(
            ofertas.update()
            .where(ofertas.c.id == oferta_id)
            .values(estado="aceptada", fecha_respuesta=datetime.now())
        )
    
    return {
        "message": "Oferta aceptada exitosamente",
        "trueque_id": trueque_id,
        "estado": "aceptada"
    }

@sistema_trueque_router.put("/ofertas/{oferta_id}/rechazar")
def rechazar_oferta(oferta_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """
    Rechazar una oferta de trueque
    
    - Devuelve el artículo ofrecido a estado "disponible"
    - Actualiza la oferta como "rechazada"
    """
    with engine.begin() as conn:
        oferta = conn.execute(
            select(ofertas).where(ofertas.c.id == oferta_id)
        ).fetchone()
        
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        if oferta.usuario_receptor_id != usuario_actual["id"]:
            raise HTTPException(
                status_code=403, 
                detail="Solo el receptor puede rechazar la oferta"
            )
        
        if oferta.estado != "pendiente":
            raise HTTPException(
                status_code=400, 
                detail=f"La oferta ya fue {oferta.estado}"
            )
        
        # Devolver artículo ofrecido a disponible
        TruequeManager.cambiar_estado_articulo(
            oferta.articulo_ofrecido_id, 
            "disponible", 
            conn
        )
        
        # Actualizar oferta
        conn.execute(
            ofertas.update()
            .where(ofertas.c.id == oferta_id)
            .values(estado="rechazada", fecha_respuesta=datetime.now())
        )
    
    return {
        "message": "Oferta rechazada",
        "estado": "rechazada"
    }

@sistema_trueque_router.put("/ofertas/{oferta_id}/cancelar")
def cancelar_oferta(oferta_id: int, usuario_actual: dict = Depends(get_usuario_actual)):
    """
    Cancelar una oferta enviada (solo el ofertante)
    
    - Devuelve el artículo ofrecido a estado "disponible"
    """
    with engine.begin() as conn:
        oferta = conn.execute(
            select(ofertas).where(ofertas.c.id == oferta_id)
        ).fetchone()
        
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        if oferta.usuario_ofertante_id != usuario_actual["id"]:
            raise HTTPException(
                status_code=403, 
                detail="Solo el ofertante puede cancelar la oferta"
            )
        
        if oferta.estado != "pendiente":
            raise HTTPException(
                status_code=400, 
                detail=f"No se puede cancelar una oferta {oferta.estado}"
            )
        
        # Devolver artículo a disponible
        TruequeManager.cambiar_estado_articulo(
            oferta.articulo_ofrecido_id, 
            "disponible", 
            conn
        )
        
        conn.execute(
            ofertas.update()
            .where(ofertas.c.id == oferta_id)
            .values(estado="cancelada", fecha_respuesta=datetime.now())
        )
    
    return {
        "message": "Oferta cancelada",
        "estado": "cancelada"
    }

# ==================== HISTORIAL DE TRUEQUES ====================

@sistema_trueque_router.get("/historial/mis-trueques", response_model=list[dict])
def obtener_mi_historial(usuario_actual: dict = Depends(get_usuario_actual)):
    """Obtener el historial completo de trueques del usuario"""
    with engine.connect() as conn:
        result = conn.execute(
            select(trueques_detalle)
            .where(
                or_(
                    trueques_detalle.c.usuario1_id == usuario_actual["id"],
                    trueques_detalle.c.usuario2_id == usuario_actual["id"]
                )
            )
            .order_by(trueques_detalle.c.fecha_trueque.desc())
        ).fetchall()
        
        historial = []
        for trueque in result:
            # Obtener artículos
            art1 = conn.execute(
                select(articulos).where(articulos.c.id == trueque.articulo1_id)
            ).fetchone()
            
            art2 = conn.execute(
                select(articulos).where(articulos.c.id == trueque.articulo2_id)
            ).fetchone()
            
            historial.append({
                "trueque": dict(trueque._mapping),
                "articulo1": dict(art1._mapping) if art1 else {},
                "articulo2": dict(art2._mapping) if art2 else {}
            })
        
        return historial

@sistema_trueque_router.get("/historial/estadisticas")
def obtener_estadisticas(usuario_actual: dict = Depends(get_usuario_actual)):
    """Obtener estadísticas de trueques del usuario"""
    with engine.connect() as conn:
        # Ofertas enviadas
        ofertas_enviadas = conn.execute(
            select(ofertas)
            .where(ofertas.c.usuario_ofertante_id == usuario_actual["id"])
        ).fetchall()
        
        # Ofertas recibidas
        ofertas_recibidas = conn.execute(
            select(ofertas)
            .where(ofertas.c.usuario_receptor_id == usuario_actual["id"])
        ).fetchall()
        
        # Trueques completados
        trueques_completados = conn.execute(
            select(trueques_detalle)
            .where(
                and_(
                    or_(
                        trueques_detalle.c.usuario1_id == usuario_actual["id"],
                        trueques_detalle.c.usuario2_id == usuario_actual["id"]
                    ),
                    trueques_detalle.c.estado_final == "completado"
                )
            )
        ).fetchall()
        
        return {
            "ofertas_enviadas": {
                "total": len(ofertas_enviadas),
                "pendientes": len([o for o in ofertas_enviadas if o.estado == "pendiente"]),
                "aceptadas": len([o for o in ofertas_enviadas if o.estado == "aceptada"]),
                "rechazadas": len([o for o in ofertas_enviadas if o.estado == "rechazada"]),
                "canceladas": len([o for o in ofertas_enviadas if o.estado == "cancelada"])
            },
            "ofertas_recibidas": {
                "total": len(ofertas_recibidas),
                "pendientes": len([o for o in ofertas_recibidas if o.estado == "pendiente"]),
                "aceptadas": len([o for o in ofertas_recibidas if o.estado == "aceptada"]),
                "rechazadas": len([o for o in ofertas_recibidas if o.estado == "rechazada"])
            },
            "trueques_completados": len(trueques_completados)
        }
