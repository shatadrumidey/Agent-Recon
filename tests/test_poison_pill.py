from app.ai_models import ProposedRule
from app.poison_pill import (
    build_poison_pill_dataset,
    evaluate_poison_pill,
)
from app.rule_backtester import load_json


def narration_rule() -> ProposedRule:
    return ProposedRule(
        rule_name="narration_contains_merchant_txn_id",
        rule_type="narration_contains_id",
        merchant_field="merch_txn_id",
        bank_field="narration",
        explanation=(
            "Merchant transaction ID appears in bank narration."
        ),
    )


def test_poison_pill_rejects_valid_narration_rule():
    rule = narration_rule()

    result = evaluate_poison_pill(rule)

    assert result["candidate_pairs"] == 17030
    assert result["true_positives"] == 60

    assert result["false_positives"] == 1

    # The 70 fee anomalies are not expected to match
    # a narration rule.
    assert result["false_negatives"] == 70

    assert result["precision"] < 1.0
    assert result["status"] == "REJECTED"

    assert result["false_positive_pairs"] == [
        {
            "merchant_txn_id": "TXN-AD7F4E21",
            "bank_ref_id": result["poison_pill"]["target_bank_ref_id"],
        }
    ]


def test_poison_pill_does_not_mutate_real_dataset():
    merchants, banks, _ = build_poison_pill_dataset()

    assert "TXN-AD7F4E21" in {
        merchant["merch_txn_id"]
        for merchant in merchants
    }

    assert "TXN-AD7F4E21" not in {
        merchant["merch_txn_id"]
        for merchant in load_json("exceptions_merch.json")
    }

    original_banks = load_json("exceptions_bank.json")

    original_narrations = {
        bank["bank_ref_id"]: bank["narration"]
        for bank in original_banks
    }

    poisoned_narrations = {
        bank["bank_ref_id"]: bank["narration"]
        for bank in banks
    }

    changed = [
        bank_id
        for bank_id, narration in poisoned_narrations.items()
        if narration != original_narrations.get(bank_id)
    ]

    assert len(changed) == 1