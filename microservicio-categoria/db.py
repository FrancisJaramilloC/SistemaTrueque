import os
from sqlalchemy import create_engine, MetaData

db_user = os.getenv("DB_USER", "root")
db_password = os.getenv("DB_PASSWORD", "admin")
db_host = os.getenv("DB_HOST", "host.docker.internal")
db_port = os.getenv("DB_PORT", "3307")
db_name = os.getenv("DB_NAME", "sistematrueque")

db_url = f"mariadb+mariadbconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

engine = create_engine(db_url)
meta_data = MetaData()
conn = engine.connect()
