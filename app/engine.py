import json

from app.models import MerchantTransaction, BankTransaction


def load_data(filepath: str, model):
    with open(filepath, "r") as f:
        data = json.load(f)

    return [model(**item) for item in data]


merch_ledgers = load_data(
    "data/merchant_ledger.json",
    MerchantTransaction
)

bank_ledgers = load_data(
    "data/bank_ledger.json",
    BankTransaction
)


class DeterministicReconEngine:

    def __init__(self, merch_txns, bank_txns):
        self.merch_txns = merch_txns
        self.bank_txns = bank_txns

        self.matches = []
        self.unmatched_merch = []
        self.unmatched_bank = []

    def run_exact_match(self):
        """Rule 1: Exact Match on Merchant ID and Amount."""

        bank_map = {}

        for b in self.bank_txns:
            if b.merch_ref_id:
                bank_map[b.merch_ref_id] = b
            else:
                self.unmatched_bank.append(b)

        for m in self.merch_txns:
            b = bank_map.get(m.merch_txn_id)

            if b and b.settlement_amount == m.amount_inr:
                self.matches.append({
                    "merch_txn_id": m.merch_txn_id,
                    "bank_txn_id": b.bank_ref_id,
                    "match_type": "DETERMINISTIC",
                    "rule_name": "exact_match",
                    "confidence": 1.0,
                    "audit_notes": "Perfect match on ID and Amount."
                })

                del bank_map[m.merch_txn_id]

            else:
                self.unmatched_merch.append(m)

        self.unmatched_bank.extend(list(bank_map.values()))

from app.database import SessionLocal, engine as db_engine
from app.db_models import Base, MatchedTransaction


Base.metadata.create_all(bind=db_engine)


def execute_recon_pipeline():
    # 1. Load the ledgers
    merch_txns = load_data(
        "data/merchant_ledger.json",
        MerchantTransaction
    )

    bank_txns = load_data(
        "data/bank_ledger.json",
        BankTransaction
    )

    # 2. Run deterministic reconciliation
    recon_engine = DeterministicReconEngine(
        merch_txns,
        bank_txns
    )

    recon_engine.run_exact_match()

    # 3. Save deterministic matches to the audit database
    db = SessionLocal()

    try:
        for match in recon_engine.matches:
            db_record = MatchedTransaction(**match)
            db.add(db_record)

        db.commit()

    finally:
        db.close()

    # 4. Save exceptions for the future AI layer
    with open("data/exceptions_merch.json", "w") as f:
        json.dump(
            [
                txn.model_dump(mode="json")
                for txn in recon_engine.unmatched_merch
            ],
            f,
            indent=2
        )

    with open("data/exceptions_bank.json", "w") as f:
        json.dump(
            [
                txn.model_dump(mode="json")
                for txn in recon_engine.unmatched_bank
            ],
            f,
            indent=2
        )

    return {
        "total_processed": len(merch_txns),
        "deterministic_matches": len(recon_engine.matches),
        "exceptions_generated": len(recon_engine.unmatched_merch)
    }