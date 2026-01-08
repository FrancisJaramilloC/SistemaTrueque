"""
Router de Actividades
Endpoints para obtener actividades recientes del usuario basadas en sus acciones
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.propuesta import Propuesta, EstadoPropuesta
from app.models.mensaje import Mensaje
from app.models.articulo import Articulo, EstadoArticulo
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/actividades", tags=["Actividades"])


@router.get("/recientes", response_model=List[dict])
async def get_actividades_recientes(
    limite: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene las actividades recientes del usuario basadas en sus acciones.
    
    Incluye:
    - Artículos intercambiados/canjeados
    - Propuestas enviadas o recibidas
    - Mensajes enviados (inicio de conversaciones)
    
    Todo se calcula en tiempo real basado en las acciones del usuario.
    
    Args:
        limite: Número máximo de actividades a retornar
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        List[dict]: Lista de actividades recientes ordenadas por fecha
    """
    actividades = []
    
    # 1. Artículos canjeados/intercambiados del usuario
    articulos_intercambiados = db.query(Articulo).filter(
        Articulo.propietario_id == current_user.id,
        Articulo.estado_articulo == EstadoArticulo.INTERCAMBIADO
    ).order_by(desc(Articulo.updated_at)).limit(limite).all()
    
    for articulo in articulos_intercambiados:
        actividades.append({
            "tipo": "articulo_intercambiado",
            "fecha": articulo.updated_at,
            "descripcion": f"Tu artículo '{articulo.titulo}' fue canjeado exitosamente",
            "articulo": {
                "id": articulo.id,
                "titulo": articulo.titulo,
                "imagen_url": articulo.imagen_url
            }
        })
    
    # 2. Propuestas enviadas (intercambios iniciados por el usuario)
    propuestas_enviadas = db.query(Propuesta).filter(
        Propuesta.usuario_ofertante_id == current_user.id
    ).order_by(desc(Propuesta.created_at)).limit(limite).all()
    
    for propuesta in propuestas_enviadas:
        # Solo incluir si hay conversación activa (al menos un mensaje)
        tiene_mensajes = db.query(Mensaje).filter(
            or_(
                and_(
                    Mensaje.remitente_id == current_user.id,
                    Mensaje.destinatario_id == propuesta.usuario_receptor_id
                ),
                and_(
                    Mensaje.remitente_id == propuesta.usuario_receptor_id,
                    Mensaje.destinatario_id == current_user.id
                )
            )
        ).first()
        
        if tiene_mensajes:
            estado_texto = {
                EstadoPropuesta.PENDIENTE: "en proceso",
                EstadoPropuesta.ACEPTADA: "aceptada",
                EstadoPropuesta.RECHAZADA: "rechazada",
                EstadoPropuesta.COMPLETADA: "completada"
            }.get(propuesta.estado, "en proceso")
            
            actividades.append({
                "tipo": "propuesta_enviada",
                "fecha": propuesta.created_at,
                "descripcion": f"Propuesta de intercambio {estado_texto}: '{propuesta.articulo_ofrecido.titulo}' por '{propuesta.articulo_solicitado.titulo}'",
                "propuesta": {
                    "id": propuesta.id,
                    "estado": propuesta.estado,
                    "articulo_ofrecido": propuesta.articulo_ofrecido.titulo,
                    "articulo_solicitado": propuesta.articulo_solicitado.titulo
                }
            })
    
    # 3. Propuestas recibidas con conversación
    propuestas_recibidas = db.query(Propuesta).filter(
        Propuesta.usuario_receptor_id == current_user.id
    ).order_by(desc(Propuesta.created_at)).limit(limite).all()
    
    for propuesta in propuestas_recibidas:
        # Solo incluir si hay conversación activa
        tiene_mensajes = db.query(Mensaje).filter(
            or_(
                and_(
                    Mensaje.remitente_id == current_user.id,
                    Mensaje.destinatario_id == propuesta.usuario_ofertante_id
                ),
                and_(
                    Mensaje.remitente_id == propuesta.usuario_ofertante_id,
                    Mensaje.destinatario_id == current_user.id
                )
            )
        ).first()
        
        if tiene_mensajes:
            actividades.append({
                "tipo": "propuesta_recibida",
                "fecha": propuesta.created_at,
                "descripcion": f"Recibiste propuesta de intercambio de {propuesta.usuario_ofertante.nombre_completo}",
                "propuesta": {
                    "id": propuesta.id,
                    "estado": propuesta.estado,
                    "articulo_ofrecido": propuesta.articulo_ofrecido.titulo,
                    "articulo_solicitado": propuesta.articulo_solicitado.titulo,
                    "usuario": propuesta.usuario_ofertante.nombre_completo
                }
            })
    
    # 4. Conversaciones iniciadas (primer mensaje enviado a cada usuario)
    # Obtener primeros mensajes únicos por destinatario
    subquery = db.query(
        Mensaje.destinatario_id,
        func.min(Mensaje.id).label('primer_mensaje_id')
    ).filter(
        Mensaje.remitente_id == current_user.id
    ).group_by(Mensaje.destinatario_id).subquery()
    
    primeros_mensajes = db.query(Mensaje).join(
        subquery,
        and_(
            Mensaje.destinatario_id == subquery.c.destinatario_id,
            Mensaje.id == subquery.c.primer_mensaje_id
        )
    ).order_by(desc(Mensaje.created_at)).limit(limite).all()
    
    for mensaje in primeros_mensajes:
        actividades.append({
            "tipo": "conversacion_iniciada",
            "fecha": mensaje.created_at,
            "descripcion": f"Iniciaste conversación con {mensaje.destinatario.nombre_completo}",
            "mensaje": {
                "destinatario": mensaje.destinatario.nombre_completo,
                "contenido_preview": mensaje.contenido[:50] + "..." if len(mensaje.contenido) > 50 else mensaje.contenido
            }
        })
    
    # Ordenar todas las actividades por fecha descendente
    actividades.sort(key=lambda x: x["fecha"], reverse=True)
    
    # Limitar al número solicitado
    return actividades[:limite]


