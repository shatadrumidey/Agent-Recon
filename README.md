# Agent Recon

AI-assisted financial reconciliation engine that combines deterministic matching with controlled AI-based rule discovery.

## Problem

Financial reconciliation means comparing records from a merchant ledger and a bank ledger and finding which transactions match.

A naive approach is to send all exceptions to an LLM and ask it to figure out the matches. This can be expensive, inconsistent, difficult to audit, and unsafe because the model can hallucinate incorrect matches.

## Approach

Agent Recon uses AI only where it is useful, while keeping the actual financial execution deterministic and controlled.

```text
Merchant + Bank Ledgers
          ↓
Deterministic Matching
          ↓
130 Exceptions
          ↓
Sample Exceptions → Gemini
          ↓
Constrained Rule (DSL)
          ↓
Pydantic + Semantic Validation
          ↓
Shadow Backtest
          ↓
Poison Pill / Adversarial Test
          ↓
Rule Promotion
          ↓
Trusted Python Execution
          ↓
Audit Trail

```
The demo contains 1,000 synthetic transactions:

870 resolved deterministically
70 recovered using validated AI rules
60 left for further investigation

A key design decision was moving away from arbitrary AI-generated Python. The LLM only proposes a constrained rule, which is validated and tested before it can affect reconciliation.

The system also includes a Poison Pill attack that deliberately tries to fool a candidate rule. A false positive causes the rule to be rejected.

## Tech Stack

Backend: Python, FastAPI, Pydantic, SQLAlchemy, SQLite, Gemini API

Frontend: React, TypeScript, Vite, Tailwind CSS

Testing: pytest

Deployment: Render (backend), Vercel (frontend)

## Key Features
Deterministic and T+1 transaction matching

AI-based exception pattern discovery

Constrained rule DSL

Structural + semantic rule validation

Shadow backtesting with precision/recall

Adversarial Poison Pill testing

Immutable reconciliation snapshots

Auditable transaction-level results

## Live Demo:
https://agentrecon.vercel.app/
