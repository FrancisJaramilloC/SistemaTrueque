from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.sql.sqltypes import Integer, Date
from config.db import engine, meta_data

trueques = Table("trueques", meta_data,
                Column("id", Integer, primary_key=True),
                Column("fecha", Date, nullable=False),
                Column("articulo_id", Integer, ForeignKey("articulos.id"), nullable=False)
            )
 
