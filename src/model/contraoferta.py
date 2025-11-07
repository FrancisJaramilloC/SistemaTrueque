from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, String, DateTime
from datetime import datetime
from config.db import meta_data

contraofertas = Table("contraofertas", meta_data,
    Column("id", Integer, primary_key=True),
    Column("oferta_original_id", Integer, ForeignKey("ofertas.id"), nullable=False),
    Column("articulo_alternativo_id", Integer, ForeignKey("articulos.id"), nullable=False),
    Column("usuario_id", Integer, nullable=False),
    Column("mensaje", String(500), nullable=True),
    Column("fecha_creacion", DateTime, default=datetime.utcnow)
)
