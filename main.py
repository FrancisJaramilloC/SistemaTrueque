from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.router.router_cliente import cliente_router
from src.router.router_trueque import trueque_router
from src.router.router_tipo_dni import tipo_dni_router
from src.router.router_persona import persona_router
from src.router.router_categoria import categoria_router
from src.router.router_articulo import articulo_router
from src.router.router_oferta import oferta_router
from src.router.router_auth import auth_router  # ← Nuevo router de autenticación
from src.model import *
from config.db import engine, meta_data
from config.security import ALLOWED_ORIGINS


# Crear la aplicación FastAPI
app = FastAPI(
    title="API Sistema de Trueques",
    description="API REST para gestión de trueques con autenticación JWT",
    version="1.0.0"
)

# CONFIGURACIÓN DE CORS
# Sin CORS, el navegador bloquearía las peticiones por seguridad.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Orígenes permitidos (desde .env)
    allow_credentials=True,          # Permitir cookies y headers de autenticación
    allow_methods=["*"],             # Métodos HTTP permitidos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],             # Headers permitidos (Authorization, Content-Type, etc.)
)

# REGISTRO DE ROUTERS
# Cada router agrupa las rutas de un módulo específico
# Router de autenticación (login, registro, etc.)
app.include_router(auth_router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(cliente_router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(trueque_router, prefix="/api/trueques", tags=["Trueques"])
app.include_router(tipo_dni_router, prefix="/api/tipo-dni", tags=["Tipo de Identificación"])
app.include_router(persona_router, prefix="/api/personas", tags=["Personas"])
app.include_router(categoria_router, prefix="/api/categorias", tags=["Categorias"])
app.include_router(articulo_router, prefix="/api/articulos", tags=["Articulos"])
app.include_router(oferta_router, prefix="/api/ofertas", tags=["Ofertas"])

@app.get("/", tags=["Root"])
def root():
    """
    Ruta raíz - Información básica de la API.
    """
    return {
        "mensaje": "Bienvenido a la API del Sistema de Trueques",
        "version": "1.0.0",
        "documentacion": "/docs",
        "endpoints_principales": {
            "autenticacion": "/api/auth",
            "clientes": "/api/clientes",
            "articulos": "/api/articulos",
            "trueques": "/api/trueques"
        }
    }