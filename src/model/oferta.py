from sqlalchemy import ForeignKey, Table, Column
from sqlalchemy.sql.sqltypes import Integer, Boolean, Date
from config.db import engine, meta_data

ofertas = Table("ofertas", meta_data,
                Column("id", Integer, primary_key=True),
                Column("estado", Boolean, nullable=False),
                Column("fecha", Date, nullable=False),
                Column("id_persona", Integer, ForeignKey("personas.id"), nullable=False),
                Column("id_articulo", Integer, ForeignKey("articulos.id"), nullable=False)
)
