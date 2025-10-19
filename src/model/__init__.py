from config.db import engine, meta_data

from .tipo_dni import tipo_dni
from .persona import personas
from .categoria import categorias
from .articulo import articulos
from .oferta import ofertas
from .trueque import trueques
from .cliente import clientes

meta_data.create_all(engine)