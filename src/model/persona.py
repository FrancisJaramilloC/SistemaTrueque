from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, String
from config.db import engine, meta_data

personas = Table("personas", meta_data,
                Column("id", Integer, primary_key=True),
                Column("nombre", String(100), nullable=False),
                Column("apellido", String(100), nullable=False),
                Column("telefono", String (15), nullable=False),
                Column("dni", String(50), nullable=False),
                Column("tipo_dni_id", Integer, ForeignKey("tipo_dni.id"), nullable=False)
            )

