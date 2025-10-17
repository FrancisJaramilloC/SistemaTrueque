from sqlalchemy import Table, Column
from sqlalchemy.sql.sqltypes import Integer, String, Date
from config.db import engine, meta_data

trueques = Table("trueques", meta_data,
                Column("id", Integer, primary_key=True),
                Column("fecha", Date, nullable=False)#El nullable false es para que no acepte valores nulos
                #Agregar la conexion con las otras tablas
            )

meta_data.create_all(engine)