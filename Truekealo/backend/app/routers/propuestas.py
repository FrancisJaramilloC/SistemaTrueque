"""
Router de Propuestas
Endpoints para gestión de propuestas de intercambio
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas.propuesta import PropuestaCreate, PropuestaUpdate, PropuestaResponse, PropuestaDetalle
from app.models.propuesta import Propuesta, EstadoPropuesta
from app.models.articulo import Articulo, EstadoArticulo
from app.models.user import User
from app.models.mensaje import Mensaje, TipoMensaje
from app.core.security import get_current_user

router = APIRouter(prefix="/propuestas", tags=["Propuestas"])


@router.post("/", response_model=PropuestaResponse, status_code=status.HTTP_201_CREATED)
async def create_propuesta(
    propuesta_data: PropuestaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea una nueva propuesta de intercambio
    
    Args:
        propuesta_data: Datos de la propuesta
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        PropuestaResponse: Propuesta creada
        
    Raises:
        HTTPException: Si los artículos no existen o hay errores de validación
    """
    # Verificar que ambos artículos existan
    articulo_ofrecido = db.query(Articulo).filter(
        Articulo.id == propuesta_data.articulo_ofrecido_id
    ).first()
    articulo_solicitado = db.query(Articulo).filter(
        Articulo.id == propuesta_data.articulo_solicitado_id
    ).first()
    
    if not articulo_ofrecido or not articulo_solicitado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uno o ambos artículos no existen"
        )
    
    # Verificar que el artículo ofrecido pertenezca al usuario actual
    if articulo_ofrecido.propietario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes ofrecer tus propios artículos"
        )
    
    # Verificar que no se haga una propuesta sobre el propio artículo
    if articulo_solicitado.propietario_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes hacer una propuesta sobre tu propio artículo"
        )
    
    # Verificar que el artículo solicitado esté disponible
    if articulo_solicitado.estado_articulo != "disponible":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El artículo solicitado ya no está disponible"
        )
    
    # Verificar que el artículo ofrecido esté disponible
    if articulo_ofrecido.estado_articulo != "disponible":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tu artículo ya no está disponible para intercambio"
        )
    
    # Verificar que no exista ya una propuesta PENDIENTE del mismo usuario para el mismo artículo
    propuesta_existente = db.query(Propuesta).filter(
        Propuesta.usuario_ofertante_id == current_user.id,
        Propuesta.articulo_solicitado_id == propuesta_data.articulo_solicitado_id,
        Propuesta.estado == EstadoPropuesta.PENDIENTE
    ).first()
    
    if propuesta_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya tienes una propuesta pendiente para este artículo. Espera respuesta antes de enviar otra."
        )
    
    # Crear la propuesta
    new_propuesta = Propuesta(
        usuario_ofertante_id=current_user.id,
        usuario_receptor_id=articulo_solicitado.propietario_id,
        articulo_ofrecido_id=propuesta_data.articulo_ofrecido_id,
        articulo_solicitado_id=propuesta_data.articulo_solicitado_id,
        mensaje=propuesta_data.mensaje
    )
    
    db.add(new_propuesta)
    db.commit()
    db.refresh(new_propuesta)
    
    # Crear mensaje automático para iniciar conversación
    mensaje_contenido = f"Te he enviado una propuesta de intercambio:\n\n"
    mensaje_contenido += f"🔄 Ofrezco: {articulo_ofrecido.titulo}\n"
    mensaje_contenido += f"🎯 A cambio de: {articulo_solicitado.titulo}"
    
    if propuesta_data.mensaje:
        mensaje_contenido += f"\n\n💬 Mensaje: {propuesta_data.mensaje}"
    
    nuevo_mensaje = Mensaje(
        remitente_id=current_user.id,
        destinatario_id=articulo_solicitado.propietario_id,
        contenido=mensaje_contenido,
        leido=False
    )
    
    db.add(nuevo_mensaje)
    db.commit()
    
    return new_propuesta


@router.get("/recibidas", response_model=List[PropuestaDetalle])
async def get_propuestas_recibidas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene las propuestas recibidas por el usuario
    
    Args:
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        List[PropuestaDetalle]: Lista de propuestas recibidas
    """
    propuestas = db.query(Propuesta).filter(
        Propuesta.usuario_receptor_id == current_user.id
    ).all()
    
    return [_serialize_propuesta(p) for p in propuestas]


@router.get("/enviadas", response_model=List[PropuestaDetalle])
async def get_propuestas_enviadas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene las propuestas enviadas por el usuario
    
    Args:
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        List[PropuestaDetalle]: Lista de propuestas enviadas
    """
    propuestas = db.query(Propuesta).filter(
        Propuesta.usuario_ofertante_id == current_user.id
    ).all()
    
    return [_serialize_propuesta(p) for p in propuestas]


