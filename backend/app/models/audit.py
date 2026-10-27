import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON
from app.db.session import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    user_role = Column(String(32), default="anonymous", nullable=False)
    action = Column(String(64), index=True, nullable=False)
    resource_type = Column(String(64), nullable=False)
    resource_id = Column(String(64), nullable=True)
    details = Column(JSON, default=dict, nullable=False)
    ip_address = Column(String(64), default="127.0.0.1", nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
