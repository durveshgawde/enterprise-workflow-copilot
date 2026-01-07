from fastapi import APIRouter, Depends
from app.utils.jwt import get_current_user
from typing import Optional
from app.services.supabase_db import list_activities

router = APIRouter()


@router.get("/")
async def list_activity_logs(
    org_id: Optional[str] = None,
    workflow_id: Optional[str] = None,
    user_id: Optional[str] = None,
    current_user = Depends(get_current_user),
):
    """
    List activity logs for an organization, workflow, or user.
    """
    return {"success": True, "organization_id": org_id, "workflow_id": workflow_id, "user_id": user_id, "activities": list_activities(org_id, workflow_id, user_id)}
