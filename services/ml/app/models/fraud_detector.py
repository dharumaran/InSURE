"""Rule-based Phase-1 fraud scores; Isolation Forest placeholder."""

from app.utils.weights import FRAUD_WEIGHTS


def predict_fraud(f: dict) -> dict[str, float]:
    b = min(
        1.0,
        abs(float(f.get("incomeZ", 0))) / 4 + (0.35 if f.get("suddenInactive") else 0),
    )
    g = min(
        1.0,
        (1.0 if float(f.get("gpsSpeedKmh", 0)) > 120 else 0)
        + (0.4 if f.get("staticWhileActive") else 0)
        + (0.35 if f.get("weatherMismatch") else 0),
    )
    shared = int(f.get("sharedDeviceCount", 0))
    l = min(1.0, shared * 0.22 + (0.95 if f.get("sharedUpi") else 0))
    fw = (
        FRAUD_WEIGHTS["B"] * b + FRAUD_WEIGHTS["G"] * g + FRAUD_WEIGHTS["L"] * l
    )
    return {"B": b, "G": g, "L": l, "F_w": min(1.0, fw)}
