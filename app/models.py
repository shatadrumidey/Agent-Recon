from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MerchantTransaction(BaseModel):
    merch_txn_id: str
    amount_inr: float
    timestamp: datetime
    customer_name: str
    item_category: str


class BankTransaction(BaseModel):
    bank_ref_id: str
    merch_ref_id: Optional[str] = None
    settlement_amount: float
    settlement_time: datetime
    narration: str