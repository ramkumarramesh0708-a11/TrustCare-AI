import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from app.db.session import Base


class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    subject_ref = Column(String(64), index=True, nullable=False)
    module_id = Column(String(64), nullable=False)
    consent_type = Column(String(64), nullable=False)  # e.g., "assessment_processing", "anonymized_audit"
    consented = Column(Boolean, default=True, nullable=False)
    ip_hash = Column(String(128), default="sha256-pseudonymous", nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
