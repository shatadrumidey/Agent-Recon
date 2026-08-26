from fastapi import FastAPI

from app.engine import execute_recon_pipeline


app = FastAPI(title="Self-Synthesizing Ledger API")


@app.get("/health")
def health_check():
    return {
        "status": "operational",
        "engine": "ready"
    }


@app.post("/api/v1/recon/run-deterministic")
def run_deterministic_recon():
    result = execute_recon_pipeline()

    return {
        "status": "success",
        "data": result
    }