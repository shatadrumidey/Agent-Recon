from faker import Faker
import pandas as pd
import uuid
import random
import json
from pathlib import Path
from datetime import timedelta

from app.models import MerchantTransaction, BankTransaction


fake = Faker()


def generate_base_transactions(n=1000):
    merchant_transactions = []
    bank_transactions = []

    categories = [
        "Electronics",
        "Clothing",
        "Food",
        "Travel",
        "Entertainment",
        "Healthcare",
        "Education",
    ]

    for _ in range(n):
        txn_id = f"TXN-{uuid.uuid4().hex[:8].upper()}"
        bank_id = f"BANK-{uuid.uuid4().hex[:8].upper()}"

        amount = round(random.uniform(100, 10000), 2)

        timestamp = fake.date_time_between(
            start_date="-30d",
            end_date="now"
        )

        merchant_txn = MerchantTransaction(
            merch_txn_id=txn_id,
            amount_inr=amount,
            timestamp=timestamp,
            customer_name=fake.name(),
            item_category=random.choice(categories),
        )

        bank_txn = BankTransaction(
            bank_ref_id=bank_id,
            merch_ref_id=txn_id,
            settlement_amount=amount,
            settlement_time=timestamp,
            narration=f"NEFT-RAZORPAY-{txn_id}",
        )

        merchant_transactions.append(merchant_txn)
        bank_transactions.append(bank_txn)

    return merchant_transactions, bank_transactions


def inject_anomalies(merchant_transactions, bank_transactions):
    """
    Corrupt exactly 200 of the bank transactions:

    - 70 transactions receive a 2% gateway fee.
    - 70 transactions receive T+1 settlement drift.
    - 60 transactions lose their merchant reference ID and
      hide that ID inside the narration.

    The three groups are mutually exclusive.
    """

    if len(merchant_transactions) != len(bank_transactions):
        raise ValueError(
            "Merchant and bank ledgers must contain the same number of transactions."
        )

    if len(bank_transactions) < 200:
        raise ValueError(
            "At least 200 transactions are required to inject anomalies."
        )

    indices = list(range(len(bank_transactions)))
    random.shuffle(indices)

    fee_indices = indices[:70]
    time_indices = indices[70:140]
    truncation_indices = indices[140:200]

    # Anomaly 1: 2% Gateway Fee
    for index in fee_indices:
        bank_txn = bank_transactions[index]

        bank_txn.settlement_amount = round(
            bank_txn.settlement_amount * 0.98,
            2
        )

    # Anomaly 2: T+1 Settlement Drift
    for index in time_indices:
        bank_txn = bank_transactions[index]

        random_minutes = random.randint(1, 1440)

        bank_txn.settlement_time = (
            bank_txn.settlement_time
            + timedelta(days=1, minutes=random_minutes)
        )

    # Anomaly 3: String Truncation
    for index in truncation_indices:
        bank_txn = bank_transactions[index]

        merchant_id = bank_txn.merch_ref_id

        bank_txn.merch_ref_id = None
        bank_txn.narration = (
            f"SETTLEMENT-FEE-INC-{merchant_id}-FAILED"
        )

    return merchant_transactions, bank_transactions


def save_ledgers(
    merchant_transactions,
    bank_transactions,
    output_dir="data"
):
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    merchant_data = [
        txn.model_dump(mode="json")
        for txn in merchant_transactions
    ]

    bank_data = [
        txn.model_dump(mode="json")
        for txn in bank_transactions
    ]

    ground_truth = [
        {
            "merchant_txn_id": merchant.merch_txn_id,
            "bank_ref_id": bank.bank_ref_id,
        }
        for merchant, bank in zip(
            merchant_transactions,
            bank_transactions
        )
    ]

    with open(
        output_path / "merchant_ledger.json",
        "w"
    ) as f:
        json.dump(merchant_data, f, indent=2)

    with open(
        output_path / "bank_ledger.json",
        "w"
    ) as f:
        json.dump(bank_data, f, indent=2)

    with open(
        output_path / "ground_truth_mapping.json",
        "w"
    ) as f:
        json.dump(ground_truth, f, indent=2)