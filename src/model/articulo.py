from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, String, Boolean, Date
from config.db import engine, meta_data

articulos = Table("articulos", meta_data,
                Column("id", Integer, primary_key=True),
                Column("descripcion", String(255), nullable=False),
                Column("estado", Boolean, nullable=False),
                Column("fecha", Date, nullable=False),
                Column("persona_id", Integer, ForeignKey("personas.id"), nullable=False),
                Column("categoria_id", Integer, ForeignKey("categorias.id"), nullable=False)
                )

