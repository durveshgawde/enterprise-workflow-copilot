from fastapi import APIRouter, Depends, HTTPException
from app.utils.jwt import get_current_user
from typing import Optional
from pydantic import BaseModel
from app.services.supabase_db import (
    insert_comment, list_comments, update_comment, delete_comment, get_comment, get_workflow
)

router = APIRouter()


@router.get("/")
async def list_comments_route(
    workflow_id: Optional[str] = None,
    step_id: Optional[str] = None,
    current_user = Depends(get_current_user)
):
    """List comments for a workflow or step."""
    return {
        "success": True,
        "workflow_id": workflow_id,
        "step_id": step_id,
        "comments": list_comments(workflow_id, step_id)
    }


@router.get("/step/{step_id}")
async def list_comments_for_step(step_id: str, current_user = Depends(get_current_user)):
    """List comments for a step."""
    return {"success": True, "step_id": step_id, "comments": list_comments(None, step_id)}


@router.post("/")
async def create_comment(comment: dict, current_user = Depends(get_current_user)):
    """Create a comment."""
    workflow_id = comment.get("workflow_id")
    if workflow_id:
        wf = get_workflow(workflow_id)
        if not wf:
            raise HTTPException(status_code=404, detail="Workflow not found")
    
    if not comment.get("content"):
        raise HTTPException(status_code=400, detail="Comment content is required")
    
    created = insert_comment(comment, created_by=current_user.get("user_id"))
    return {"success": True, "comment_id": created["id"], "data": created}


@router.put("/{comment_id}")
async def update_comment_route(comment_id: str, data: dict, current_user = Depends(get_current_user)):
    """Update comment."""
    comment = get_comment(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only owner can update
    if comment.get("created_by") != current_user.get("user_id"):
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    updated = update_comment(comment_id, data, updated_by=current_user.get("user_id"))
    return {"success": True, "comment": updated}


@router.delete("/{comment_id}")
async def delete_comment_route(comment_id: str, current_user = Depends(get_current_user)):
    """Delete comment."""
    comment = get_comment(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Only owner can delete
    if comment.get("created_by") != current_user.get("user_id"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    success = delete_comment(comment_id, deleted_by=current_user.get("user_id"))
    return {"success": True, "message": "Comment deleted"}
