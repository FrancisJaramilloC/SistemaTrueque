from sqlalchemy import Table, Column
from sqlalchemy.sql.sqltypes import Integer, String, DateTime
from config.db import meta_data

articulos = Table("articulos", meta_data,
    Column("id", Integer, primary_key=True),
    Column("imagen_url", String(500), nullable=True),
    Column("thumbnail_url", String(500), nullable=True),
    Column("descripcion", String(500), nullable=False),
    Column("categoria", String(100), nullable=False),
    Column("estado", String(50), nullable=False),
    Column("fecha", DateTime, nullable=False),
    Column("id_usuario", Integer, nullable=False)
)

