from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from app.schemas.explanation import ExplanationResponse


class AssessmentCreate(BaseModel):
    subject_ref: Optional[str] = None
    module_id: str
    raw_inputs: Dict[str, Any]
    consent_given: bool = True
    attachment_data: Optional[Dict[str, Any]] = None


class AssessmentSummary(BaseModel):
    id: str
    subject_ref: str
    module_id: str
    status: str
    risk_level: str
    confidence_score: Optional[float] = None
    outcome_summary: str
    created_at: datetime
    updated_at: datetime
    has_file_attachment: bool = False

    class Config:
        from_attributes = True


class AssessmentResponse(AssessmentSummary):
    user_id: Optional[str] = None
    raw_inputs: Dict[str, Any]
    attachment_metadata: Optional[Dict[str, Any]] = None
    explanation: Optional[ExplanationResponse] = None
    alerts_count: int = 0
    reviews_count: int = 0
