from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, String, Boolean
from config.db import engine, meta_data

clientes = Table("clientes", meta_data,
                Column("id", Integer, primary_key=True),
                Column("email", String(255), nullable=False), #El nullable false es para que no acepte valores nulos
                Column("username", String(255), nullable=False),
                Column("contrasena", String(255), nullable=False),
                Column("estado", Boolean, nullable=False),
                Column("persona_id", Integer, ForeignKey("personas.id"), nullable=False),
                Column("role", String(50), nullable=False, default="user"),
                Column("is_verified", Boolean, nullable=False, default=False),
                Column("verification_token", String(255), nullable=True),
                Column("failed_login_attempts", Integer, nullable=False, default=0),
                Column("locked_until", String(50), nullable=True)
            )

