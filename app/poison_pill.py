"""Deterministic adversarial fixtures for Shadow Sandbox red-team testing."""

from copy import deepcopy

from app.rule_backtester import evaluate_candidate_rule, load_json


POISON_MERCHANT_ID = "TXN-AD7F4E21"


def build_poison_pill_dataset() -> tuple[list[dict], list[dict], dict]:
    """
    Create an in-memory adversarial variant of the narration-exception dataset.

    The real dataset is never modified on disk. We take one legitimate
    missing-reference bank row, keep its amount/time and true bank identity,
    then add a second merchant with the exact same amount/time and a different
    transaction ID. The bank narration is changed to contain BOTH IDs.

    A valid narration_contains_id rule will therefore match:
      1. the real merchant -> true bank row (TP)
      2. the poison merchant -> the same bank row (FP)

    That is the failure mode the Shadow Sandbox is supposed to catch.
    """

    merchant_exceptions = deepcopy(load_json("exceptions_merch.json"))
    bank_exceptions = deepcopy(load_json("exceptions_bank.json"))

    existing_ids = {
        merchant["merch_txn_id"] for merchant in merchant_exceptions
    }

    if POISON_MERCHANT_ID in existing_ids:
        raise RuntimeError(
            f"Poison merchant ID already exists: {POISON_MERCHANT_ID}"
        )

    # Pick the first genuine missing-reference case. Its narration already
    # contains the real merchant ID, so adding a second ID creates the collision.
    target_merchant = merchant_exceptions[0]

    target_bank = next(
        bank
        for bank in bank_exceptions
        if bank["bank_ref_id"]
        and bank["merch_ref_id"] is None
        and bank["settlement_amount"] == target_merchant["amount_inr"]
        and target_merchant["merch_txn_id"] in bank["narration"]
    )

    poison_merchant = {
        "merch_txn_id": POISON_MERCHANT_ID,
        "amount_inr": target_bank["settlement_amount"],
        "timestamp": target_bank["settlement_time"],
        "customer_name": "Adversarial Collision Fixture",
        "item_category": "Security Test",
    }

    merchant_exceptions.append(poison_merchant)

    original_narration = target_bank["narration"]

    target_bank["narration"] = (
        f"{original_narration}-AUX-{POISON_MERCHANT_ID}"
    )

    metadata = {
        "poison_merchant_id": POISON_MERCHANT_ID,
        "target_merchant_id": target_merchant["merch_txn_id"],
        "target_bank_ref_id": target_bank["bank_ref_id"],
        "poison_reason": (
            "The poison merchant shares the target settlement amount and time, "
            "while its transaction ID is inserted into the true bank narration."
        ),
    }

    return merchant_exceptions, bank_exceptions, metadata


def evaluate_poison_pill(rule) -> dict:
    """Evaluate a candidate rule against the adversarial in-memory dataset."""

    merchants, banks, metadata = build_poison_pill_dataset()

    evaluation = evaluate_candidate_rule(
        rule,
        merchants,
        banks,
    )

    evaluation["poison_pill"] = metadata

    evaluation["message"] = (
        f"DANGER: {evaluation['false_positives']} False Positive Detected. "
        "REJECTED"
    )

    return evaluation