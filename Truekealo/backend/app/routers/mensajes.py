"""
Router de Mensajes
Endpoints para gestión de mensajería entre usuarios
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from datetime import datetime

from app.database import get_db
from app.schemas.mensaje import MensajeCreate, MensajeResponse
from app.models.mensaje import Mensaje
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/mensajes", tags=["Mensajes"])


@router.post("/", response_model=MensajeResponse, status_code=status.HTTP_200_OK)
async def enviar_mensaje(
    mensaje_data: MensajeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Envía un mensaje a otro usuario
    
    Args:
        mensaje_data: Datos del mensaje
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        MensajeResponse: Mensaje creado
    """
    # Verificar que el destinatario existe
    destinatario = db.query(User).filter(User.id == mensaje_data.destinatario_id).first()
    if not destinatario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario destinatario no existe"
        )
    
    # No permitir enviarse mensajes a sí mismo
    if mensaje_data.destinatario_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes enviarte mensajes a ti mismo"
        )
    
    # Crear el mensaje
    new_mensaje = Mensaje(
        remitente_id=current_user.id,
        destinatario_id=mensaje_data.destinatario_id,
        contenido=mensaje_data.contenido
    )
    
    db.add(new_mensaje)
    db.commit()
    db.refresh(new_mensaje)
    
    return new_mensaje


@router.get("/conversacion/{usuario_id}", response_model=List[MensajeResponse])
async def get_conversacion(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene todos los mensajes de una conversación con otro usuario
    
    Args:
        usuario_id: ID del otro usuario
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        List[MensajeResponse]: Lista de mensajes de la conversación
    """
    mensajes = db.query(Mensaje).filter(
        or_(
            and_(Mensaje.remitente_id == current_user.id, Mensaje.destinatario_id == usuario_id),
            and_(Mensaje.remitente_id == usuario_id, Mensaje.destinatario_id == current_user.id)
        )
    ).order_by(Mensaje.created_at.asc()).all()
    
    # Marcar como leídos los mensajes recibidos
    for mensaje in mensajes:
        if mensaje.destinatario_id == current_user.id and not mensaje.leido:
            mensaje.leido = True
    
    db.commit()
    
    return mensajes


@router.get("/conversaciones", response_model=List[dict])
async def get_conversaciones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene la lista de conversaciones del usuario con el último mensaje de cada una
    
    Args:
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        List[dict]: Lista de conversaciones
    """
    # Obtener todos los mensajes donde el usuario es remitente o destinatario
    mensajes = db.query(Mensaje).filter(
        or_(
            Mensaje.remitente_id == current_user.id,
            Mensaje.destinatario_id == current_user.id
        )
    ).order_by(Mensaje.created_at.desc()).all()
    
    # Agrupar por usuario (conversación)
    conversaciones_dict = {}
    for mensaje in mensajes:
        # Determinar el ID del otro usuario
        otro_usuario_id = mensaje.destinatario_id if mensaje.remitente_id == current_user.id else mensaje.remitente_id
        
        # Si no está en el diccionario, agregarlo
        if otro_usuario_id not in conversaciones_dict:
            otro_usuario = db.query(User).filter(User.id == otro_usuario_id).first()
            
            # Contar mensajes no leídos
            mensajes_no_leidos = db.query(Mensaje).filter(
                and_(
                    Mensaje.remitente_id == otro_usuario_id,
                    Mensaje.destinatario_id == current_user.id,
                    Mensaje.leido == False
                )
            ).count()
            
            conversaciones_dict[otro_usuario_id] = {
                "otro_usuario_id": otro_usuario_id,
                "otro_usuario_nombre": otro_usuario.nombre_completo,
                "otro_usuario_email": otro_usuario.email,
                "ultimo_mensaje": mensaje.contenido,
                "ultimo_mensaje_fecha": mensaje.created_at,
                "mensajes_no_leidos": mensajes_no_leidos,
                "es_remitente": mensaje.remitente_id == current_user.id
            }
    
    # Convertir a lista y ordenar por fecha
    conversaciones = list(conversaciones_dict.values())
    conversaciones.sort(key=lambda x: x["ultimo_mensaje_fecha"], reverse=True)
    
    return conversaciones


@router.put("/{mensaje_id}/leer", response_model=MensajeResponse)
async def marcar_leido(
    mensaje_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marca un mensaje como leído
    
    Args:
        mensaje_id: ID del mensaje
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        MensajeResponse: Mensaje actualizado
    """
    mensaje = db.query(Mensaje).filter(Mensaje.id == mensaje_id).first()
    
    if not mensaje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensaje no encontrado"
        )
    
    # Solo el destinatario puede marcar como leído
    if mensaje.destinatario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para marcar este mensaje como leído"
        )
    
    mensaje.leido = True
    db.commit()
    db.refresh(mensaje)
    
    return mensaje

@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve la cantidad de mensajes no leídos para el usuario actual.

    El conteo se recalcula en cada solicitud y no depende de procesos
    automatizados. Se utiliza para actualizar el contador de mensajes pendientes
    en el dashboard y en la vista de mensajería.
    """
    unread = db.query(Mensaje).filter(
        Mensaje.destinatario_id == current_user.id,
        Mensaje.leido == False
    ).count()

    return {"unread": unread}
