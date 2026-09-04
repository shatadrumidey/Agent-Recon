import json
import random
from pathlib import Path


DATA_DIR = Path("data")


def load_json(filename: str):
    """Load a JSON file from the data directory."""
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def get_stratified_anomaly_sample(
    anomaly_type: str = "fee",
    sample_size: int = 5,
    seed: int = 42,
) -> list[dict]:
    """
    Build a reproducible sample of valid exception pairs.

    Ground truth is used internally to identify the correct
    merchant-bank pair. Ground-truth information is NOT returned
    to the LLM.
    """

    if anomaly_type not in {"fee", "narration"}:
        raise ValueError(
            "anomaly_type must be either 'fee' or 'narration'"
        )

    merchant_exceptions = load_json("exceptions_merch.json")
    bank_exceptions = load_json("exceptions_bank.json")
    ground_truth = load_json("ground_truth_mapping.json")

    # Fast lookup: bank_ref_id -> bank transaction
    bank_map = {
        bank["bank_ref_id"]: bank
        for bank in bank_exceptions
    }

    # Fast lookup: merchant_txn_id -> bank_ref_id
    truth_map = {
        item["merchant_txn_id"]: item["bank_ref_id"]
        for item in ground_truth
    }

    valid_pairs = []

    # Deterministic ordering before sampling.
    merchant_exceptions.sort(
        key=lambda x: x["merch_txn_id"]
    )

    for merchant in merchant_exceptions:
        merchant_id = merchant["merch_txn_id"]

        expected_bank_id = truth_map.get(merchant_id)

        if expected_bank_id is None:
            continue

        bank = bank_map.get(expected_bank_id)

        if bank is None:
            continue

        if anomaly_type == "fee":
            # Fee anomaly:
            # same merchant reference exists, but amount differs.
            if (
                bank["merch_ref_id"] is not None
                and merchant["amount_inr"]
                != bank["settlement_amount"]
            ):
                valid_pairs.append({
                    "merchant_txn": merchant,
                    "bank_txn": bank,
                })

        elif anomaly_type == "narration":
            # Missing-reference anomaly:
            # reference is absent from the dedicated field.
            if bank["merch_ref_id"] is None:
                valid_pairs.append({
                    "merchant_txn": merchant,
                    "bank_txn": bank,
                })

    if not valid_pairs:
        return []

    rng = random.Random(seed)

    return rng.sample(
        valid_pairs,
        min(sample_size, len(valid_pairs))
    )

if __name__ == "__main__":
    fee_samples = get_stratified_anomaly_sample(
        anomaly_type="fee",
        sample_size=5,
        seed=42,
    )

    narration_samples = get_stratified_anomaly_sample(
        anomaly_type="narration",
        sample_size=5,
        seed=42,
    )

    print("Fee samples:", len(fee_samples))
    print("Narration samples:", len(narration_samples))

    print("\n===== FEE SAMPLE =====")
    for sample in fee_samples:
        print(json.dumps(sample, indent=2))

    print("\n===== NARRATION SAMPLE =====")
    for sample in narration_samples:
        print(json.dumps(sample, indent=2))