"""Phase-1: deterministic R_w + premium (matches Node shared formula). XGBoost hook for later."""

from __future__ import annotations


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def predict_risk_premium(features: dict) -> tuple[float, float]:
    r = features["rainfallMmHr"]
    h = features["heatIndexC"]
    a = float(features["aqiScore"])
    c = features["cancelRatePct"]
    st = features["platformStatus"]

    R = _clamp01(r / 75)
    H = _clamp01(max(0.0, (h - 30) / 17))
    A = _clamp01(a / 380)
    O = 1.0 if st == "degraded" else 0.1
    Cc = _clamp01(c / 58)
    rw = _clamp01(R * 0.25 + H * 0.15 + A * 0.10 + O * 0.20 + Cc * 0.15)
    prem = min(max(round(75 * (1 + 0.7 * rw)), 80), 120)
    return rw, float(prem)


def train_stub():
    return None
