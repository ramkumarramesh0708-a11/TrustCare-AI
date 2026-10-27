from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: str
    assessment_id: str
    module_id: str
    alert_type: str
    severity: str
    trigger_reason: str
    status: str
    simulated: bool
    created_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None

    class Config:
        from_attributes = True


class AlertUpdateStatus(BaseModel):
    status: str  # active, acknowledged, resolved
    notes: Optional[str] = None
