import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    module_id = Column(String(64), nullable=False, index=True)
    alert_type = Column(String(64), nullable=False)
    severity = Column(String(32), default="warning", index=True, nullable=False)  # info, warning, critical
    trigger_reason = Column(Text, nullable=False)
    status = Column(String(32), default="active", index=True, nullable=False)  # active, acknowledged, resolved
    simulated = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(128), nullable=True)

    assessment = relationship("Assessment", back_populates="alerts")
