"""Lightweight calibrated-ish probs for demo. Replace with XGBoost when trained."""

import math


def predict_trigger_probs(features: dict) -> dict[str, float]:
    r = features["rainfallMmHr"]
    h = features["heatIndexC"]
    a = float(features["aqiScore"])
    c = features["cancelRatePct"]

    def sig(x: float) -> float:
        return 1 / (1 + math.exp(-x))

    return {
        "rainfall": float(sig((r - 35) / 8)),
        "heat": float(sig((h - 42) / 3)),
        "aqi": float(sig((a - 300) / 40)),
        "outage": 0.05,
        "demand": float(sig((c - 45) / 5)),
    }
