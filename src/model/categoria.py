from sqlalchemy import Table, Column
from sqlalchemy.sql.sqltypes import Integer, String
from config.db import engine, meta_data

categorias = Table("categorias", meta_data,
                Column("id", Integer, primary_key=True),
                Column("descripcion", String(255), nullable=False)
            )

