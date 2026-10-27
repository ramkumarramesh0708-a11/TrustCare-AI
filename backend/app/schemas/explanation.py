from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel


class FactorContribution(BaseModel):
    factor: str
    weight: float
    direction: str  # "increases_risk", "decreases_risk", "neutral"
    description: str


class ExplanationResponse(BaseModel):
    id: Optional[str] = None
    assessment_id: Optional[str] = None
    model_name: str
    model_version: str
    validation_status: str
    explanation_method: str
    factor_contributions: List[FactorContribution]
    limitations: str
    missing_inputs: List[str] = []
    human_review_recommended: bool = True
    generated_at: datetime

    class Config:
        from_attributes = True
