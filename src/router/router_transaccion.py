from fastapi import APIRouter, Depends, HTTPException
from config.db import engine
from src.model.transaction import transactions, transaction_events
from sqlalchemy import select, update
from datetime import datetime
from src.auth.dependencies import get_current_user

transaccion_router = APIRouter()

@transaccion_router.post("/api/transactions/{tx_id}/confirm")
def confirm_delivery(tx_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")  # El ID del usuario está en el campo "sub" del token
    
    with engine.begin() as conn:
        tx = conn.execute(select(transactions).where(transactions.c.id == tx_id)).fetchone()
        if not tx:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")

        if user_id not in (tx.user_a_id, tx.user_b_id):
            raise HTTPException(status_code=403, detail="No eres participante de esta transacción")

        if user_id == tx.user_a_id:
            conn.execute(update(transactions).where(transactions.c.id == tx_id).values(delivered_by_a=True))
            actor = "delivered_by_a"
        else:
            conn.execute(update(transactions).where(transactions.c.id == tx_id).values(delivered_by_b=True))
            actor = "delivered_by_b"

        conn.execute(transaction_events.insert().values(
            transaction_id=tx_id,
            user_id=user_id,
            action="confirmed_delivery",
            details=f"{actor} set True"
        ))

        tx2 = conn.execute(select(transactions).where(transactions.c.id == tx_id)).fetchone()
        if tx2.delivered_by_a and tx2.delivered_by_b and tx2.status != "completed":
            conn.execute(update(transactions).where(transactions.c.id == tx_id).values(
                status="completed",
                completed_at=datetime.utcnow()
            ))
            conn.execute(transaction_events.insert().values(
                transaction_id=tx_id,
                user_id=None,
                action="completed",
                details="Both parties confirmed delivery"
            ))

    return {"message": "Confirmación registrada"}

@transaccion_router.get("/api/transactions/{tx_id}/history")
def get_history(tx_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    with engine.connect() as conn:
        tx = conn.execute(select(transactions).where(transactions.c.id == tx_id)).fetchone()
        if not tx:
            raise HTTPException(status_code=404, detail="Transacción no encontrada")
        if user_id not in (tx.user_a_id, tx.user_b_id):
            raise HTTPException(status_code=403, detail="No autorizado")

        events = conn.execute(select(transaction_events)
                            .where(transaction_events.c.transaction_id == tx_id)
                            .order_by(transaction_events.c.created_at)).fetchall()
        return [dict(r._mapping) for r in events]

@transaccion_router.get("/api/transactions")
def list_transactions(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("sub")
    with engine.connect() as conn:
        result = conn.execute(select(transactions).where(
            (transactions.c.user_a_id == user_id) | (transactions.c.user_b_id == user_id)
        )).fetchall()
        return [dict(r._mapping) for r in result]