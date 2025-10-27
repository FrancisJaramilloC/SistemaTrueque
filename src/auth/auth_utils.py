from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from config.security import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# CONFIGURACIÓN DE HASHEO DE CONTRASEÑAS
# bcrypt es un algoritmo de hasheo muy seguro y lento 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# FUNCIONES PARA MANEJO DE JWT

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    # Copiamos la data para no modificar el original
    to_encode = data.copy()

    # Calculamos cuándo expira el token
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Agregamos la fecha de expiración al token
    to_encode.update({"exp": expire})
    
    # Creamos el token firmado con nuestra clave secreta
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        # Intentamos decodificar el token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Si falla (token inválido, expirado, o modificado), retornamos None
        return None