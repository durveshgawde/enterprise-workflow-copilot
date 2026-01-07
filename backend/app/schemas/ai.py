from pydantic import BaseModel
from pydantic import BaseModel
from typing import Optional, List

class SOPRequest(BaseModel):
    raw_text: str

class StepSchema(BaseModel):
    title: str
    description: str
    role: Optional[str] = None

class WorkflowSchema(BaseModel):
    title: str
    description: str
    steps: List[StepSchema]

class SOPResponse(BaseModel):
    success: bool
    workflow: Optional[WorkflowSchema] = None
    error: Optional[str] = None

class RewriteRequest(BaseModel):
    step_text: str
    tone: str = "clear_enterprise"

class RewriteResponse(BaseModel):
    success: bool
    original_text: Optional[str] = None
    rewritten_text: Optional[str] = None
    error: Optional[str] = None
    error: Optional[str] = None
