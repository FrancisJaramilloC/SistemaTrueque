from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from config.security import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# CONFIGURACIÓN DE HASHEO DE CONTRASEÑAS
# Preferir argon2 (si está disponible). Como fallback usar bcrypt_sha256
# (aplica SHA-256 antes de bcrypt y evita el límite de 72 bytes).
pwd_context = CryptContext(schemes=["argon2", "bcrypt_sha256", "bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """
    Intenta hashear con argon2 primero. Si falla (p.ej. no está instalado),
    hace fallback a bcrypt_sha256. Si ambos fallan lanza ValueError.
    """
    # Intentar argon2 (recomendado)
    try:
        return pwd_context.hash(password, scheme="argon2")
    except Exception:
        # Fallback a bcrypt_sha256
        try:
            return pwd_context.hash(password, scheme="bcrypt_sha256")
        except Exception as e:
            raise ValueError(f"No fue posible hashear la contraseña: {e}") from e

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