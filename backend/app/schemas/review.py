from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class HumanReviewCreate(BaseModel):
    assessment_id: str
    decision: str  # concur, modify, request_followup, refer_specialist, closed
    notes: str
    recommendations: Optional[str] = None
    referral_target: Optional[str] = None


class HumanReviewResponse(BaseModel):
    id: str
    assessment_id: str
    reviewer_id: Optional[str] = None
    reviewer_name: str
    reviewer_role: str
    decision: str
    notes: str
    recommendations: Optional[str] = None
    referral_target: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FollowUpCreate(BaseModel):
    assessment_id: str
    due_date: datetime
    note: str
    contact_channel: str = "clinical_portal"


class FollowUpResponse(BaseModel):
    id: str
    assessment_id: str
    due_date: datetime
    status: str
    note: str
    contact_channel: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FollowUpUpdate(BaseModel):
    status: str  # pending, completed, missed
    note: Optional[str] = None
