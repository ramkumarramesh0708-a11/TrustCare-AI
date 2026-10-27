import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    subject_ref = Column(String(64), index=True, nullable=False)  # Pseudonymous reference
    module_id = Column(String(64), ForeignKey("screening_modules.id"), nullable=False, index=True)
    status = Column(String(32), default="submitted", index=True, nullable=False)
    # Statuses: submitted, pending_review, reviewed, follow_up_required, closed
    risk_level = Column(String(32), default="indeterminate", index=True, nullable=False)
    # Risk Levels: low, moderate, high, urgent, indeterminate
    confidence_score = Column(Float, nullable=True)
    outcome_summary = Column(Text, nullable=False)
    raw_inputs = Column(JSON, nullable=False)
    has_file_attachment = Column(Boolean, default=False)
    attachment_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    explanation = relationship("AssessmentExplanation", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="assessment", cascade="all, delete-orphan")
    reviews = relationship("HumanReview", back_populates="assessment", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUpRecord", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentExplanation(Base):
    __tablename__ = "assessment_explanations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), unique=True, nullable=False)
    model_name = Column(String(128), nullable=False)
    model_version = Column(String(32), nullable=False)
    validation_status = Column(String(64), nullable=False)
    # Validation: clinical_validated, pilot_study, synthetic_pipeline_only, not_validated, unavailable
    explanation_method = Column(String(64), nullable=False)
    # SHAP, Grad-CAM, Feature Contribution, Rule Weighting, Unavailable
    factor_contributions = Column(JSON, nullable=False)  # list of {factor, weight, direction, description}
    limitations = Column(Text, nullable=False)
    missing_inputs = Column(JSON, default=list, nullable=False)
    human_review_recommended = Column(Boolean, default=True, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    assessment = relationship("Assessment", back_populates="explanation")
