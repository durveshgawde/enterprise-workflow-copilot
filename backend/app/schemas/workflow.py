from pydantic import BaseModel
from typing import Optional, List

class WorkflowBase(BaseModel):
    title: str
    description: Optional[str] = None

class WorkflowCreate(WorkflowBase):
    organization_id: str

class Workflow(WorkflowBase):
    id: str
    organization_id: str
    created_by: str
    status: str
    created_at: str

    class Config:
        from_attributes = True
