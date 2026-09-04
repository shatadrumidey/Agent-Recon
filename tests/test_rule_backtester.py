from app.rule_backtester import (
    evaluate_candidate_rule,
    load_json,
)


def test_fee_rule_has_zero_false_positives():
    rule = {
        "rule_name": "gateway_fee_2_percent",
        "rule_type": "amount_ratio",
        "merchant_field": "amount_inr",
        "bank_field": "settlement_amount",
        "ratio": 0.98,
        "tolerance": 0.01,
        "explanation": "Bank settlement is 98% of merchant amount.",
    }

    from app.ai_models import ProposedRule

    proposed_rule = ProposedRule(**rule)

    merch_exceptions = load_json(
        "exceptions_merch.json"
    )
    bank_exceptions = load_json(
        "exceptions_bank.json"
    )

    result = evaluate_candidate_rule(
        proposed_rule,
        merch_exceptions,
        bank_exceptions,
    )

    assert result["candidate_pairs"] == 16900
    assert result["true_positives"] == 70
    assert result["false_positives"] == 0
    assert result["status"] == "APPROVED"


def test_narration_rule_has_zero_false_positives():
    rule = {
        "rule_name": "narration_contains_merchant_txn_id",
        "rule_type": "narration_contains_id",
        "merchant_field": "merch_txn_id",
        "bank_field": "narration",
        "explanation": (
            "Merchant transaction ID appears in bank narration."
        ),
    }

    from app.ai_models import ProposedRule

    proposed_rule = ProposedRule(**rule)

    merch_exceptions = load_json(
        "exceptions_merch.json"
    )
    bank_exceptions = load_json(
        "exceptions_bank.json"
    )

    result = evaluate_candidate_rule(
        proposed_rule,
        merch_exceptions,
        bank_exceptions,
    )

    assert result["candidate_pairs"] == 16900
    assert result["true_positives"] == 60
    assert result["false_positives"] == 0
    assert result["status"] == "APPROVED"


def test_broad_fee_rule_is_rejected():
    from app.ai_models import ProposedRule

    rule = ProposedRule(
        rule_name="bad_fee_rule",
        rule_type="amount_ratio",
        merchant_field="amount_inr",
        bank_field="settlement_amount",
        ratio=0.98,
        tolerance=1000.0,
        explanation="Overly broad rule.",
    )

    merch_exceptions = load_json(
        "exceptions_merch.json"
    )
    bank_exceptions = load_json(
        "exceptions_bank.json"
    )

    # ---------------------------------------------------------
    # Create an adversarial bank transaction.
    #
    # It deliberately claims to belong to a merchant, but its
    # bank_ref_id is NOT that merchant's true ground-truth bank.
    #
    # Because tolerance is huge, the bad rule will accept it.
    # The sandbox must therefore count it as a false positive.
    # ---------------------------------------------------------
    target_merchant = merch_exceptions[0]

    # Start from the TRUE bank record for this merchant so that
    # timestamp and other transaction properties are valid.
    fake_bank = bank_exceptions[0].copy()

    # Give it a DIFFERENT bank ID so it is not the true pair.
    fake_bank["bank_ref_id"] = bank_exceptions[1]["bank_ref_id"]

    # Make it appear to belong to the target merchant.
    fake_bank["merch_ref_id"] = (
        target_merchant["merch_txn_id"]
    )

    # Deliberately make the amount close enough that the huge
    # tolerance of 1000 accepts it.
    fake_bank["settlement_amount"] = (
        target_merchant["amount_inr"] * 0.98 + 500
    )

    bank_exceptions.append(fake_bank)

    result = evaluate_candidate_rule(
        rule,
        merch_exceptions,
        bank_exceptions,
    )

    assert result["false_positives"] > 0
    assert result["status"] == "REJECTED"