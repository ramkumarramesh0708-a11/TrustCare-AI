from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel


class AuditEventResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_role: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Dict[str, Any]
    ip_address: str
    timestamp: datetime

    class Config:
        from_attributes = True
