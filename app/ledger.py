from sqlalchemy.orm import Session

from app.db_models import ReconJob, MatchedTransaction


def persist_pipeline_result(db: Session, pipeline_result: dict) -> ReconJob:
    """
    Persist one full reconciliation run as a new, permanent
    ReconJob + its MatchedTransaction rows.

    This never mutates or deletes previous jobs -- each call adds
    a new row to the append-only audit ledger. The most recent job
    is treated as "current state" by the API, but every prior job
    remains in the database forever as compliance history.
    """

    job = ReconJob(
        status="COMPLETED",
        total_processed=pipeline_result["total_processed"],
        matches_found=pipeline_result["matches_found"],
        exceptions_generated=pipeline_result["exceptions_generated"],
    )

    db.add(job)
    db.flush()  # assigns job.id so we can attach children to it

    for m in pipeline_result["matches"]:
        db.add(
            MatchedTransaction(
                job_id=job.id,
                merch_txn_id=m["merch_txn_id"],
                bank_txn_id=m["bank_txn_id"],
                match_type=m["match_type"],
                rule_name=m["rule_name"],
                confidence=m["confidence"],
                audit_notes=m["audit_notes"],
                merchant_amount=m["merchant_amount"],
                bank_amount=m["bank_amount"],
                merchant_timestamp=m["merchant_timestamp"],
                bank_settlement_time=m["bank_settlement_time"],
                counterparty=m["counterparty"],
                executed_at=m["executed_at"],
            )
        )

    db.commit()
    db.refresh(job)

    return job


def get_latest_job(db: Session) -> ReconJob | None:
    """The most recent reconciliation snapshot, or None if the DB is empty."""
    return (
        db.query(ReconJob)
        .order_by(ReconJob.created_at.desc())
        .first()
    )


def matches_to_dict(matches: list[MatchedTransaction]) -> list[dict]:
    return [
        {
            "merch_txn_id": m.merch_txn_id,
            "bank_txn_id": m.bank_txn_id,
            "match_type": m.match_type,
            "rule_name": m.rule_name,
            "confidence": m.confidence,
            "audit_notes": m.audit_notes,
            "merchant_amount": m.merchant_amount,
            "bank_amount": m.bank_amount,
            "merchant_timestamp": m.merchant_timestamp,
            "bank_settlement_time": m.bank_settlement_time,
            "counterparty": m.counterparty,
            "executed_at": m.executed_at,
        }
        for m in matches
    ]