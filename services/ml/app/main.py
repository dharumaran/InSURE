from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.predict import (
    FraudScoreRequest,
    FraudScoreResponse,
    RiskScoreRequest,
    RiskScoreResponse,
    TriggerProbRequest,
    TriggerProbResponse,
)
from app.models.risk_scorer import predict_risk_premium
from app.models.trigger_prob import predict_trigger_probs
from app.models.fraud_detector import predict_fraud

app = FastAPI(title="ShieldRide ML", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ml/risk-score", response_model=RiskScoreResponse)
def risk_score(body: RiskScoreRequest):
    risk, premium = predict_risk_premium(body.model_dump())
    return RiskScoreResponse(riskScore=risk, premium=premium)


@app.post("/ml/trigger-prob", response_model=TriggerProbResponse)
def trigger_prob(body: TriggerProbRequest):
    probs = predict_trigger_probs(body.model_dump())
    return TriggerProbResponse(probabilities=probs)


@app.post("/ml/fraud-score", response_model=FraudScoreResponse)
def fraud_score(body: FraudScoreRequest):
    out = predict_fraud(body.model_dump())
    return FraudScoreResponse(F_w=out["F_w"], B=out["B"], G=out["G"], L=out["L"])
