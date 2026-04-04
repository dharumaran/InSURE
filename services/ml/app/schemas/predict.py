from pydantic import BaseModel, Field


class RiskScoreRequest(BaseModel):
    rainfallMmHr: float = Field(ge=0)
    heatIndexC: float
    aqiScore: int = Field(ge=0)
    cancelRatePct: float = Field(ge=0, le=100)
    platformStatus: str


class RiskScoreResponse(BaseModel):
    riskScore: float
    premium: float


class TriggerProbRequest(BaseModel):
    rainfallMmHr: float
    heatIndexC: float
    aqiScore: int
    cancelRatePct: float


class TriggerProbResponse(BaseModel):
    probabilities: dict[str, float]


class FraudScoreRequest(BaseModel):
    incomeZ: float = 0.0
    suddenInactive: bool = False
    gpsSpeedKmh: float = 0.0
    staticWhileActive: bool = False
    weatherMismatch: bool = False
    sharedDeviceCount: int = 0
    sharedUpi: bool = False


class FraudScoreResponse(BaseModel):
    F_w: float
    B: float
    G: float
    L: float
