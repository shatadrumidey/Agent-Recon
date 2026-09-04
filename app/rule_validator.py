from app.ai_models import ProposedRule


ALLOWED_MERCHANT_FIELDS = {
    "amount_inr",
    "merch_txn_id",
    "timestamp",
}

ALLOWED_BANK_FIELDS = {
    "settlement_amount",
    "bank_ref_id",
    "narration",
    "merch_ref_id",
}


def validate_rule(rule: ProposedRule) -> tuple[bool, list[str]]:
    """
    Validate the semantic safety of an AI-generated rule.

    This does NOT execute the rule.
    It only determines whether the proposed rule is structurally
    and semantically acceptable to our reconciliation engine.
    """

    errors: list[str] = []

    # ---------------------------------------------------------
    # 1. Field allowlists
    # ---------------------------------------------------------

    if rule.merchant_field not in ALLOWED_MERCHANT_FIELDS:
        errors.append(
            f"Merchant field '{rule.merchant_field}' is not allowed."
        )

    if rule.bank_field not in ALLOWED_BANK_FIELDS:
        errors.append(
            f"Bank field '{rule.bank_field}' is not allowed."
        )

    # ---------------------------------------------------------
    # 2. Rule-specific validation
    # ---------------------------------------------------------

    if rule.rule_type == "amount_ratio":

        if rule.merchant_field != "amount_inr":
            errors.append(
                "amount_ratio must use merchant field 'amount_inr'."
            )

        if rule.bank_field != "settlement_amount":
            errors.append(
                "amount_ratio must use bank field 'settlement_amount'."
            )

        if rule.ratio is None:
            errors.append(
                "amount_ratio requires a ratio."
            )
        elif not 0 < rule.ratio <= 2:
            errors.append(
                "ratio must be greater than 0 and at most 2."
            )

        if rule.tolerance is None:
            errors.append(
                "amount_ratio requires a tolerance."
            )
        elif rule.tolerance < 0:
            errors.append(
                "tolerance cannot be negative."
            )

    elif rule.rule_type == "narration_contains_id":

        if rule.merchant_field != "merch_txn_id":
            errors.append(
                "narration_contains_id must use merchant field "
                "'merch_txn_id'."
            )

        if rule.bank_field != "narration":
            errors.append(
                "narration_contains_id must use bank field "
                "'narration'."
            )

        if rule.ratio is not None:
            errors.append(
                "narration_contains_id must not specify a ratio."
            )

        if rule.tolerance is not None:
            errors.append(
                "narration_contains_id must not specify a tolerance."
            )

    elif rule.rule_type == "amount_exact":

        if rule.merchant_field != "amount_inr":
            errors.append(
                "amount_exact must use merchant field 'amount_inr'."
            )

        if rule.bank_field != "settlement_amount":
            errors.append(
                "amount_exact must use bank field "
                "'settlement_amount'."
            )

        if rule.ratio is not None:
            errors.append(
                "amount_exact must not specify a ratio."
            )

        if rule.tolerance is not None:
            errors.append(
                "amount_exact must not specify a tolerance."
            )

    else:
        errors.append(
            f"Unsupported rule type: {rule.rule_type}"
        )

    return len(errors) == 0, errors