from typing import Dict, Any, List
from pydantic import BaseModel


class StatusCount(BaseModel):
    status: str
    count: int


class RiskCount(BaseModel):
    risk_level: str
    count: int


class ModuleCount(BaseModel):
    module_id: str
    name: str
    count: int


class OverviewStats(BaseModel):
    total_assessments: int
    pending_review: int
    follow_ups_due: int
    active_alerts: int
    critical_alerts: int
    status_distribution: List[StatusCount]
    risk_distribution: List[RiskCount]
    module_distribution: List[ModuleCount]
    models_active: int
    models_experimental_or_demo: int
