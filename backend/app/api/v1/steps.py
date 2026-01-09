from fastapi import APIRouter, Depends, HTTPException
from app.utils.jwt import get_current_user
from typing import Optional
from pydantic import BaseModel
from app.services.supabase_db import (
    insert_step, get_step, list_steps,
    update_step, delete_step, get_workflow
)

router = APIRouter()


class StepStatusUpdate(BaseModel):
    status: str


@router.get("/")
async def list_steps_route(workflow_id: Optional[str] = None, current_user = Depends(get_current_user)):
    """List steps for a workflow."""
    return {"success": True, "workflow_id": workflow_id, "steps": list_steps(workflow_id)}


@router.post("/")
async def create_step(payload: dict, current_user = Depends(get_current_user)):
    """Create a step for a workflow."""
    workflow_id = payload.get("workflow_id")
    if not workflow_id:
        raise HTTPException(status_code=400, detail="workflow_id is required")
    
    wf = get_workflow(workflow_id)
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    if not payload.get("title"):
        raise HTTPException(status_code=400, detail="Step title is required")
    
    # Include workflow_id in the step data
    step_data = {
        "workflow_id": workflow_id,
        "title": payload.get("title"),
        "description": payload.get("description", ""),
        "status": payload.get("status", "pending"),
        "order": payload.get("step_order") or payload.get("order", 0),
    }
    
    step = insert_step(step_data, created_by=current_user.get("user_id"))
    return {"success": True, "step": step}


@router.get("/{step_id}")
async def get_step_route(step_id: str, current_user = Depends(get_current_user)):
    """Get a single step."""
    step = get_step(step_id)
    if not step:
        raise HTTPException(status_code=404, detail="Step not found")
    return {"success": True, "step": step}


@router.put("/{step_id}")
async def update_step_route(step_id: str, data: dict, current_user = Depends(get_current_user)):
    """Update step (full update)."""
    updated = update_step(step_id, data, updated_by=current_user.get("user_id"))
    if not updated:
        raise HTTPException(status_code=404, detail="Step not found")
    return {"success": True, "step": updated}


@router.patch("/{step_id}")
async def patch_step_route(step_id: str, data: dict, current_user = Depends(get_current_user)):
    """Partial update step."""
    updated = update_step(step_id, data, updated_by=current_user.get("user_id"))
    if not updated:
        raise HTTPException(status_code=404, detail="Step not found")
    return {"success": True, "step": updated}


@router.patch("/{step_id}/status")
async def update_step_status_route(
    step_id: str,
    payload: StepStatusUpdate,
    current_user = Depends(get_current_user),
):
    """Update step status."""
    updated = update_step(step_id, {"status": payload.status}, updated_by=current_user.get("user_id"))
    if not updated:
        raise HTTPException(status_code=404, detail="Step not found")
    return {"success": True, "step": updated}


@router.delete("/{step_id}")
async def delete_step_route(step_id: str, current_user = Depends(get_current_user)):
    """Delete step."""
    success = delete_step(step_id, deleted_by=current_user.get("user_id"))
    if not success:
        raise HTTPException(status_code=404, detail="Step not found")
    return {"success": True, "message": "Step deleted"}
