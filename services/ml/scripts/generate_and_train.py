#!/usr/bin/env python3
"""
Generate synthetic ShieldRide-style data and train:
  - XGBoost regressor: weekly risk score R_w
  - XGBoost classifiers (×5): trigger fire probability per type
  - IsolationForest: fraud anomaly -> F_w; B,G,L from feature subscores

Writes to services/ml/artifacts/
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from xgboost import XGBClassifier, XGBRegressor

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "artifacts"
RNG = np.random.default_rng(42)


def clamp01(x: np.ndarray) -> np.ndarray:
    return np.clip(x, 0.0, 1.0)


def train_risk() -> None:
    n = 14_000
    rain = RNG.uniform(0, 80, n)
    heat = RNG.uniform(28, 48, n)
    aqi = RNG.integers(20, 400, n).astype(float)
    cancel = RNG.uniform(5, 55, n)
    plat = RNG.integers(0, 3, n)
    p0 = (plat == 0).astype(float)
    p1 = (plat == 1).astype(float)
    p2 = (plat == 2).astype(float)
    R = clamp01(rain / 75)
    H = clamp01(np.maximum(0, heat - 30) / 17)
    A = clamp01(aqi / 380)
    O = np.where(plat == 1, 1.0, np.where(plat == 2, 0.9, 0.1))
    C = clamp01(cancel / 58)
    y = clamp01(R * 0.25 + H * 0.15 + A * 0.1 + O * 0.2 + C * 0.15 + RNG.normal(0, 0.045, n))
    X = np.column_stack([rain, heat, aqi, cancel, p0, p1, p2])
    model = XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, y)
    model.save_model(str(ART / "risk_xgb.json"))
    print("saved risk_xgb.json")


def train_triggers() -> None:
    n = 16_000
    rain = RNG.uniform(0, 70, n)
    heat = RNG.uniform(28, 46, n)
    aqi = RNG.integers(30, 380, n).astype(float)
    cancel = RNG.uniform(8, 52, n)
    sr = RNG.uniform(0, 130, n)
    sh = RNG.uniform(0, 200, n)
    sa = RNG.uniform(0, 260, n)
    so = RNG.uniform(0, 200, n)
    sd = RNG.uniform(0, 200, n)
    od = RNG.uniform(1, 14, n)
    plat = RNG.integers(0, 3, n)
    hour = RNG.integers(0, 24, n).astype(float)
    p1 = (plat == 1).astype(float)
    p2 = (plat == 2).astype(float)
    X = np.column_stack(
        [rain, heat, aqi, cancel, sr, sh, sa, so, sd, od, p1, p2, hour / 24.0]
    )

    def flip_noise(p: float, size: int) -> np.ndarray:
        return RNG.random(size) < p

    y_rain = (((rain > 35) & (sr > 45)) | flip_noise(0.07, n)).astype(int)
    y_heat = (((heat > 42) & (hour >= 11) & (hour < 16)) | flip_noise(0.06, n)).astype(int)
    y_aqi = (((aqi > 300) & (sa >= 180)) | flip_noise(0.06, n)).astype(int)
    y_out = (((plat == 2) | ((plat == 1) & (so >= 90))) | flip_noise(0.05, n)).astype(int)
    y_dem = (((cancel > 45) & (sd >= 120) & (od >= 5)) | flip_noise(0.06, n)).astype(int)

    for name, y in [
        ("rainfall", y_rain),
        ("heat", y_heat),
        ("aqi", y_aqi),
        ("outage", y_out),
        ("demand", y_dem),
    ]:
        clf = XGBClassifier(
            n_estimators=80,
            max_depth=4,
            learning_rate=0.1,
            subsample=0.88,
            colsample_bytree=0.88,
            random_state=42,
            n_jobs=-1,
        )
        clf.fit(X, y)
        clf.save_model(str(ART / f"trigger_{name}_xgb.json"))
        print(f"saved trigger_{name}_xgb.json")


def train_fraud() -> None:
    n_legit = 7_000
    n_fraud = 2_200

    def pack_block(
        n: int,
        z_scale: float,
        sudden_p: float,
        static_p: float,
        wx_p: float,
        shared_lam: float,
        upi_p: float,
        gps_max: float,
    ) -> np.ndarray:
        z = RNG.normal(0, z_scale, n)
        sudden = (RNG.random(n) < sudden_p).astype(float)
        gps = RNG.uniform(0, gps_max, n)
        static = (RNG.random(n) < static_p).astype(float)
        wx = (RNG.random(n) < wx_p).astype(float)
        shared = RNG.poisson(shared_lam, n).astype(float).clip(0, 10)
        upi = (RNG.random(n) < upi_p).astype(float)
        return np.column_stack([z, sudden, gps, static, wx, shared, upi])

    X_legit = pack_block(n_legit, 1.0, 0.04, 0.1, 0.06, 0.35, 0.04, 95.0)
    X_fraud = pack_block(n_fraud, 2.4, 0.42, 0.52, 0.48, 2.4, 0.38, 140.0)

    model = IsolationForest(
        n_estimators=280,
        contamination=0.1,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_legit)
    joblib.dump(model, ART / "fraud_if.joblib")

    legit_s = model.score_samples(X_legit)
    fraud_s = model.score_samples(X_fraud)
    # Lower score_samples => more anomalous in sklearn IF convention
    lo, hi = float(np.percentile(legit_s, 5)), float(np.percentile(legit_s, 95))
    meta = {
        "score_lo": lo,
        "score_hi": hi,
        "fraud_median_score": float(np.median(fraud_s)),
        "feature_names": [
            "income_z",
            "sudden_inactive",
            "gps_speed",
            "static_gps",
            "weather_mismatch",
            "shared_device",
            "shared_upi",
        ],
    }
    (ART / "fraud_meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    print("saved fraud_if.joblib + fraud_meta.json")


def main() -> None:
    ART.mkdir(parents=True, exist_ok=True)
    print("Training dir:", ART)
    train_risk()
    train_triggers()
    train_fraud()
    print("Done.")


if __name__ == "__main__":
    main()
    sys.exit(0)
