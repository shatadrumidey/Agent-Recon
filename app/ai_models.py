from pydantic import BaseModel, Field, field_validator
from typing import Literal, Optional

class ProposedRule(BaseModel):
    rule_name: str = Field(description="A descriptive snake_case name, e.g., 'gateway_fee_2_percent'")
    rule_type: Literal["amount_ratio", "narration_contains_id", "amount_exact"] = Field(
        description="The specific financial relationship type."
    )
    merchant_field: Literal["amount_inr", "merch_txn_id", "timestamp"] = Field(
        description="The field on the merchant transaction to compare."
    )
    bank_field: Literal["settlement_amount", "bank_ref_id", "narration", "merch_ref_id"] = Field(
        description="The field on the bank transaction to compare."
    )
    
    # Conditional fields based on rule_type
    ratio: Optional[float] = Field(None, description="Only required if rule_type is 'amount_ratio'. E.g., 0.98")
    tolerance: Optional[float] = Field(None, description="Absolute tolerance for floating point comparisons.")
    
    explanation: str = Field(description="Auditable explanation of the observable evidence derived from the samples.")

    @field_validator('ratio')
    def check_ratio(cls, v, info):
        if info.data.get('rule_type') == 'amount_ratio' and v is None:
            raise ValueError("ratio is required for amount_ratio rule_type")
        return v