@router.get("/resumen", response_model=dict)
async def get_resumen_pendientes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve un resumen de propuestas pendientes para el usuario actual.

    Se consideran pendientes todas las propuestas en estado "pendiente" donde el
    usuario sea ofertante o receptor. Este valor se usa para el contador de
    intercambios pendientes en el dashboard y se calcula al momento de la
    consulta, sin procesos automáticos.
    """
    pendientes = db.query(Propuesta).filter(
        Propuesta.estado == EstadoPropuesta.PENDIENTE,
        or_(
            Propuesta.usuario_ofertante_id == current_user.id,
            Propuesta.usuario_receptor_id == current_user.id
        )
    ).count()

    total_usuario = db.query(Propuesta).filter(
        or_(
            Propuesta.usuario_ofertante_id == current_user.id,
            Propuesta.usuario_receptor_id == current_user.id
        )
    ).count()

    return {
        "pendientes": pendientes,
        "total": total_usuario
    }


@router.get("/{propuesta_id}", response_model=PropuestaDetalle)
async def get_propuesta(
    propuesta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene los detalles de una propuesta
    
    Args:
        propuesta_id: ID de la propuesta
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        PropuestaDetalle: Detalles de la propuesta
        
    Raises:
        HTTPException: Si la propuesta no existe o el usuario no tiene acceso
    """
    propuesta = db.query(Propuesta).filter(Propuesta.id == propuesta_id).first()
    
    if not propuesta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propuesta no encontrada"
        )
    
    # Verificar que el usuario sea parte de la propuesta
    if propuesta.usuario_ofertante_id != current_user.id and \
       propuesta.usuario_receptor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes acceso a esta propuesta"
        )
    
    return _serialize_propuesta(propuesta)