@router.get("/intercambios-activos", response_model=dict)
async def get_intercambios_activos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cuenta los intercambios activos basados en conversaciones iniciadas.
    
    Solo cuenta propuestas donde el usuario haya enviado o recibido mensajes,
    lo que indica que hay una conversación activa y un intercambio en proceso.
    
    Returns:
        dict: Conteo de intercambios activos
    """
    # Propuestas donde el usuario es ofertante y hay conversación
    propuestas_ofertante = db.query(Propuesta).filter(
        Propuesta.usuario_ofertante_id == current_user.id,
        Propuesta.estado == EstadoPropuesta.PENDIENTE
    ).all()
    
    intercambios_activos = 0
    
    for propuesta in propuestas_ofertante:
        # Verificar si hay mensajes entre los usuarios
        tiene_mensajes = db.query(Mensaje).filter(
            or_(
                and_(
                    Mensaje.remitente_id == current_user.id,
                    Mensaje.destinatario_id == propuesta.usuario_receptor_id
                ),
                and_(
                    Mensaje.remitente_id == propuesta.usuario_receptor_id,
                    Mensaje.destinatario_id == current_user.id
                )
            )
        ).first()
        
        if tiene_mensajes:
            intercambios_activos += 1
    
    # Propuestas donde el usuario es receptor y hay conversación
    propuestas_receptor = db.query(Propuesta).filter(
        Propuesta.usuario_receptor_id == current_user.id,
        Propuesta.estado == EstadoPropuesta.PENDIENTE
    ).all()
    
    for propuesta in propuestas_receptor:
        # Verificar si hay mensajes entre los usuarios
        tiene_mensajes = db.query(Mensaje).filter(
            or_(
                and_(
                    Mensaje.remitente_id == current_user.id,
                    Mensaje.destinatario_id == propuesta.usuario_ofertante_id
                ),
                and_(
                    Mensaje.remitente_id == propuesta.usuario_ofertante_id,
                    Mensaje.destinatario_id == current_user.id
                )
            )
        ).first()
        
        if tiene_mensajes:
            intercambios_activos += 1
    
    return {
        "activos": intercambios_activos,
        "descripcion": "Intercambios con conversación activa"
    }
