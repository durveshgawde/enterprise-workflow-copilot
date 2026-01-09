from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.utils.jwt import get_current_user
from typing import Optional
from app.services.supabase_db import (
    insert_workflow, get_workflow, list_workflows,
    update_workflow, delete_workflow
)

router = APIRouter()


# Pydantic models for request validation
class WorkflowCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    organization_id: Optional[str] = None
    org_id: Optional[str] = None
    status: Optional[str] = "draft"


class WorkflowUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


@router.get("/")
async def list_workflows_route(org_id: Optional[str] = None, current_user = Depends(get_current_user)):
    """List workflows for an organization."""
    import re
    # UUID regex pattern
    uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.I)
    
    # Only use org_id if it's a valid UUID, otherwise return all workflows
    effective_org_id = None
    if org_id and org_id.strip() and uuid_pattern.match(org_id.strip()):
        effective_org_id = org_id.strip()
    
    print(f"[API] list_workflows called with org_id={org_id!r}, effective_org_id={effective_org_id!r}")
    
    workflows = list_workflows(effective_org_id)
    print(f"[API] Returning {len(workflows)} workflows")
    
    return {
        "success": True,
        "organization_id": org_id,
        "workflows": workflows,
    }


@router.get("/{workflow_id}")
async def get_workflow_route(workflow_id: str, current_user = Depends(get_current_user)):
    """Get single workflow with steps."""
    wf = get_workflow(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"success": True, "workflow": wf}


@router.post("/")
async def create_workflow(workflow: WorkflowCreate, current_user = Depends(get_current_user)):
    """Create a workflow."""
    workflow_dict = workflow.model_dump()
    created = insert_workflow(workflow_dict, created_by=current_user.get("user_id"))
    return {"success": True, "workflow_id": created["id"], "data": created}


@router.put("/{workflow_id}")
async def update_workflow_route(workflow_id: str, data: WorkflowUpdate, current_user = Depends(get_current_user)):
    """Update workflow (full update)."""
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    updated = update_workflow(workflow_id, update_dict, updated_by=current_user.get("user_id"))
    if not updated:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"success": True, "workflow": updated}


@router.patch("/{workflow_id}")
async def patch_workflow_route(workflow_id: str, data: WorkflowUpdate, current_user = Depends(get_current_user)):
    """Partial update workflow."""
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    updated = update_workflow(workflow_id, update_dict, updated_by=current_user.get("user_id"))
    if not updated:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"success": True, "workflow": updated}


@router.delete("/{workflow_id}")
async def delete_workflow_route(workflow_id: str, current_user = Depends(get_current_user)):
    """Delete workflow."""
    success = delete_workflow(workflow_id, deleted_by=current_user.get("user_id"))
    if not success:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"success": True, "message": "Workflow deleted"}

