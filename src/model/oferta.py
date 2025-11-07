from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, String, Date, DateTime
from datetime import datetime
from config.db import meta_data

ofertas = Table("ofertas", meta_data,
    Column("id", Integer, primary_key=True),
    Column("articulo_ofrecido_id", Integer, nullable=True),
    Column("articulo_solicitado_id", Integer, nullable=True),
    Column("usuario_ofertante_id", Integer, nullable=True),
    Column("usuario_receptor_id", Integer, nullable=True),
    Column("mensaje", String(500), nullable=True),
    Column("estado", String(50), nullable=False),
    Column("id_persona", Integer, nullable=False),          # requerido por tu BD
    Column("fecha", Date, nullable=False),                  # requerido por tu BD
    Column("fecha_creacion", DateTime, default=datetime.now)  # si existe en tu BD
)
