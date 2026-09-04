import json
from datetime import timedelta, datetime

from app.models import MerchantTransaction, BankTransaction
from app.rule_manager import load_active_rules


def load_data(filepath: str, model):
    with open(filepath, "r") as f:
        data = json.load(f)

    return [model(**item) for item in data]


class DeterministicReconEngine:

    def __init__(self, merch_txns, bank_txns):
        self.merch_txns = merch_txns

        self.bank_map = {
            b.merch_ref_id: b
            for b in bank_txns
            if b.merch_ref_id
        }

        self.unmatched_bank = [
            b for b in bank_txns
            if not b.merch_ref_id
        ]

        self.matches = []
        self.unmatched_merch = []

    def _safe_time_diff(self, t1, t2):
        return abs(t1 - t2)

    def run_pass_1_exact(self):
        """ID + amount + settlement time within 2 hours."""

        remaining_merch = []

        for m in self.merch_txns:

            b = self.bank_map.get(m.merch_txn_id)

            if b and b.settlement_amount == m.amount_inr:

                time_diff = self._safe_time_diff(
                    b.settlement_time,
                    m.timestamp
                )

                if time_diff <= timedelta(hours=2):

                    self.matches.append(
                        self._create_match_record(
                            m,
                            b,
                            "exact_match",
                            "Exact ID + amount + time within 2 hours."
                        )
                    )

                    del self.bank_map[m.merch_txn_id]

                    continue

            remaining_merch.append(m)

        self.merch_txns = remaining_merch

    def run_pass_2_t_plus_1(self):
        """ID + amount + settlement time within 48 hours."""

        remaining_merch = []

        for m in self.merch_txns:

            b = self.bank_map.get(m.merch_txn_id)

            if b and b.settlement_amount == m.amount_inr:

                time_diff = self._safe_time_diff(
                    b.settlement_time,
                    m.timestamp
                )

                if time_diff <= timedelta(hours=48):

                    self.matches.append(
                        self._create_match_record(
                            m,
                            b,
                            "t_plus_1_match",
                            "T+1 settlement: ID + amount + time within 48 hours."
                        )
                    )

                    del self.bank_map[m.merch_txn_id]

                    continue

            remaining_merch.append(m)

        self.unmatched_merch = remaining_merch

        self.unmatched_bank.extend(
            list(self.bank_map.values())
        )

    def run_pass_3_dynamic_rules(self):
        """
        Pass 3:
        Apply sandbox-approved AI-generated rules to the
        remaining unmatched transactions.
        """

        active_rules = load_active_rules()

        if not active_rules:
            return

        for rule in active_rules:

            remaining_merch = []

            for m in self.unmatched_merch:

                match_found = False

                for b in list(self.unmatched_bank):

                    # -----------------------------------------
                    # Trusted time constraint
                    # -----------------------------------------
                    time_diff = self._safe_time_diff(
                        b.settlement_time,
                        m.timestamp,
                    )

                    if time_diff > timedelta(hours=48):
                        continue

                    is_match = False

                    # -----------------------------------------
                    # Fee rule
                    # -----------------------------------------
                    if rule["rule_type"] == "amount_ratio":

                        # Trusted identity constraint
                        if b.merch_ref_id != m.merch_txn_id:
                            continue

                        expected_amount = (
                            m.amount_inr * rule["ratio"]
                        )

                        tolerance = rule.get(
                            "tolerance",
                            0.05,
                        )

                        if (
                            abs(
                                b.settlement_amount
                                - expected_amount
                            )
                            <= tolerance
                        ):
                            is_match = True

                    # -----------------------------------------
                    # Narration rule
                    # -----------------------------------------
                    elif rule["rule_type"] == "narration_contains_id":

                        # Trusted amount constraint
                        if m.amount_inr != b.settlement_amount:
                            continue

                        if (
                            b.narration
                            and m.merch_txn_id in b.narration
                        ):
                            is_match = True

                    # -----------------------------------------
                    # Execute the match
                    # -----------------------------------------
                    if is_match:

                        self.matches.append(
                            self._create_match_record(
                                m,
                                b,
                                rule["rule_name"],
                                (
                                    "AI Rule Matched: "
                                    f"{rule['explanation']}"
                                ),
                                match_type="AI_GENERATED",
                            )
                        )

                        self.unmatched_bank.remove(b)

                        match_found = True
                        break

                if not match_found:
                    remaining_merch.append(m)

            self.unmatched_merch = remaining_merch

    def _create_match_record(
        self,
        m,
        b,
        rule_name,
        notes,
        match_type="DETERMINISTIC",
    ):
        return {
            "merch_txn_id": m.merch_txn_id,
            "bank_txn_id": b.bank_ref_id,
            "match_type": match_type,
            "rule_name": rule_name,
            "confidence": 1.0,
            "audit_notes": notes,
            "merchant_amount": m.amount_inr,
            "bank_amount": b.settlement_amount,
            "merchant_timestamp": m.timestamp,
            "bank_settlement_time": b.settlement_time,
            "counterparty": m.customer_name,
            "executed_at": datetime.utcnow(),
        }
    
    def run(self):
        self.run_pass_1_exact()
        self.run_pass_2_t_plus_1()
        self.run_pass_3_dynamic_rules()

def execute_recon_pipeline():
    """
    Run the complete reconciliation pipeline.
    """

    merchant_txns = load_data(
        "data/merchant_ledger.json",
        MerchantTransaction,
    )

    bank_txns = load_data(
        "data/bank_ledger.json",
        BankTransaction,
    )

    engine = DeterministicReconEngine(
        merchant_txns,
        bank_txns,
    )

    engine.run()

    return {
        "total_processed": len(merchant_txns),
        "matches_found": len(engine.matches),
        "exceptions_generated": len(
            engine.unmatched_merch
        ),
        "matches": engine.matches,
    }