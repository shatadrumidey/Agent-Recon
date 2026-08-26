from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base
import datetime


class MatchedTransaction(Base):
    __tablename__ = "matched_transactions"

    id = Column(Integer, primary_key=True, index=True)

    merch_txn_id = Column(String, index=True)
    bank_txn_id = Column(String, index=True)

    match_type = Column(String)
    rule_name = Column(String)

    confidence = Column(Float)

    audit_notes = Column(String)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )