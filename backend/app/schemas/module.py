from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ModuleBase(BaseModel):
    id: str
    name: str
    category: str
    description: str
    icon: str = "Activity"
    is_active: bool = True
    version: str = "1.0.0"
    requires_file_upload: bool = False
    disclaimer: str


class ModuleResponse(ModuleBase):
    created_at: datetime

    class Config:
        from_attributes = True
