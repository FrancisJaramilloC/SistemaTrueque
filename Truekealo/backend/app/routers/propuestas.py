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
from app.models.articulo import Articulo
from app.models.user import User
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
    
    # Solo el receptor puede aceptar/rechazar
    if propuesta.usuario_receptor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el receptor puede actualizar esta propuesta"
        )
    
    propuesta.estado = propuesta_data.estado
    if propuesta_data.mensaje:
        propuesta.mensaje = propuesta_data.mensaje
    
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
