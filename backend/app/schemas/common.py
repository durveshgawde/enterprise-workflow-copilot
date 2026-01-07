from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[dict] = None

class SuccessResponse(BaseModel):
    success: bool = True
    data: Optional[dict] = None
    message: Optional[str] = None
