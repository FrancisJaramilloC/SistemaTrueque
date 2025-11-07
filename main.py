from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from src.router.router_cliente import cliente_router
from src.router.router_trueque import trueque_router
from src.router.router_tipo_dni import tipo_dni_router
from src.router.router_persona import persona_router
from src.router.router_categoria import categoria_router
from src.router.router_articulo import articulo_router
from src.router.router_oferta import oferta_router
from src.router.router_oferta_trueque import oferta_trueque_router
from src.router.router_sistema_trueque import sistema_trueque_router  # NUEVO
from src.model import *
from config.db import engine, meta_data

meta_data.create_all(engine)

app = FastAPI(title="Sistema de Trueque", version="1.0.0")

# Configurar CORS - IMPORTANTE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear directorios si no existen
uploads_path = Path("uploads")
uploads_path.mkdir(exist_ok=True)
(uploads_path / "articulos").mkdir(exist_ok=True)
(uploads_path / "thumbnails").mkdir(exist_ok=True)

# Montar archivos estáticos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(cliente_router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(trueque_router, prefix="/api/trueques", tags=["Trueques"])
app.include_router(tipo_dni_router, prefix="/api/tipo-dni", tags=["Tipo de Identificación"])
app.include_router(persona_router, prefix="/api/personas", tags=["Personas"])
app.include_router(categoria_router, prefix="/api/categorias", tags=["Categorias"])
app.include_router(articulo_router, prefix="/api/articulos", tags=["Articulos"])
app.include_router(oferta_router, prefix="/api/ofertas", tags=["Ofertas"])
app.include_router(oferta_trueque_router, prefix="/api/trueques", tags=["Sistema de Trueques"])
app.include_router(sistema_trueque_router, prefix="/api/sistema-trueque", tags=["🔄 Sistema de Trueques"])