from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, Date
from config.db import meta_data

trueques = Table(
    "trueques",
    meta_data,
    Column("id", Integer, primary_key=True),
    Column("fecha", Date, nullable=False),
    Column("idOferta", Integer, ForeignKey("ofertas.id"), nullable=False),
)

