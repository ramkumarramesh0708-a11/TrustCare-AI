from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent


class AuditService:
    @staticmethod
    def log(
        db: Session,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        user_id: Optional[str] = None,
        user_role: str = "anonymous",
        details: Optional[Dict[str, Any]] = None,
        ip_address: str = "127.0.0.1"
    ) -> AuditEvent:
        event = AuditEvent(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            user_id=user_id,
            user_role=user_role,
            details=details or {},
            ip_address=ip_address
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event


audit_service = AuditService()
