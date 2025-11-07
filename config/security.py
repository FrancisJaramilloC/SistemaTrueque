from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# ---- CONFIGURACIÓN JWT ----
# Clave secreta para firmar los tokens (como una contraseña maestra)
SECRET_KEY = os.getenv("SECRET_KEY", "clave-por-defecto-CAMBIAR")

#  Algoritmo de encriptación (HS256 estándar JWT)
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Cuánto tiempo dura el token antes de expirar (en minutos)
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Máximo intentos fallidos antes de bloqueo
MAX_FAILED_LOGIN_ATTEMPTS = int(os.getenv("MAX_FAILED_LOGIN_ATTEMPTS", "5"))
# Minutos que dura el bloqueo tras superar intentos fallidos
LOCK_MINUTES = int(os.getenv("LOCK_MINUTES", "15"))

# ---- CONFIGURACIÓN DE CORS ----
# Qué frontends pueden conectarse a nuestra API
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
