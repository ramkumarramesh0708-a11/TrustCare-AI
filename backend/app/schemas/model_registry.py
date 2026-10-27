from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel


class ModelRegistryResponse(BaseModel):
    id: str
    model_key: str
    name: str
    domain: str
    version: str
    status: str
    validation_status: str
    intended_use: str
    limitations: str
    metrics: Dict[str, Any]
    last_evaluated: datetime

    class Config:
        from_attributes = True


class ModelRegistryCreate(BaseModel):
    model_key: str
    name: str
    domain: str
    version: str
    status: str
    validation_status: str
    intended_use: str
    limitations: str
    metrics: Dict[str, Any] = {}
