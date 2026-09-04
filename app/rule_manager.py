import json
from pathlib import Path


RULES_FILE = Path("data/active_rules.json")


def load_active_rules() -> list[dict]:
    """
    Load rules that have successfully passed
    validation and shadow-sandbox promotion.
    """

    if not RULES_FILE.exists():
        return []

    with open(
        RULES_FILE,
        "r",
        encoding="utf-8",
    ) as f:
        return json.load(f)


def promote_rule(rule_dict: dict) -> dict:
    """
    Persist a sandbox-approved rule as an active rule.
    """

    rules = load_active_rules()

    # Prevent duplicate promotions.
    for rule in rules:
        if rule["rule_name"] == rule_dict["rule_name"]:
            return {
                "status": "already_exists",
                "rule_name": rule_dict["rule_name"],
            }

    rules.append(rule_dict)

    RULES_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with open(
        RULES_FILE,
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            rules,
            f,
            indent=2,
        )

    return {
        "status": "promoted",
        "rule_name": rule_dict["rule_name"],
    }