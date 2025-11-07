from sqlalchemy import Table, Column, Integer, String, Boolean, DateTime, ForeignKey, Text, func
from config.db import meta_data

transactions = Table(
    "transactions",
    meta_data,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("trueque_id", Integer, ForeignKey("trueque.id"), nullable=True),
    Column("oferta_id", Integer, ForeignKey("oferta.id"), nullable=True),
    Column("user_a_id", Integer, ForeignKey("cliente.id"), nullable=False),
    Column("user_b_id", Integer, ForeignKey("cliente.id"), nullable=False),
    Column("delivered_by_a", Boolean, nullable=False, server_default="0"),
    Column("delivered_by_b", Boolean, nullable=False, server_default="0"),
    Column("status", String(32), nullable=False, server_default="pending"),  # pending, completed, disputed
    Column("created_at", DateTime, server_default=func.now()),
    Column("completed_at", DateTime, nullable=True),
)

transaction_events = Table(
    "transaction_events",
    meta_data,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("transaction_id", Integer, ForeignKey("transactions.id"), nullable=False),
    Column("user_id", Integer, ForeignKey("cliente.id"), nullable=True),
    Column("action", String(64), nullable=False),  # confirmed_delivery, completed, dispute_opened...
    Column("details", Text, nullable=True),
    Column("created_at", DateTime, server_default=func.now()),
)