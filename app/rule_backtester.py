import json
from datetime import datetime, timedelta
from pathlib import Path

from app.ai_models import ProposedRule


DATA_DIR = Path("data")


def load_json(filename: str):
    """Load a JSON file from the data directory."""
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def apply_rule(
    rule: ProposedRule,
    merchant: dict,
    bank: dict,
) -> bool:
    """
    Trusted interpreter for the bounded reconciliation DSL.

    No AI-generated code is executed.
    """

    if rule.rule_type == "amount_ratio":
        merchant_amount = merchant[rule.merchant_field]
        bank_amount = bank[rule.bank_field]

        expected = merchant_amount * rule.ratio

        return abs(expected - bank_amount) <= rule.tolerance

    if rule.rule_type == "narration_contains_id":
        merchant_id = merchant[rule.merchant_field]
        narration = bank[rule.bank_field]

        if merchant_id is None or narration is None:
            return False

        return merchant_id in narration

    if rule.rule_type == "amount_exact":
        return (
            merchant[rule.merchant_field]
            == bank[rule.bank_field]
        )

    return False


def evaluate_candidate_rule(
    rule: ProposedRule,
    merch_exceptions: list[dict],
    bank_exceptions: list[dict],
) -> dict:
    """
    Shadow-sandbox evaluation.

    Evaluates the proposed rule against every possible
    merchant-exception × bank-exception combination.

    Trusted identity and time constraints are enforced here.
    """

    ground_truth = load_json("ground_truth_mapping.json")

    truth_map = {
        item["merchant_txn_id"]: item["bank_ref_id"]
        for item in ground_truth
    }

    # Only the merchant exceptions being evaluated matter
    # for this rule's recall.
    expected_pairs = {
        (
            merchant["merch_txn_id"],
            truth_map.get(merchant["merch_txn_id"]),
        )
        for merchant in merch_exceptions
        if truth_map.get(merchant["merch_txn_id"]) is not None
    }

    predicted_pairs = set()

    for merchant in merch_exceptions:
        merchant_time = datetime.fromisoformat(
            merchant["timestamp"]
        )

        for bank in bank_exceptions:
            bank_time = datetime.fromisoformat(
                bank["settlement_time"]
            )

            # -----------------------------------------
            # Trusted constraint #1: time
            # -----------------------------------------
            time_diff = abs(merchant_time - bank_time)

            if time_diff > timedelta(hours=48):
                continue

            # -----------------------------------------
            # Trusted constraint #2:
            # identity / amount depending on rule type
            # -----------------------------------------
            if rule.rule_type == "amount_ratio":
                # A fee anomaly still has the merchant reference.
                if bank["merch_ref_id"] != merchant["merch_txn_id"]:
                    continue

            elif rule.rule_type == "narration_contains_id":
                # Missing-reference anomaly must still have
                # the same settlement amount.
                if merchant["amount_inr"] != bank["settlement_amount"]:
                    continue

            # -----------------------------------------
            # AI-proposed DSL condition
            # -----------------------------------------
            if not apply_rule(rule, merchant, bank):
                continue

            predicted_pairs.add(
                (
                    merchant["merch_txn_id"],
                    bank["bank_ref_id"],
                )
            )

    # -----------------------------------------
    # Score every prediction
    # -----------------------------------------
    true_positives = len(
        predicted_pairs & expected_pairs
    )

    false_positives = len(
        predicted_pairs - expected_pairs
    )

    false_negatives = len(
        expected_pairs - predicted_pairs
    )

    false_positive_pairs = sorted(
        [
            {
                "merchant_txn_id": merchant_id,
                "bank_ref_id": bank_ref_id,
            }
            for merchant_id, bank_ref_id in
            (predicted_pairs - expected_pairs)
        ],
        key=lambda pair: (
            pair["merchant_txn_id"],
            pair["bank_ref_id"],
        ),
    )

    precision = (
        true_positives / (true_positives + false_positives)
        if true_positives + false_positives > 0
        else 0.0
    )

    recall = (
        true_positives / (true_positives + false_negatives)
        if true_positives + false_negatives > 0
        else 0.0
    )

    status = (
        "APPROVED"
        if false_positives == 0 and true_positives > 0
        else "REJECTED"
    )

    return {
        "rule_name": rule.rule_name,
        "candidate_pairs": (
            len(merch_exceptions) * len(bank_exceptions)
        ),
        "merchant_rows": len(merch_exceptions),
        "bank_rows": len(bank_exceptions),
        "true_positives": true_positives,
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "false_positive_pairs": false_positive_pairs[:10],
        "precision": precision,
        "recall": recall,
        "status": status,
    }

if __name__ == "__main__":
    from app.sampler import get_stratified_anomaly_sample
    from app.ai_agent import propose_reconciliation_rule

    merchant_exceptions = load_json("exceptions_merch.json")
    bank_exceptions = load_json("exceptions_bank.json")

    # -----------------------------
    # Fee rule
    # -----------------------------
    fee_samples = get_stratified_anomaly_sample(
        anomaly_type="fee",
        sample_size=5,
        seed=42,
    )

    print("Generating fee rule...")
    fee_rule = propose_reconciliation_rule(fee_samples)

    print("\n===== FEE RULE =====")
    print(json.dumps(fee_rule.model_dump(), indent=2))

    fee_result = evaluate_candidate_rule(
        fee_rule,
        merchant_exceptions,
        bank_exceptions,
    )

    print("\n===== FEE SHADOW SANDBOX =====")
    print(json.dumps(fee_result, indent=2))

    # -----------------------------
    # Narration rule
    # -----------------------------
    narration_samples = get_stratified_anomaly_sample(
        anomaly_type="narration",
        sample_size=5,
        seed=42,
    )

    print("\nGenerating narration rule...")
    narration_rule = propose_reconciliation_rule(
        narration_samples
    )

    print("\n===== NARRATION RULE =====")
    print(
        json.dumps(
            narration_rule.model_dump(),
            indent=2,
        )
    )

    narration_result = evaluate_candidate_rule(
        narration_rule,
        merchant_exceptions,
        bank_exceptions,
    )

    print("\n===== NARRATION SHADOW SANDBOX =====")
    print(
        json.dumps(
            narration_result,
            indent=2,
        )
    )