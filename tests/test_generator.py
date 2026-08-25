import json


def test_ledger_record_counts():
    with open("data/merchant_ledger.json") as f:
        merchant = json.load(f)

    with open("data/bank_ledger.json") as f:
        bank = json.load(f)

    assert len(merchant) == 1000
    assert len(bank) == 1000