import os
from sqlalchemy import create_engine, MetaData

# Leer variables de entorno (con valores por defecto para desarrollo local)
db_user = os.getenv("DB_USER", "root")
db_password = os.getenv("DB_PASSWORD", "admin")
db_host = os.getenv("DB_HOST", "localhost")
db_port = os.getenv("DB_PORT", "3306")
db_name = os.getenv("DB_NAME", "sistematrueque")

# Construir URL de conexión
db_url = f"mariadb+mariadbconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

engine = create_engine(db_url)
meta_data = MetaData()
conn = engine.connect()


