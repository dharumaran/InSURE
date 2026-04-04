"""Isolation Forest (trained on synthetic legitimate riders) + interpretable B/G/L subscores."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np

from app.utils.weights import FRAUD_WEIGHTS

_ART = Path(__file__).resolve().parent.parent.parent / "artifacts"
_IF = None
_META: dict | None = None


def _load():
    global _IF, _META
    if _IF is None:
        p = _ART / "fraud_if.joblib"
        mpath = _ART / "fraud_meta.json"
        if not p.is_file() or not mpath.is_file():
            raise FileNotFoundError("Missing fraud artifacts; run: python scripts/generate_and_train.py")
        _IF = joblib.load(p)
        _META = json.loads(mpath.read_text(encoding="utf-8"))
    return _IF, _META


def _rule_bgl(f: dict) -> tuple[float, float, float]:
    b = min(
        1.0,
        abs(float(f.get("incomeZ", 0))) / 4.0 + (0.35 if f.get("suddenInactive") else 0.0),
    )
    g = min(
        1.0,
        (1.0 if float(f.get("gpsSpeedKmh", 0)) > 120 else 0.0)
        + (0.4 if f.get("staticWhileActive") else 0.0)
        + (0.35 if f.get("weatherMismatch") else 0.0),
    )
    shared = int(f.get("sharedDeviceCount", 0))
    l = min(1.0, shared * 0.22 + (0.95 if f.get("sharedUpi") else 0.0))
    return b, g, l


def predict_fraud(f: dict) -> dict[str, float]:
    model, meta = _load()
    X = np.array(
        [
            [
                float(f.get("incomeZ", 0)),
                1.0 if f.get("suddenInactive") else 0.0,
                float(f.get("gpsSpeedKmh", 0)),
                1.0 if f.get("staticWhileActive") else 0.0,
                1.0 if f.get("weatherMismatch") else 0.0,
                float(f.get("sharedDeviceCount", 0)),
                1.0 if f.get("sharedUpi") else 0.0,
            ]
        ],
        dtype=np.float32,
    )
    s = float(model.score_samples(X)[0])
    lo, hi = float(meta["score_lo"]), float(meta["score_hi"])
    span = hi - lo + 1e-9
    # More anomalous => lower score_samples => higher F_w from IF track
    if_raw = float(np.clip((hi - s) / span, 0.0, 1.0))

    b, g, l = _rule_bgl(f)
    rule_fw = FRAUD_WEIGHTS["B"] * b + FRAUD_WEIGHTS["G"] * g + FRAUD_WEIGHTS["L"] * l
    fw = float(np.clip(0.58 * if_raw + 0.42 * rule_fw, 0.0, 1.0))
    return {"B": b, "G": g, "L": l, "F_w": fw}
