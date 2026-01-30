"""
Router de Artículos
Endpoints CRUD para gestión de artículos
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime
from pathlib import Path

from app.database import get_db
from app.schemas.articulo import ArticuloCreate, ArticuloUpdate, ArticuloResponse, ArticuloWithOwner
from app.models.articulo import Articulo, CategoriaArticulo, EstadoArticulo
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/articulos", tags=["Artículos"])

# Directorio para almacenar imágenes (usando ruta absoluta)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "articulos")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=ArticuloResponse, status_code=status.HTTP_201_CREATED)
async def create_articulo(
    articulo_data: ArticuloCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea un nuevo artículo
    
    Args:
        articulo_data: Datos del artículo
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        ArticuloResponse: Artículo creado
    """
    new_articulo = Articulo(
        **articulo_data.model_dump(),
        propietario_id=current_user.id
    )
    
    db.add(new_articulo)
    db.commit()
    db.refresh(new_articulo)
    
    return new_articulo


@router.get("/", response_model=List[ArticuloWithOwner])
async def get_articulos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    categoria: Optional[CategoriaArticulo] = None,
    estado: Optional[EstadoArticulo] = None,
    busqueda: Optional[str] = Query(None, description="Buscar por título o descripción"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de artículos públicos con paginación y filtros
    Por defecto solo muestra artículos con estado 'publicado'
    
    Args:
        skip: Número de registros a saltar
        limit: Número máximo de registros a devolver
        categoria: Filtro por categoría (opcional)
        estado: Filtro por estado (opcional)
        busqueda: Buscar por título o descripción (opcional)
        db: Sesión de base de datos
        
    Returns:
        List[ArticuloWithOwner]: Lista de artículos
    """
    query = db.query(Articulo)
    
    # Si no se especifica estado, filtrar solo por disponibles
    if estado:
        query = query.filter(Articulo.estado_articulo == estado)
    else:
        query = query.filter(Articulo.estado_articulo == EstadoArticulo.DISPONIBLE)
    
    if categoria:
        query = query.filter(Articulo.categoria == categoria)
    
    # Búsqueda por título o descripción
    if busqueda:
        search_term = f"%{busqueda}%"
        query = query.filter(
            (Articulo.titulo.ilike(search_term)) | 
            (Articulo.descripcion.ilike(search_term))
        )
    
    # Ordenar por más recientes primero
    query = query.order_by(Articulo.created_at.desc())
    
    articulos = query.offset(skip).limit(limit).all()
    
    # Convertir a diccionario con información del propietario
    result = []
    for articulo in articulos:
        articulo_dict = {
            "id": articulo.id,
            "titulo": articulo.titulo,
            "descripcion": articulo.descripcion,
            "categoria": articulo.categoria,
            "estado_articulo": articulo.estado_articulo,
            "valor_estimado": articulo.valor_estimado,
            "imagen_url": articulo.imagen_url,
            "condicion": articulo.condicion,
            "propietario_id": articulo.propietario_id,
            "created_at": articulo.created_at,
            "updated_at": articulo.updated_at,
            "propietario": {
                "id": articulo.propietario.id,
                "nombre_completo": articulo.propietario.nombre_completo,
                "email": articulo.propietario.email,
                "ubicacion": articulo.propietario.ubicacion
            }
        }
        result.append(articulo_dict)
    
    return result


@router.get("/mis-articulos", response_model=List[ArticuloResponse])
async def get_my_articulos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Obtiene los artículos del usuario autenticado
    
    Args:
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        List[ArticuloResponse]: Lista de artículos del usuario
    """
    articulos = db.query(Articulo).filter(
        Articulo.propietario_id == current_user.id
    ).all()
    
    return articulos


@router.get("/{articulo_id}", response_model=ArticuloWithOwner)
async def get_articulo(articulo_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un artículo por ID
    
    Args:
        articulo_id: ID del artículo
        db: Sesión de base de datos
        
    Returns:
        ArticuloWithOwner: Artículo solicitado
        
    Raises:
        HTTPException: Si el artículo no existe
    """
    articulo = db.query(Articulo).filter(Articulo.id == articulo_id).first()
    
    if not articulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artículo no encontrado"
        )
    
    return {
        "id": articulo.id,
        "titulo": articulo.titulo,
        "descripcion": articulo.descripcion,
        "categoria": articulo.categoria,
        "estado_articulo": articulo.estado_articulo,
        "valor_estimado": articulo.valor_estimado,
        "imagen_url": articulo.imagen_url,
        "condicion": articulo.condicion,
        "propietario_id": articulo.propietario_id,
        "created_at": articulo.created_at,
        "updated_at": articulo.updated_at,
        "propietario": {
            "id": articulo.propietario.id,
            "nombre_completo": articulo.propietario.nombre_completo,
            "email": articulo.propietario.email,
            "ubicacion": articulo.propietario.ubicacion
        }
    }


@router.put("/{articulo_id}", response_model=ArticuloResponse)
async def update_articulo(
    articulo_id: int,
    articulo_data: ArticuloUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualiza un artículo
    
    Args:
        articulo_id: ID del artículo
        articulo_data: Datos actualizados
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        ArticuloResponse: Artículo actualizado
        
    Raises:
        HTTPException: Si el artículo no existe o no pertenece al usuario
    """
    articulo = db.query(Articulo).filter(Articulo.id == articulo_id).first()
    
    if not articulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artículo no encontrado"
        )
    
    if articulo.propietario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar este artículo"
        )
    
    # Actualizar campos
    update_data = articulo_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(articulo, field, value)
    
    db.commit()
    db.refresh(articulo)
    
    return articulo


@router.delete("/{articulo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_articulo(
    articulo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Elimina un artículo
    
    Args:
        articulo_id: ID del artículo
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Raises:
        HTTPException: Si el artículo no existe o no pertenece al usuario
    """
    articulo = db.query(Articulo).filter(Articulo.id == articulo_id).first()
    
    if not articulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artículo no encontrado"
        )
    
    if articulo.propietario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este artículo"
        )
    
    db.delete(articulo)
    db.commit()


@router.post("/{articulo_id}/imagen", response_model=ArticuloResponse)
async def upload_articulo_image(
    articulo_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sube una imagen para un artículo
    
    Args:
        articulo_id: ID del artículo
        file: Archivo de imagen
        db: Sesión de base de datos
        current_user: Usuario autenticado
        
    Returns:
        ArticuloResponse: Artículo actualizado con la URL de imagen
        
    Raises:
        HTTPException: Si el artículo no existe o no pertenece al usuario
    """
    articulo = db.query(Articulo).filter(Articulo.id == articulo_id).first()
    
    if not articulo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artículo no encontrado"
        )
    
    if articulo.propietario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para subir imágenes para este artículo"
        )
    
    # Validar que sea una imagen
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen (JPEG, PNG, GIF o WebP)"
        )
    
    try:
        # Generar nombre único para la imagen
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        random_suffix = str(uuid.uuid4())[:8]
        file_extension = file.filename.split('.')[-1].lower()
        filename = f"articulo_{articulo_id}_{timestamp}_{random_suffix}.{file_extension}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Guardar archivo
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)
        
        # Actualizar URL de imagen en el artículo
        image_url = f"/uploads/articulos/{filename}"
        articulo.imagen_url = image_url
        
        db.commit()
        db.refresh(articulo)
        
        return articulo
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar la imagen: {str(e)}"
        )
