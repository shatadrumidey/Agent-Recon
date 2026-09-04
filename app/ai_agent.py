import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from app.ai_models import ProposedRule


load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set.")

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(timeout=120000),
)

SYSTEM_INSTRUCTION = """
You are the analytical component of a financial reconciliation system.

You are given merchant and bank transaction pairs that are known to
refer to the same underlying transaction, but were not matched by a
strict deterministic matching rule.

Your task is to infer ONE simple deterministic reconciliation rule
that explains the observed discrepancy.

You are NOT allowed to:
- generate Python
- generate SQL
- modify transaction data
- invent fields
- use hidden ground truth
- assume information not present in the examples

You may only use these rule types:

1. amount_ratio
   Compare merchant.amount_inr with bank.settlement_amount using
   a multiplicative ratio.

2. narration_contains_id
   Check whether merchant.merch_txn_id appears in bank.narration.

3. amount_exact
   Compare merchant.amount_inr with bank.settlement_amount exactly.

Allowed merchant fields:
- amount_inr
- merch_txn_id
- timestamp

Allowed bank fields:
- settlement_amount
- bank_ref_id
- narration
- merch_ref_id

Return exactly one ProposedRule.

The explanation must describe observable evidence from the supplied
examples. Do not claim certainty merely because the examples appear
consistent.
"""


def propose_reconciliation_rule(sample_pairs: list[dict]) -> ProposedRule:
    print("[AI] Starting Gemini request...")
    print(f"[AI] Sample pairs: {len(sample_pairs)}")

    prompt = f"""
{SYSTEM_INSTRUCTION}

Observed transaction pairs:

{json.dumps(sample_pairs, indent=2, default=str)}

Return exactly one JSON object matching the ProposedRule schema.

Return JSON only.
Do not use markdown.
Do not wrap the response in ```json fences.
"""

    print("[AI] Sending Gemini Interactions API request...")

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        system_instruction=SYSTEM_INSTRUCTION,
        input=prompt,
        generation_config={
            "thinking_level": "minimal",
        },
        response_format={
            "type": "text",
            "mime_type": "application/json",
            "schema": ProposedRule.model_json_schema(),
        },
    )

    print("[AI] Gemini response received.")

    raw_output = interaction.output_text

    if not raw_output:
        raise RuntimeError("Gemini returned an empty response.")

    print("[AI] Raw response:")
    print(raw_output)

    try:
        rule = ProposedRule.model_validate_json(raw_output)
    except Exception as e:
        raise RuntimeError(
            f"Gemini returned invalid ProposedRule JSON: {e}\n"
            f"Raw response: {raw_output}"
        ) from e

    print(f"[AI] Parsed rule: {rule.rule_name}")

    return rule


if __name__ == "__main__":
    from app.sampler import get_stratified_anomaly_sample

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

    print("Generating fee rule...")

    fee_rule = propose_reconciliation_rule(fee_samples)

    print("\n===== FEE RULE =====")
    print(json.dumps(fee_rule.model_dump(), indent=2))

    print("\nGenerating narration rule...")

    narration_rule = propose_reconciliation_rule(narration_samples)

    print("\n===== NARRATION RULE =====")
    print(json.dumps(narration_rule.model_dump(), indent=2))