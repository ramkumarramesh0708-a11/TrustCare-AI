import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class HumanReview(Base):
    __tablename__ = "human_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewer_name = Column(String(128), nullable=False)
    reviewer_role = Column(String(32), nullable=False)
    decision = Column(String(32), nullable=False)
    # Decisions: concur, modify, request_followup, refer_specialist, closed
    notes = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=True)
    referral_target = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    assessment = relationship("Assessment", back_populates="reviews")


class FollowUpRecord(Base):
    __tablename__ = "follow_up_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(32), default="pending", index=True, nullable=False)  # pending, completed, missed
    note = Column(Text, nullable=False)
    contact_channel = Column(String(64), default="clinical_portal", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    assessment = relationship("Assessment", back_populates="follow_ups")
