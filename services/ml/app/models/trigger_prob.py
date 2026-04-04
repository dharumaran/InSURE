"""Five XGBoost binary classifiers (Booster API) for trigger fire probabilities."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import xgboost as xgb

_ART = Path(__file__).resolve().parent.parent.parent / "artifacts"
_NAMES = ("rainfall", "heat", "aqi", "outage", "demand")
_BOOSTERS: dict[str, xgb.Booster] = {}


def _get(name: str) -> xgb.Booster:
    if name not in _BOOSTERS:
        path = _ART / f"trigger_{name}_xgb.json"
        if not path.is_file():
            raise FileNotFoundError(f"Missing {path}; run: python scripts/generate_and_train.py")
        b = xgb.Booster()
        b.load_model(str(path))
        _BOOSTERS[name] = b
    return _BOOSTERS[name]


def _feature_row(features: dict) -> np.ndarray:
    plat = str(features.get("platformStatus", "online"))
    p1 = 1.0 if plat == "degraded" else 0.0
    p2 = 1.0 if plat == "outage" else 0.0
    hour = float(features.get("hourIST", 12))
    return np.array(
        [
            [
                float(features["rainfallMmHr"]),
                float(features["heatIndexC"]),
                float(features["aqiScore"]),
                float(features["cancelRatePct"]),
                float(features.get("sustainedRainMinutes", 0)),
                float(features.get("sustainedHeatMinutes", 0)),
                float(features.get("sustainedAqiMinutes", 0)),
                float(features.get("sustainedOutageMinutes", 0)),
                float(features.get("sustainedDemandMinutes", 0)),
                float(features.get("orderDensity", 6)),
                p1,
                p2,
                hour / 24.0,
            ]
        ],
        dtype=np.float32,
    )


def predict_trigger_probs(features: dict) -> dict[str, float]:
    X = _feature_row(features)
    d = xgb.DMatrix(X)
    out: dict[str, float] = {}
    for name in _NAMES:
        p = float(_get(name).predict(d)[0])
        out[name] = min(1.0, max(0.0, p))
    return out
