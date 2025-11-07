from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TransactionOut(BaseModel):
    id: int
    trueque_id: Optional[int]
    oferta_id: Optional[int]
    user_a_id: int
    user_b_id: int
    delivered_by_a: bool
    delivered_by_b: bool
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

class TransactionEventOut(BaseModel):
    id: int
    transaction_id: int
    user_id: Optional[int]
    action: str
    details: Optional[str]
    created_at: datetime

class ConfirmResponse(BaseModel):
    message: str