import json

import traceback

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.sampler import get_stratified_anomaly_sample
from app.ai_agent import propose_reconciliation_rule
from app.rule_validator import validate_rule
from app.rule_backtester import evaluate_candidate_rule
from app.rule_manager import promote_rule
from app.engine import execute_recon_pipeline
from app.ai_models import ProposedRule
from app.database import Base, SessionLocal, engine as db_engine
from app.ledger import persist_pipeline_result, get_latest_job, matches_to_dict

from app.poison_pill import evaluate_poison_pill


app = FastAPI(
    title="ReconAgent",
    description="Deterministic-first, AI-second financial reconciliation engine.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """
    Create tables if they don't exist, and seed the immutable
    ledger with one initial reconciliation snapshot if the
    database is empty (first run).
    """

    Base.metadata.create_all(bind=db_engine)

    db = SessionLocal()
    try:
        if get_latest_job(db) is None:
            initial_result = execute_recon_pipeline()
            persist_pipeline_result(db, initial_result)
    finally:
        db.close()


class PromotionRequest(BaseModel):
    rule: ProposedRule

@app.post("/api/v1/recon/promote")
def promote_ai_rule(request: PromotionRequest):
    """
    Promote a candidate AI-generated rule to production.

    The server independently:
    1. validates the rule
    2. re-runs the Shadow Sandbox
    3. promotes only if the sandbox approves it
    4. executes the reconciliation pipeline
    """

    candidate_rule = request.rule

    # =====================================================
    # STEP 1 — Semantic validation
    # =====================================================

    is_valid, errors = validate_rule(candidate_rule)

    if not is_valid:
        return {
            "status": "rejected",
            "stage": "validation",
            "rule": candidate_rule.model_dump(),
            "validation": {
                "semantic_valid": False,
                "errors": errors,
            },
        }

    # =====================================================
    # STEP 2 — Load complete exception pool
    # =====================================================

    try:
        with open(
            "data/exceptions_merch.json",
            "r",
            encoding="utf-8",
        ) as f:
            merch_exceptions = json.load(f)

        with open(
            "data/exceptions_bank.json",
            "r",
            encoding="utf-8",
        ) as f:
            bank_exceptions = json.load(f)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load exception data: {str(e)}",
        )

    # =====================================================
    # STEP 3 — SERVER-SIDE SHADOW SANDBOX
    # =====================================================

    evaluation = evaluate_candidate_rule(
        candidate_rule,
        merch_exceptions,
        bank_exceptions,
    )

    if evaluation["status"] != "APPROVED":
        return {
            "status": "rejected",
            "stage": "shadow_sandbox",
            "rule": candidate_rule.model_dump(),
            "evaluation": evaluation,
        }

    # =====================================================
    # STEP 4 — Promote
    # =====================================================

    promotion = promote_rule(
        candidate_rule.model_dump()
    )

    # =====================================================
    # STEP 5 — Execute production reconciliation
    # =====================================================

    try:
        pipeline_result = execute_recon_pipeline()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Rule was promoted, but production execution "
                f"failed: {str(e)}"
            ),
        )

    # =====================================================
    # STEP 6 — Persist this run as a new immutable ledger snapshot
    # =====================================================

    db = SessionLocal()
    try:
        persist_pipeline_result(db, pipeline_result)
    finally:
        db.close()

    return {
        "status": "success",
        "message": (
            f"Rule {candidate_rule.rule_name} "
            "promoted and executed successfully."
        ),
        "rule": candidate_rule.model_dump(),
        "promotion": promotion,
        "evaluation": evaluation,
        "production": {
            "total_processed": pipeline_result["total_processed"],
            "matches_found": pipeline_result["matches_found"],
            "exceptions_generated": pipeline_result["exceptions_generated"],
        },
    }

@app.get("/api/v1/recon/status")
def get_system_status():
    """
    Live system status, read from the latest snapshot in the
    immutable ledger (SQLite) -- not recomputed on every request.
    """

    db = SessionLocal()
    try:
        job = get_latest_job(db)

        if job is None:
            raise HTTPException(
                status_code=500,
                detail="No reconciliation job found in the ledger.",
            )

        ai_matches = sum(
            1
            for match in job.matches
            if match.match_type == "AI_GENERATED"
        )

        deterministic_matches = sum(
            1
            for match in job.matches
            if match.match_type == "DETERMINISTIC"
        )

        return {
            "total_volume": job.total_processed,
            "auto_cleared": deterministic_matches,
            "ai_cleared": ai_matches,
            "action_required": job.exceptions_generated,
        }
    finally:
        db.close()


@app.get("/api/v1/recon/matches")
def get_matches():
    """
    Full list of match records from the latest snapshot in the
    immutable ledger, for the Audit Trail screen.
    """

    db = SessionLocal()
    try:
        job = get_latest_job(db)

        if job is None:
            return {"matches": []}

        return {"matches": matches_to_dict(job.matches)}
    finally:
        db.close()

@app.post("/api/v1/recon/ai-propose-rule")


def ai_propose_rule(
    anomaly_type: str = Query(
        ...,
        description="'fee' or 'narration'",
    )
):
    """
    Generate an AI-proposed reconciliation rule
    without promoting or executing it.
    """

    # 1. Get a small stratified sample
    samples = get_stratified_anomaly_sample(
        anomaly_type=anomaly_type,
        sample_size=5,
        seed=42,
    )

    if not samples:
        raise HTTPException(
            status_code=400,
            detail=(
                f"No samples available for anomaly type: "
                f"{anomaly_type}"
            ),
        )

    # 2. Ask Gemini to propose a bounded rule
    try:
        rule = propose_reconciliation_rule(samples)
    except Exception as e:
        error_message = str(e)

        if "429" in error_message or "quota" in error_message.lower():
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exceeded. Please wait for the quota to reset or use a project with available quota.",
            )

        raise HTTPException(
            status_code=500,
            detail=f"LLM failure: {error_message}",
        )

    # 3. Validate the proposed rule
    is_valid, errors = validate_rule(rule)

    return {
        "status": (
            "candidate_accepted"
            if is_valid
            else "candidate_rejected"
        ),
        "rule": rule.model_dump(),
        "validation": {
            "semantic_valid": is_valid,
            "errors": errors,
        },
    }

@app.post("/api/v1/recon/ai-propose-and-evaluate")
def propose_and_evaluate(
    anomaly_type: str = Query(
        ...,
        description="'fee' or 'narration'",
    )
):
    """
    Generate an AI reconciliation rule and evaluate it
    in the Shadow Sandbox.

    IMPORTANT:
    This endpoint does NOT promote the rule and does NOT
    execute the reconciliation pipeline.
    """

    # =====================================================
    # STEP 1 — Generate candidate rule
    # =====================================================

    samples = get_stratified_anomaly_sample(
        anomaly_type=anomaly_type,
        sample_size=5,
        seed=42,
    )

    if not samples:
        raise HTTPException(
            status_code=400,
            detail=(
                f"No samples available for anomaly type: "
                f"{anomaly_type}"
            ),
        )

    try:
        candidate_rule = propose_reconciliation_rule(samples)

    except Exception as e:
        error_message = str(e)

        if "429" in error_message or "quota" in error_message.lower():
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exceeded. Please wait for the quota to reset or use a project with available quota.",
            )

        raise HTTPException(
            status_code=500,
            detail=f"LLM failure: {error_message}",
        )

    # =====================================================
    # STEP 2 — Semantic validation
    # =====================================================

    is_valid, errors = validate_rule(candidate_rule)

    if not is_valid:
        return {
            "status": "rejected",
            "stage": "validation",
            "rule": candidate_rule.model_dump(),
            "validation": {
                "semantic_valid": False,
                "errors": errors,
            },
        }

    # =====================================================
    # STEP 3 — Load complete exception pool
    # =====================================================

    try:
        with open(
            "data/exceptions_merch.json",
            "r",
            encoding="utf-8",
        ) as f:
            merch_exceptions = json.load(f)

        with open(
            "data/exceptions_bank.json",
            "r",
            encoding="utf-8",
        ) as f:
            bank_exceptions = json.load(f)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load exception data: {str(e)}",
        )

    # =====================================================
    # STEP 4 — Shadow Sandbox
    # =====================================================

    evaluation = evaluate_candidate_rule(
        candidate_rule,
        merch_exceptions,
        bank_exceptions,
    )

    # =====================================================
    # STEP 5 — STOP HERE
    # =====================================================

    return {
        "status": (
            "sandbox_approved"
            if evaluation["status"] == "APPROVED"
            else "sandbox_rejected"
        ),
        "rule": candidate_rule.model_dump(),
        "validation": {
            "semantic_valid": True,
            "errors": [],
        },
        "sandbox": evaluation,
    }

@app.post("/api/v1/recon/poison-pill")
def run_poison_pill(request: PromotionRequest):
    """
    Red-team the candidate rule with a crafted false-positive fixture.

    The production dataset, active rules, and immutable ledger are never
    modified. This endpoint exists only to prove that the Shadow Sandbox
    rejects a rule when an adversarial collision is introduced.
    """

    candidate_rule = request.rule

    # -----------------------------------------------------
    # STEP 1 — Validate the candidate rule
    # -----------------------------------------------------

    is_valid, errors = validate_rule(candidate_rule)

    if not is_valid:
        return {
            "status": "rejected",
            "stage": "validation",
            "threat": "poison_pill",
            "rule": candidate_rule.model_dump(),
            "validation": {
                "semantic_valid": False,
                "errors": errors,
            },
        }

    # This specific adversarial fixture targets the
    # narration_contains_id rule.
    if candidate_rule.rule_type != "narration_contains_id":
        return {
            "status": "rejected",
            "stage": "poison_pill",
            "threat": "poison_pill",
            "rule": candidate_rule.model_dump(),
            "message": (
                "Poison Pill fixture targets narration_contains_id rules; "
                "no production state was changed."
            ),
        }

    # -----------------------------------------------------
    # STEP 2 — Run the real Shadow Sandbox
    # against adversarial in-memory data
    # -----------------------------------------------------

    evaluation = evaluate_poison_pill(candidate_rule)

    # -----------------------------------------------------
    # STEP 3 — Always stop here
    #
    # Poison Pill tests can NEVER promote a rule.
    # -----------------------------------------------------

    return {
        "status": "sandbox_rejected",
        "stage": "shadow_sandbox",
        "threat": "poison_pill",
        "rule": candidate_rule.model_dump(),
        "validation": {
            "semantic_valid": True,
            "errors": [],
        },
        "sandbox": evaluation,
        "promotion_blocked": True,
    }

@app.post("/api/v1/recon/auto-resolve")
def auto_resolve_exceptions(
    anomaly_type: str = Query(
        "fee",
        description="'fee' or 'narration'",
    )
):
    """
    Complete AI promotion pipeline:

    1. Sample exceptions
    2. Ask Gemini for a rule
    3. Validate the rule
    4. Shadow-test it against every exception combination
    5. Promote only if false positives == 0
    6. Re-run the reconciliation engine
    """

    # =====================================================
    # STEP 1 — Generate candidate rule
    # =====================================================

    samples = get_stratified_anomaly_sample(
        anomaly_type=anomaly_type,
        sample_size=5,
        seed=42,
    )

    if not samples:
        raise HTTPException(
            status_code=400,
            detail=(
                f"No samples available for anomaly type: "
                f"{anomaly_type}"
            ),
        )

    try:
        candidate_rule = propose_reconciliation_rule(
            samples
        )
    except Exception as e:
        error_message = str(e)

        if "429" in error_message or "quota" in error_message.lower():
            raise HTTPException(
                status_code=429,
                detail="Gemini API quota exceeded. Please wait for the quota to reset or use a project with available quota.",
            )

        raise HTTPException(
            status_code=500,
            detail=f"LLM failure: {error_message}",
        )

    # =====================================================
    # STEP 2 — Semantic validation
    # =====================================================

    is_valid, errors = validate_rule(
        candidate_rule
    )

    if not is_valid:
        return {
            "status": "rejected",
            "stage": "validation",
            "rule": candidate_rule.model_dump(),
            "errors": errors,
        }

    # =====================================================
    # STEP 3 — Load the complete exception pool
    # =====================================================

    try:
        with open(
            "data/exceptions_merch.json",
            "r",
            encoding="utf-8",
        ) as f:
            merch_exceptions = json.load(f)

        with open(
            "data/exceptions_bank.json",
            "r",
            encoding="utf-8",
        ) as f:
            bank_exceptions = json.load(f)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to load exception data: {str(e)}"
            ),
        )

    # =====================================================
    # STEP 4 — Shadow Sandbox
    # =====================================================

    evaluation = evaluate_candidate_rule(
        candidate_rule,
        merch_exceptions,
        bank_exceptions,
    )

    # =====================================================
    # STEP 5 — Promotion gate
    # =====================================================

    if evaluation["status"] != "APPROVED":
        return {
            "status": "rejected",
            "stage": "shadow_sandbox",
            "rule": candidate_rule.model_dump(),
            "evaluation": evaluation,
        }

    promotion = promote_rule(
        candidate_rule.model_dump()
    )

    # =====================================================
    # STEP 6 — Re-run the complete reconciliation engine
    # =====================================================

    try:
        pipeline_result = execute_recon_pipeline()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Rule was promoted, but pipeline execution "
                f"failed: {str(e)}"
            ),
        )

    # =====================================================
    # STEP 7 — Persist this run as a new immutable ledger snapshot
    # =====================================================

    db = SessionLocal()
    try:
        persist_pipeline_result(db, pipeline_result)
    finally:
        db.close()

    return {
        "status": "success",
        "message": (
            f"Rule {candidate_rule.rule_name} "
            "deployed successfully."
        ),
        "rule": candidate_rule.model_dump(),
        "promotion": promotion,
        "evaluation": evaluation,
        "new_pipeline_stats": {
            "total_processed": (
                pipeline_result["total_processed"]
            ),
            "matches_found": (
                pipeline_result["matches_found"]
            ),
            "exceptions_generated": (
                pipeline_result["exceptions_generated"]
            ),
        },
    }