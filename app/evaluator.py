import json


def load_ground_truth(filepath: str) -> dict[str, str]:
    with open(filepath, "r") as f:
        data = json.load(f)

    return {
        item["merchant_txn_id"]: item["bank_ref_id"]
        for item in data
    }


def evaluate_predictions(
    predictions: list[dict],
    ground_truth: dict[str, str],
) -> dict:

    tp = 0
    fp = 0

    evaluated_predictions = set()

    for prediction in predictions:

        merchant_id = prediction["merch_txn_id"]
        bank_id = prediction["bank_txn_id"]

        if bank_id is None:
            continue

        pair = (merchant_id, bank_id)

        if pair in evaluated_predictions:
            continue

        evaluated_predictions.add(pair)

        expected_bank_id = ground_truth.get(merchant_id)

        if expected_bank_id == bank_id:
            tp += 1
        else:
            fp += 1

    matched_ground_truth = {
        merchant_id
        for merchant_id, bank_id in evaluated_predictions
        if ground_truth.get(merchant_id) == bank_id
    }

    fn = len(ground_truth) - len(matched_ground_truth)

    precision = (
        tp / (tp + fp)
        if (tp + fp) > 0
        else 0.0
    )

    recall = (
        tp / (tp + fn)
        if (tp + fn) > 0
        else 0.0
    )

    return {
        "true_positives": tp,
        "false_positives": fp,
        "false_negatives": fn,
        "precision": precision,
        "recall": recall,
    }