from sqlalchemy import Table, Column, Integer, String, Boolean, DateTime, ForeignKey, func, Text
from config.db import meta_data

transactions = Table(
    "transactions",
    meta_data,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("trueque_id", Integer, ForeignKey("trueque.id"), nullable=True),
    Column("oferta_id", Integer, ForeignKey("oferta.id"), nullable=True),
    Column("user_a_id", Integer, ForeignKey("cliente.id"), nullable=False),
    Column("user_b_id", Integer, ForeignKey("cliente.id"), nullable=False),
    Column("delivered_by_a", Boolean, default=False, nullable=False),
    Column("delivered_by_b", Boolean, default=False, nullable=False),
    Column("status", String(32), default="pending", nullable=False),  # pending, completed, disputed
    Column("created_at", DateTime, server_default=func.now()),
    Column("completed_at", DateTime, nullable=True),
    Column("last_modified", DateTime, onupdate=func.now(), server_default=func.now())
)

transaction_events = Table(
    "transaction_events",
    meta_data,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("transaction_id", Integer, ForeignKey("transactions.id"), nullable=False),
    Column("user_id", Integer, ForeignKey("cliente.id"), nullable=True),
    Column("action", String(64), nullable=False),  # e.g. "confirmed_delivery", "reopened", "dispute_opened"
    Column("details", Text, nullable=True),
    Column("created_at", DateTime, server_default=func.now())
)