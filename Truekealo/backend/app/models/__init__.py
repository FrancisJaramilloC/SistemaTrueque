"""
Módulo de Modelos
Exporta todos los modelos de la aplicación
"""
from app.models.user import User
from app.models.articulo import Articulo, EstadoArticulo, CategoriaArticulo
from app.models.propuesta import Propuesta, EstadoPropuesta
from app.models.mensaje import Mensaje

__all__ = [
    "User",
    "Articulo",
    "EstadoArticulo",
    "CategoriaArticulo",
    "Propuesta",
    "EstadoPropuesta",
    "Mensaje"
]
