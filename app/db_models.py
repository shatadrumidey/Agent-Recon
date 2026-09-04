from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship

from app.database import Base

import datetime
import uuid


class ReconJob(Base):
    __tablename__ = "recon_jobs"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    status = Column(String, default="COMPLETED")

    total_processed = Column(Integer)
    matches_found = Column(Integer)
    exceptions_generated = Column(Integer)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    matches = relationship(
        "MatchedTransaction",
        back_populates="job"
    )


class MatchedTransaction(Base):
    __tablename__ = "matched_transactions"

    id = Column(Integer, primary_key=True, index=True)

    job_id = Column(
        String,
        ForeignKey("recon_jobs.id")
    )

    merch_txn_id = Column(
        String,
        index=True
    )

    bank_txn_id = Column(
        String,
        index=True
    )

    match_type = Column(String)
    rule_name = Column(String)
    confidence = Column(Float)
    audit_notes = Column(String)

    merchant_amount = Column(Float)
    bank_amount = Column(Float)
    merchant_timestamp = Column(DateTime)
    bank_settlement_time = Column(DateTime)
    counterparty = Column(String)
    executed_at = Column(DateTime)

    created_at = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )

    job = relationship(
        "ReconJob",
        back_populates="matches"
    )