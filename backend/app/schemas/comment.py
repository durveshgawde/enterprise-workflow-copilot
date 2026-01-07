from pydantic import BaseModel
from typing import Optional

class StepBase(BaseModel):
    title: str
    description: str
    assigned_to: Optional[str] = None

class StepCreate(StepBase):
    workflow_id: str
    order: int

class Step(StepBase):
    id: str
    workflow_id: str
    status: str
    created_at: str

    class Config:
        from_attributes = True
