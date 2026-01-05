"""
Configuración centralizada de la aplicación
Gestiona variables de entorno y configuraciones globales
"""
from pydantic_settings import BaseSettings
from typing import List, Union
import os
import json
from pathlib import Path

# Determinar la ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """
    Clase de configuración que carga variables desde .env
    Utiliza pydantic-settings para validación automática
    """
    
    # ==================== Configuración de Base de Datos ====================
    DB_DRIVER: str = "mysql+pymysql"  # puedes cambiar a "mariadb+mariadbconnector"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "truekealo_db"
    
    @property
    def DATABASE_URL(self) -> str:
        """Genera la URL de conexión a MariaDB"""
        return f"{self.DB_DRIVER}://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # ==================== Configuración de Seguridad ====================
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # ==================== Configuración de la Aplicación ====================
    APP_NAME: str = "Truekealo API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # ==================== Configuración de CORS ====================
    ALLOWED_ORIGINS: Union[str, List[str]] = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://localhost:8000",
        "http://127.0.0.1:5500",
        "http://127.0.0.1:8000"
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: Union[str, List[str]] = ["*"]
    CORS_ALLOW_HEADERS: Union[str, List[str]] = ["*"]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Parse ALLOWED_ORIGINS si viene como string JSON desde .env
        if isinstance(self.ALLOWED_ORIGINS, str):
            try:
                self.ALLOWED_ORIGINS = json.loads(self.ALLOWED_ORIGINS)
            except json.JSONDecodeError:
                self.ALLOWED_ORIGINS = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',')]
        # Parse CORS_ALLOW_METHODS si viene como string
        if isinstance(self.CORS_ALLOW_METHODS, str):
            try:
                self.CORS_ALLOW_METHODS = json.loads(self.CORS_ALLOW_METHODS)
            except json.JSONDecodeError:
                self.CORS_ALLOW_METHODS = [method.strip() for method in self.CORS_ALLOW_METHODS.split(',')]
        # Parse CORS_ALLOW_HEADERS si viene como string
        if isinstance(self.CORS_ALLOW_HEADERS, str):
            try:
                self.CORS_ALLOW_HEADERS = json.loads(self.CORS_ALLOW_HEADERS)
            except json.JSONDecodeError:
                self.CORS_ALLOW_HEADERS = [header.strip() for header in self.CORS_ALLOW_HEADERS.split(',')]
    
    class Config:
        """Configuración de pydantic"""
        env_file = os.path.join(BASE_DIR, ".env")
        case_sensitive = True


# Instancia global de configuración
settings = Settings()
