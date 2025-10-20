import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, MetaData

# Se leen las credenciales de la BD desde variables de entorno para evitar exponerlas en el código.
# La configuración se carga desde un archivo .env usando python-dotenv.

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
db_url = f"mariadb+mariadbconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(db_url)


