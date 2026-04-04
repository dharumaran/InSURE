"""XGBoost regressor (Booster API) trained on synthetic data."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import xgboost as xgb

_ART = Path(__file__).resolve().parent.parent.parent / "artifacts"
_BOOSTER: xgb.Booster | None = None

WEEKLY_PREMIUM_BASE = 30.0
WEEKLY_PREMIUM_ALPHA = 0.7
WEEKLY_PREMIUM_MIN = 20
WEEKLY_PREMIUM_MAX = 50


def _booster() -> xgb.Booster:
    global _BOOSTER
    if _BOOSTER is None:
        path = _ART / "risk_xgb.json"
        if not path.is_file():
            raise FileNotFoundError(f"Missing {path}; run: python scripts/generate_and_train.py")
        b = xgb.Booster()
        b.load_model(str(path))
        _BOOSTER = b
    return _BOOSTER


def predict_risk_premium(features: dict) -> tuple[float, float]:
    plat = str(features["platformStatus"])
    p0 = 1.0 if plat == "online" else 0.0
    p1 = 1.0 if plat == "degraded" else 0.0
    p2 = 1.0 if plat == "outage" else 0.0
    X = np.array(
        [
            [
                float(features["rainfallMmHr"]),
                float(features["heatIndexC"]),
                float(features["aqiScore"]),
                float(features["cancelRatePct"]),
                p0,
                p1,
                p2,
            ]
        ],
        dtype=np.float32,
    )
    d = xgb.DMatrix(X)
    rw = float(np.clip(_booster().predict(d)[0], 0.0, 1.0))
    raw = round(WEEKLY_PREMIUM_BASE * (1.0 + WEEKLY_PREMIUM_ALPHA * rw))
    prem = min(max(raw, WEEKLY_PREMIUM_MIN), WEEKLY_PREMIUM_MAX)
    return rw, float(prem)
