from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, String, Boolean
from config.db import engine, meta_data

clientes = Table("clientes", meta_data,
                Column("id", Integer, primary_key=True),
                Column("email", String(255), nullable=False), #El nullable false es para que no acepte valores nulos
                Column("username", String(255), nullable=False),
                Column("contrasena", String(255), nullable=False),
                Column("estado", Boolean, nullable=False),
                Column("persona_id", Integer, ForeignKey("personas.id"), nullable=False)
            )

