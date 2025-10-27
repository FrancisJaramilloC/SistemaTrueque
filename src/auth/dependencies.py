from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from src.auth.auth_utils import verify_token
from typing import Optional

# CONFIGURACIÓN DEL ESQUEMA DE SEGURIDAD
# HTTPBearer es el esquema que espera un token en el header:

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    # Extraer el token del objeto credentials
    token = credentials.credentials
    
    # Verificar el token usando nuestra función de auth_utils
    payload = verify_token(token)
    
    # Si el token es inválido, verify_token retorna None
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado. Por favor, inicia sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},  # Estándar HTTP para autenticación
        )
    
    # Extraer el username del payload del token
    # "sub" es el campo estándar para el identificador del usuario
    username: Optional[str] = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no contiene información válida del usuario.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    if credentials is None:
        return None
    token = credentials.credentials
    payload = verify_token(token)
    return payload if payload else None
