from fastapi import FastAPI
from src.router.router_cliente import cliente_router
from src.router.router_trueque import trueque_router
from src.router.router_tipo_dni import tipo_dni_router
from src.router.router_persona import persona_router
from src.router.router_categoria import categoria_router
from src.router.router_articulo import articulo_router
from src.router.router_oferta import oferta_router
from src.model import  *

app = FastAPI()

app.include_router(cliente_router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(trueque_router, prefix="/api/trueques", tags=["Trueques"])
app.include_router(tipo_dni_router, prefix="/api/tipo-dni", tags=["Tipo de Identificación"])
app.include_router(persona_router, prefix="/api/personas", tags=["Personas"])
app.include_router(categoria_router, prefix="/api/categorias", tags=["Categorias"])
app.include_router(articulo_router, prefix="/api/articulos", tags=["Articulos"])
app.include_router(oferta_router, prefix="/api/ofertas", tags=["Ofertas"])