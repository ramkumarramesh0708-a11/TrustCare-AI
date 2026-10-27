from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from app.db.session import Base


class ScreeningModule(Base):
    __tablename__ = "screening_modules"

    id = Column(String(64), primary_key=True)  # e.g., 'mental_wellness'
    name = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(64), default="Activity")
    is_active = Column(Boolean, default=True, nullable=False)
    version = Column(String(32), default="1.0.0")
    requires_file_upload = Column(Boolean, default=False)
    disclaimer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
