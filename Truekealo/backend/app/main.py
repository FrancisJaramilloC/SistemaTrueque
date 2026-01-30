"""
Aplicación Principal de FastAPI
Configura la aplicación, middleware, CORS y rutas
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from pathlib import Path

from app.core.config import settings
from app.routers import auth, articulos, propuestas, mensajes


# ==================== Ciclo de Vida de la Aplicación ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestiona el ciclo de vida de la aplicación
    Se ejecuta al iniciar y cerrar la aplicación
    """
    # Startup: Verificar conexión a base de datos
    print("Iniciando aplicación...")
    try:
        # No creamos tablas; solo probamos conexión a la BD configurada
        from app.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"✅ Conexión a base de datos '{settings.DB_NAME}' exitosa")
    except Exception as e:
        print(f"⚠️ Advertencia: No se pudo conectar a BD '{settings.DB_NAME}': {e}")
        print("La aplicación continuará. Verifica que MariaDB esté corriendo y las credenciales sean correctas.")
    
    yield
    
    # Shutdown
    print("Cerrando aplicación...")


# ==================== Configuración de la Aplicación ====================
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para sistema de intercambio de artículos (Trueque)",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)


# ==================== Configuración de CORS ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


# ==================== Configuración de Archivos Estáticos ====================
# Crear directorio de uploads si no existe
# Estructura: Truekealo/backend/app/main.py -> Subir 3 niveles para llegar a Truekealo/uploads
BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOADS_DIR, "articulos"), exist_ok=True)

# Montar directorio de uploads para servir archivos estáticos
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


# ==================== Middleware de Manejo de Errores ====================
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Manejador global de excepciones
    Captura errores no controlados y devuelve una respuesta JSON
    """
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Error interno del servidor",
            "error": str(exc) if settings.DEBUG else "Error interno"
        }
    )


# ==================== Rutas ====================
@app.get("/", tags=["Root"])
async def root():
    """
    Endpoint raíz que muestra información de la API
    """
    return {
        "message": "Bienvenido a Truekealo API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "health": "/health"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Endpoint de verificación de salud
    Útil para monitoreo y balanceadores de carga
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


# ==================== Inclusión de Routers ====================
app.include_router(auth.router, prefix="/api/v1")
app.include_router(articulos.router, prefix="/api/v1")
app.include_router(propuestas.router, prefix="/api/v1")
app.include_router(mensajes.router, prefix="/api/v1")


# ==================== Información de Debug ====================
if __name__ == "__main__":
    import uvicorn
    
    print(f"""
    ╔══════════════════════════════════════════════════════════╗
    ║                 🎯 Truekealo API                         ║
    ║                                                          ║
    ║  🌐 Servidor: http://localhost:8000                      ║
    ║  📚 Documentación: http://localhost:8000/api/docs        ║
    ║  🔒 CORS habilitado para: {', '.join(settings.ALLOWED_ORIGINS[:2])}...║
    ║  ⚡ Modo: {'DEBUG' if settings.DEBUG else 'PRODUCTION'}                                          ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
