"""
Módulo de Schemas
Exporta todos los schemas de la aplicación
"""
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserLogin,
    UserResponse,
    Token,
    TokenData
)
from app.schemas.articulo import (
    ArticuloCreate,
    ArticuloUpdate,
    ArticuloResponse,
    ArticuloWithOwner
)
from app.schemas.propuesta import (
    PropuestaCreate,
    PropuestaUpdate,
    PropuestaResponse,
    PropuestaDetalle
)
from app.schemas.mensaje import (
    MensajeCreate,
    MensajeResponse,
    MensajeDetalle
)

__all__ = [
    # User schemas
    "UserCreate",
    "UserUpdate",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenData",
    # Articulo schemas
    "ArticuloCreate",
    "ArticuloUpdate",
    "ArticuloResponse",
    "ArticuloWithOwner",
    # Propuesta schemas
    "PropuestaCreate",
    "PropuestaUpdate",
    "PropuestaResponse",
    "PropuestaDetalle",
    # Mensaje schemas
    "MensajeCreate",
    "MensajeResponse",
    "MensajeDetalle"
]
