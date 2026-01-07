from pydantic import BaseModel
from typing import Optional

class OrganizationBase(BaseModel):
    name: str
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class Organization(OrganizationBase):
    id: str
    owner_id: str
    created_at: str

    class Config:
        from_attributes = True
