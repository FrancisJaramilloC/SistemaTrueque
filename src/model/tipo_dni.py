from sqlalchemy import Table, Column, Integer, String
from config.db import engine, meta_data

tipo_dni = Table("tipo_dni", meta_data,
    Column("id", Integer, primary_key=True),
    Column("nombre", String(100), nullable=False, unique=True)
)


