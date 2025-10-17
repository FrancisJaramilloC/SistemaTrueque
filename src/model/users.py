from sqlalchemy import Table, Column
from sqlalchemy.sql.sqltypes import Integer, String
from config.db import engine, meta_data

users = Table("users", meta_data,
                Column("id", Integer, primary_key=True),
                Column("name", String(255), nullable=False), #El nullable false es para que no acepte valores nulos
                Column("username", String(255), nullable=False),
                Column("user_password", String(255), nullable=False),
                Column("user_email", String(255), nullable=False)
            )

meta_data.create_all(engine)