from app.engine import (
    DeterministicReconEngine,
    load_data,
)


def test_engine_runs_promoted_rules():
    merchant_txns = load_data(
        "data/merchant_ledger.json",
        __import__(
            "app.models",
            fromlist=["MerchantTransaction"],
        ).MerchantTransaction,
    )

    bank_txns = load_data(
        "data/bank_ledger.json",
        __import__(
            "app.models",
            fromlist=["BankTransaction"],
        ).BankTransaction,
    )

    engine = DeterministicReconEngine(
        merchant_txns,
        bank_txns,
    )

    engine.run()

    assert len(engine.matches) >= 870