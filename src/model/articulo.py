from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, String, Boolean, Date
from config.db import engine, meta_data

articulos = Table("articulos", meta_data,
                Column("id", Integer, primary_key=True),
                Column("nombre", String(255), nullable=False),
                Column("descripcion", String(255), nullable=False),
                Column("estado", Boolean, nullable=False),
                Column("fecha", Date, nullable=False),
                Column("cliente_id", Integer, ForeignKey("clientes.id"), nullable=False),
                Column("categoria_id", Integer, ForeignKey("categorias.id"), nullable=False)
                )