@router.patch("/{propuesta_id}", response_model=PropuestaResponse)
async def update_propuesta_estado(
    propuesta_id: int,
    propuesta_data: PropuestaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualiza el estado de una propuesta (aceptar/rechazar)
    
    Args:
        propuesta_id: ID de la propuesta
        propuesta_data: Datos actualizados
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        PropuestaResponse: Propuesta actualizada
        
    Raises:
        HTTPException: Si la propuesta no existe o el usuario no tiene permiso
    """
    propuesta = db.query(Propuesta).filter(Propuesta.id == propuesta_id).first()
    
    if not propuesta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propuesta no encontrada"
        )
    
    # Validar permisos según el estado
    es_receptor = propuesta.usuario_receptor_id == current_user.id
    es_ofertante = propuesta.usuario_ofertante_id == current_user.id
    
    # El receptor puede aceptar/rechazar
    if propuesta_data.estado in ['aceptada', 'rechazada']:
        if not es_receptor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el receptor puede aceptar o rechazar esta propuesta"
            )
    
    # El ofertante puede cancelar
    elif propuesta_data.estado == 'cancelada':
        if not es_ofertante:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el ofertante puede cancelar esta propuesta"
            )
    
    # Otros estados no permitidos
    else:
        if not (es_receptor or es_ofertante):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permiso para actualizar esta propuesta"
            )
    
    # Actualizar estado de la propuesta
    propuesta.estado = propuesta_data.estado
    if propuesta_data.mensaje:
        propuesta.mensaje = propuesta_data.mensaje
    
    # Si se acepta la propuesta, cambiar ambos artículos a INTERCAMBIADO
    if propuesta_data.estado == EstadoPropuesta.ACEPTADA:
        articulo_ofrecido = db.query(Articulo).filter(Articulo.id == propuesta.articulo_ofrecido_id).first()
        articulo_solicitado = db.query(Articulo).filter(Articulo.id == propuesta.articulo_solicitado_id).first()
        
        if articulo_ofrecido:
            articulo_ofrecido.estado_articulo = "intercambiado"
            db.add(articulo_ofrecido)
        
        if articulo_solicitado:
            articulo_solicitado.estado_articulo = "intercambiado"
            db.add(articulo_solicitado)
        
        # Enviar mensaje de confirmación
        existing_msg = db.query(Mensaje).filter(
            Mensaje.propuesta_id == propuesta.id,
            Mensaje.tipo == TipoMensaje.SYSTEM
        ).first()
        
        if not existing_msg:
            mensaje_aceptacion = Mensaje(
                remitente_id=current_user.id,
                destinatario_id=propuesta.usuario_ofertante_id,
                contenido=f"✅ ¡He aceptado tu propuesta de intercambio!\n\n🔄 {articulo_solicitado.titulo} ↔️ {articulo_ofrecido.titulo}\n\nAhora podemos coordinar los detalles del intercambio.",
                leido=False,
                tipo=TipoMensaje.SYSTEM,
                propuesta_id=propuesta.id
            )
            db.add(mensaje_aceptacion)
    
    # Si se rechaza, enviar notificación
    elif propuesta_data.estado == EstadoPropuesta.RECHAZADA:
        existing_msg = db.query(Mensaje).filter(
            Mensaje.propuesta_id == propuesta.id,
            Mensaje.tipo == TipoMensaje.SYSTEM,
            Mensaje.contenido.like('%rechazado%')
        ).first()
        
        if not existing_msg:
            mensaje_rechazo = Mensaje(
                remitente_id=current_user.id,
                destinatario_id=propuesta.usuario_ofertante_id,
                contenido=f"❌ He rechazado tu propuesta de intercambio.\n\nPuedes enviar otra propuesta con un artículo diferente si lo deseas.",
                leido=False,
                tipo=TipoMensaje.SYSTEM,
                propuesta_id=propuesta.id
            )
            db.add(mensaje_rechazo)
    
    db.commit()
    db.refresh(propuesta)
    
    return propuesta


def _serialize_propuesta(propuesta: Propuesta) -> dict:
    """Función auxiliar para serializar una propuesta con todos sus detalles"""
    return {
        "id": propuesta.id,
        "usuario_ofertante_id": propuesta.usuario_ofertante_id,
        "usuario_receptor_id": propuesta.usuario_receptor_id,
        "articulo_ofrecido_id": propuesta.articulo_ofrecido_id,
        "articulo_solicitado_id": propuesta.articulo_solicitado_id,
        "mensaje": propuesta.mensaje,
        "estado": propuesta.estado,
        "created_at": propuesta.created_at,
        "updated_at": propuesta.updated_at,
        "articulo_ofrecido": {
            "id": propuesta.articulo_ofrecido.id,
            "titulo": propuesta.articulo_ofrecido.titulo,
            "descripcion": propuesta.articulo_ofrecido.descripcion,
            "imagen_url": propuesta.articulo_ofrecido.imagen_url
        },
        "articulo_solicitado": {
            "id": propuesta.articulo_solicitado.id,
            "titulo": propuesta.articulo_solicitado.titulo,
            "descripcion": propuesta.articulo_solicitado.descripcion,
            "imagen_url": propuesta.articulo_solicitado.imagen_url
        },
        "usuario_ofertante": {
            "id": propuesta.usuario_ofertante.id,
            "nombre_completo": propuesta.usuario_ofertante.nombre_completo,
            "email": propuesta.usuario_ofertante.email
        },
        "usuario_receptor": {
            "id": propuesta.usuario_receptor.id,
            "nombre_completo": propuesta.usuario_receptor.nombre_completo,
            "email": propuesta.usuario_receptor.email
        }
    }


@router.put("/{propuesta_id}/revertir", response_model=PropuestaResponse)
async def revertir_intercambio(
    propuesta_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Revierte un intercambio aceptado, volviendo los artículos a DISPONIBLE
    
    Args:
        propuesta_id: ID de la propuesta aceptada
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        PropuestaResponse: Propuesta actualizada
        
    Raises:
        HTTPException: Si la propuesta no existe, no está aceptada o el usuario no tiene permiso
    """
    propuesta = db.query(Propuesta).filter(Propuesta.id == propuesta_id).first()
    
    if not propuesta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propuesta no encontrada"
        )
    
    # Verificar que el usuario sea parte de la propuesta
    if propuesta.usuario_ofertante_id != current_user.id and \
       propuesta.usuario_receptor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para revertir esta propuesta"
        )
    
    # Verificar que la propuesta esté aceptada
    if propuesta.estado != EstadoPropuesta.ACEPTADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden revertir propuestas aceptadas"
        )
    
    # Cambiar los artículos a DISPONIBLE
    articulo_ofrecido = db.query(Articulo).filter(Articulo.id == propuesta.articulo_ofrecido_id).first()
    articulo_solicitado = db.query(Articulo).filter(Articulo.id == propuesta.articulo_solicitado_id).first()
    
    if articulo_ofrecido:
        articulo_ofrecido.estado_articulo = EstadoArticulo.DISPONIBLE
        db.add(articulo_ofrecido)
    
    if articulo_solicitado:
        articulo_solicitado.estado_articulo = EstadoArticulo.DISPONIBLE
        db.add(articulo_solicitado)
    
    # Cambiar estado de la propuesta a CANCELADA
    propuesta.estado = EstadoPropuesta.CANCELADA
    
    # Notificar al otro usuario solo si no existe mensaje previo
    otro_usuario_id = propuesta.usuario_receptor_id if current_user.id == propuesta.usuario_ofertante_id else propuesta.usuario_ofertante_id
    
    existing_revert_msg = db.query(Mensaje).filter(
        Mensaje.propuesta_id == propuesta.id,
        Mensaje.tipo == TipoMensaje.SYSTEM,
        Mensaje.contenido.like('%no realizado%')
    ).first()
    
    if not existing_revert_msg:
        mensaje_reversion = Mensaje(
            remitente_id=current_user.id,
            destinatario_id=otro_usuario_id,
            contenido=f"🔄 El intercambio ha sido marcado como no realizado.\n\nLos artículos {articulo_ofrecido.titulo} y {articulo_solicitado.titulo} vuelven a estar disponibles.",
            leido=False,
            tipo=TipoMensaje.SYSTEM,
            propuesta_id=propuesta.id
        )
        db.add(mensaje_reversion)
    
    db.commit()
    db.refresh(propuesta)
    
    return propuesta
