from sqlalchemy import Table, Column, ForeignKey, Integer, String, DateTime, Text
from datetime import datetime
from config.db import meta_data

trueques_detalle = Table(
    "trueques_detalle",
    meta_data,
    Column("id", Integer, primary_key=True),
    Column("trueque_id", Integer, ForeignKey("trueques.id"), nullable=False),
    Column("oferta_id", Integer, ForeignKey("ofertas.id"), nullable=False),
    Column("articulo1_id", Integer, nullable=False),
    Column("articulo2_id", Integer, nullable=False),
    Column("usuario1_id", Integer, nullable=False),
    Column("usuario2_id", Integer, nullable=False),
    Column("fecha_trueque", DateTime, default=datetime.utcnow),
    Column("notas", Text, nullable=True),
    Column("estado_final", String(50), default="completado"),
)
