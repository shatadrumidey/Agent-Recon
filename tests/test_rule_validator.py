from app.ai_models import ProposedRule
from app.rule_validator import validate_rule


def test_gemini_id_narration_rule_is_valid():
    rule = ProposedRule(
        rule_name="embedded_merchant_id_in_bank_narration",
        rule_type="narration_contains_id",
        merchant_field="merch_txn_id",
        bank_field="narration",
        explanation=(
            "Merchant transaction ID is embedded "
            "in bank narration."
        ),
    )

    is_valid, errors = validate_rule(rule)

    assert is_valid
    assert errors == []


def test_gemini_amount_ratio_rule_is_valid():
    rule = ProposedRule(
        rule_name="razorpay_settlement_fee_ratio",
        rule_type="amount_ratio",
        merchant_field="amount_inr",
        bank_field="settlement_amount",
        ratio=0.98,
        tolerance=0.01,
        explanation=(
            "Settlement amount reflects a 2% fee deduction."
        ),
    )

    is_valid, errors = validate_rule(rule)

    assert is_valid
    assert errors == []


def test_amount_ratio_rejects_ratio_above_two():
    rule = ProposedRule(
        rule_name="bad_ratio",
        rule_type="amount_ratio",
        merchant_field="amount_inr",
        bank_field="settlement_amount",
        ratio=3.0,
        tolerance=0.01,
        explanation="Invalid ratio.",
    )

    is_valid, errors = validate_rule(rule)

    assert not is_valid
    assert any(
        "must be greater than 0 and at most 2"
        in error
        for error in errors
    )


def test_amount_ratio_rejects_negative_ratio():
    rule = ProposedRule(
        rule_name="bad_ratio",
        rule_type="amount_ratio",
        merchant_field="amount_inr",
        bank_field="settlement_amount",
        ratio=-1.0,
        tolerance=0.01,
        explanation="Invalid ratio.",
    )

    is_valid, errors = validate_rule(rule)

    assert not is_valid
    assert any(
        "must be greater than 0"
        in error
        for error in errors
    )


def test_amount_ratio_rejects_negative_tolerance():
    rule = ProposedRule(
        rule_name="bad_tolerance",
        rule_type="amount_ratio",
        merchant_field="amount_inr",
        bank_field="settlement_amount",
        ratio=0.98,
        tolerance=-1.0,
        explanation="Invalid tolerance.",
    )

    is_valid, errors = validate_rule(rule)

    assert not is_valid
    assert any(
        "cannot be negative"
        in error
        for error in errors
    )


def test_amount_ratio_rejects_wrong_fields():
    rule = ProposedRule(
        rule_name="wrong_fields",
        rule_type="amount_ratio",
        merchant_field="merch_txn_id",
        bank_field="settlement_amount",
        ratio=0.98,
        tolerance=0.01,
        explanation="Invalid field combination.",
    )

    is_valid, errors = validate_rule(rule)

    assert not is_valid
    assert any(
        "merchant field 'amount_inr'"
        in error
        for error in errors
    )


def test_id_narration_rejects_wrong_fields():
    rule = ProposedRule(
        rule_name="wrong_id_rule",
        rule_type="narration_contains_id",
        merchant_field="amount_inr",
        bank_field="narration",
        explanation="Invalid field combination.",
    )

    is_valid, errors = validate_rule(rule)

    assert not is_valid
    assert any(
        "must use merchant field 'merch_txn_id'"
        in error
        for error in errors
    )


def test_composite_rules_are_impossible():
    # ProposedRule itself rejects unsupported rule types.
    try:
        ProposedRule(
            rule_name="arbitrary_composite",
            rule_type="composite",
            merchant_field="amount_inr",
            bank_field="settlement_amount",
            explanation="Invalid rule.",
        )
    except ValueError:
        assert True
    else:
        assert False