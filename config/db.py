from sqlalchemy import create_engine, MetaData
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Permitir URL completa de conexión (prioritario si está presente)
DB_URL = os.getenv("DB_URL", "").strip()

# Obtener credenciales desde variables de entorno
DB_USER = os.getenv("DB_USER", "root")  # Si no existe, usa "root" por defecto
DB_PASSWORD = os.getenv("DB_PASSWORD", "")  # muchos root no tienen password por defecto
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")  # 127.0.0.1 reduce confusiones con sockets
DB_PORT = os.getenv("DB_PORT", "3307")
DB_NAME = os.getenv("DB_NAME", "sistema_trueques")

# Seleccionar driver: mariadbconnector (paquete 'mariadb') o pymysql (paquete 'PyMySQL')
DB_DRIVER = os.getenv("DB_DRIVER", "mariadbconnector").strip()
if DB_DRIVER not in ("mariadbconnector", "pymysql"):
	DB_DRIVER = "mariadbconnector"

# Construir la URL de conexión
if DB_URL:
	DATABASE_URL = DB_URL
else:
	DATABASE_URL = f"mariadb+{DB_DRIVER}://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Crear el motor de base de datos (pool_pre_ping para reconectar si la conexión cae)
engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
meta_data = MetaData()

# Intentar abrir conexión inmediata (compatibilidad con el código actual)
try:
	conn = engine.connect()
except Exception as e:
	# Mensaje claro para ayudar a diagnosticar (sin exponer la contraseña)
	tips = (
		"Error al conectar a MariaDB. Revisa: "
		"1) Credenciales en .env (DB_USER/DB_PASSWORD), "
		"2) Host/puerto (DB_HOST/DB_PORT), "
		"3) Que la BD exista (DB_NAME), "
		"4) Privilegios para ese usuario. "
		"Puedes intentar DB_DRIVER='pymysql' en .env si el conector de MariaDB falla.\n"
		f"Usando: mariadb+{DB_DRIVER}://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}"
	)
	raise RuntimeError(f"No se pudo conectar a la base de datos. Detalle: {e}\n{tips}") from e


