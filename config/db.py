from sqlalchemy import create_engine, MetaData

engine = create_engine("mariadb+mariadbconnector://root:1234@localhost:3307/sistema_trueques")
meta_data = MetaData()
conn = engine.connect()


