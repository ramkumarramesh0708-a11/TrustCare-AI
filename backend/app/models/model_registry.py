import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from app.db.session import Base


class ModelRegistryEntry(Base):
    __tablename__ = "model_registry"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    model_key = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    domain = Column(String(64), nullable=False)
    version = Column(String(32), nullable=False)
    status = Column(String(32), default="active", nullable=False)
    # active, experimental, mock_pipeline, unavailable
    validation_status = Column(String(64), nullable=False)
    # clinical_validated, pilot_study, synthetic_pipeline_only, not_validated
    intended_use = Column(Text, nullable=False)
    limitations = Column(Text, nullable=False)
    metrics = Column(JSON, default=dict, nullable=False)
    last_evaluated = Column(DateTime, default=datetime.utcnow, nullable=False)
