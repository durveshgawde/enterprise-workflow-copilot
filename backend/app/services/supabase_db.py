"""
Supabase Database Service

This module provides database operations using Supabase as the backend.
It replaces the in-memory storage with persistent Supabase storage.

Set USE_SUPABASE=True in .env to enable Supabase, otherwise uses in-memory storage.
"""

import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from app.utils.supabase import sb_select, sb_insert, sb_update, sb_delete
from app.config import settings

# Load environment variables (config.py already does this, but being explicit)
load_dotenv()

# Toggle between Supabase and in-memory storage
USE_SUPABASE = os.getenv("USE_SUPABASE", "true").lower() == "true"

def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


# ========== WORKFLOWS ==========

def insert_workflow(data: dict, created_by: Optional[str] = None) -> dict:
    """Create a new workflow."""
    # Get organization_id (allow None if not provided)
    org_id = data.get("organization_id") or data.get("org_id") or None
    
    payload = {
        "title":data.get("title"),
        "description": data.get("description", ""),
        "status": data.get("status", "draft"),
        "organization_id": org_id,
        "created_by": None,  # Temporarily disable FK check - user may not exist in users table
    }
    
    try:
        rows = sb_insert("workflows", payload)
        workflow = rows[0] if rows else None
        
        # Log activity
        if workflow:
            log_activity(
                organization_id=workflow.get("organization_id"),
                workflow_id=workflow.get("id"),
                user_id=created_by,
                entity_type="workflow",
                entity_id=workflow.get("id"),
                action="created",
                details=f"Created workflow '{workflow.get('title')}'"
            )
        
        return workflow
    except Exception as e:
        print(f"[DB] Error inserting workflow: {e}")
        raise


def get_workflow(workflow_id: str) -> Optional[dict]:
    """Get a workflow by ID."""
    try:
        rows = sb_select("workflows", {"id": f"eq.{workflow_id}"})
        workflow = rows[0] if rows else None
        
        if workflow:
            # Get steps for this workflow
            workflow["steps"] = list_steps(workflow_id)
            workflow["step_count"] = len(workflow["steps"])
        
        return workflow
    except Exception as e:
        print(f"[DB] Error getting workflow: {e}")
        return None


def list_workflows(org_id: Optional[str] = None) -> List[dict]:
    """List all workflows, optionally filtered by org_id."""
    try:
        params = {}
        if org_id and org_id.strip():
            params["organization_id"] = f"eq.{org_id}"
        
        params["order"] = "updated_at.desc"
        rows = sb_select("workflows", params)
        
        # Add step count to each workflow
        for wf in rows:
            steps = list_steps(wf["id"])
            wf["step_count"] = len(steps)
            wf["steps"] = steps
        
        return rows
    except Exception as e:
        print(f"[DB] Error listing workflows: {e}")
        return []


def update_workflow(workflow_id: str, data: dict, updated_by: Optional[str] = None) -> Optional[dict]:
    """Update a workflow."""
    try:
        payload = {"updated_at": _now_iso()}
        
        if "title" in data:
            payload["title"] = data["title"]
        if "description" in data:
            payload["description"] = data["description"]
        if "status" in data:
            payload["status"] = data["status"]
        
        rows = sb_update("workflows", {"id": workflow_id}, payload)
        workflow = rows[0] if rows else None
        
        if workflow:
            log_activity(
                organization_id=workflow.get("organization_id"),
                workflow_id=workflow_id,
                user_id=updated_by,
                entity_type="workflow",
                entity_id=workflow_id,
                action="updated",
                details=f"Updated workflow '{workflow.get('title')}'"
            )
        
        return workflow
    except Exception as e:
        print(f"[DB] Error updating workflow: {e}")
        return None


def delete_workflow(workflow_id: str, deleted_by: Optional[str] = None) -> bool:
    """Delete a workflow and its related data."""
    try:
        # Get workflow for logging
        workflow = get_workflow(workflow_id)
        
        # Delete related data first (cascade should handle this, but be safe)
        sb_delete("comments", {"workflow_id": workflow_id})
        sb_delete("workflow_steps", {"workflow_id": workflow_id})
        sb_delete("workflows", {"id": workflow_id})
        
        if workflow:
            log_activity(
                organization_id=workflow.get("organization_id"),
                workflow_id=None,
                user_id=deleted_by,
                entity_type="workflow",
                entity_id=workflow_id,
                action="deleted",
                details=f"Deleted workflow '{workflow.get('title')}'"
            )
        
        return True
    except Exception as e:
        print(f"[DB] Error deleting workflow: {e}")
        return False


# ========== STEPS ==========

def insert_step(data: dict, created_by: Optional[str] = None) -> dict:
    """Create a new step."""
    payload = {
        "workflow_id": data.get("workflow_id"),
        "title": data.get("title"),
        "description": data.get("description", ""),
        "status": data.get("status", "pending"),
        "assigned_to": data.get("assigned_to"),
        "order": data.get("order", 0),
    }
    
    try:
        rows = sb_insert("workflow_steps", payload)
        step = rows[0] if rows else None
        
        if step:
            log_activity(
                workflow_id=step.get("workflow_id"),
                user_id=created_by,
                entity_type="step",
                entity_id=step.get("id"),
                action="created",
                details=f"Created step '{step.get('title')}'"
            )
        
        return step
    except Exception as e:
        print(f"[DB] Error inserting step: {e}")
        raise


def get_step(step_id: str) -> Optional[dict]:
    """Get a step by ID."""
    try:
        rows = sb_select("workflow_steps", {"id": f"eq.{step_id}"})
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error getting step: {e}")
        return None


def list_steps(workflow_id: str) -> List[dict]:
    """List all steps for a workflow."""
    try:
        params = {
            "workflow_id": f"eq.{workflow_id}",
            "order": "order.asc"
        }
        return sb_select("workflow_steps", params)
    except Exception as e:
        print(f"[DB] Error listing steps: {e}")
        return []


def update_step(step_id: str, data: dict, updated_by: Optional[str] = None) -> Optional[dict]:
    """Update a step."""
    try:
        payload = {"updated_at": _now_iso()}
        
        if "title" in data:
            payload["title"] = data["title"]
        if "description" in data:
            payload["description"] = data["description"]
        if "status" in data:
            payload["status"] = data["status"]
        if "assigned_to" in data:
            payload["assigned_to"] = data["assigned_to"]
        if "order" in data:
            payload["order"] = data["order"]
        
        rows = sb_update("workflow_steps", {"id": step_id}, payload)
        step = rows[0] if rows else None
        
        if step:
            log_activity(
                workflow_id=step.get("workflow_id"),
                user_id=updated_by,
                entity_type="step",
                entity_id=step_id,
                action="updated",
                details=f"Updated step '{step.get('title')}'"
            )
        
        return step
    except Exception as e:
        print(f"[DB] Error updating step: {e}")
        return None


def delete_step(step_id: str, deleted_by: Optional[str] = None) -> bool:
    """Delete a step."""
    try:
        step = get_step(step_id)
        sb_delete("workflow_steps", {"id": step_id})
        
        if step:
            log_activity(
                workflow_id=step.get("workflow_id"),
                user_id=deleted_by,
                entity_type="step",
                entity_id=step_id,
                action="deleted",
                details=f"Deleted step '{step.get('title')}'"
            )
        
        return True
    except Exception as e:
        print(f"[DB] Error deleting step: {e}")
        return False


# ========== COMMENTS ==========

def insert_comment(data: dict, created_by: Optional[str] = None) -> dict:
    """Create a new comment."""
    payload = {
        "workflow_id": data.get("workflow_id"),
        "step_id": data.get("step_id"),
        "user_id": created_by,
        "content": data.get("content"),
    }
    
    try:
        rows = sb_insert("comments", payload)
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error inserting comment: {e}")
        raise


def list_comments(workflow_id: Optional[str] = None, step_id: Optional[str] = None) -> List[dict]:
    """List comments for a workflow or step."""
    try:
        params = {"order": "created_at.desc"}
        
        if workflow_id:
            params["workflow_id"] = f"eq.{workflow_id}"
        if step_id:
            params["step_id"] = f"eq.{step_id}"
        
        return sb_select("comments", params)
    except Exception as e:
        print(f"[DB] Error listing comments: {e}")
        return []


def update_comment(comment_id: str, data: dict) -> Optional[dict]:
    """Update a comment."""
    try:
        payload = {
            "content": data.get("content"),
            "updated_at": _now_iso()
        }
        rows = sb_update("comments", {"id": comment_id}, payload)
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error updating comment: {e}")
        return None


def delete_comment(comment_id: str) -> bool:
    """Delete a comment."""
    try:
        sb_delete("comments", {"id": comment_id})
        return True
    except Exception as e:
        print(f"[DB] Error deleting comment: {e}")
        return False


def get_comment(comment_id: str) -> Optional[dict]:
    """Get a comment by ID."""
    try:
        rows = sb_select("comments", {"id": f"eq.{comment_id}"})
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error getting comment: {e}")
        return None


# ========== ACTIVITY LOGS ==========

def log_activity(
    organization_id: Optional[str] = None,
    workflow_id: Optional[str] = None,
    user_id: Optional[str] = None,
    entity_type: str = "workflow",
    entity_id: Optional[str] = None,
    action: str = "created",
    details: Optional[str] = None
) -> None:
    """Log an activity."""
    try:
        payload = {
            "organization_id": organization_id,
            "workflow_id": workflow_id,
            "user_id": user_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "action": action,
            "details": details,
        }
        sb_insert("activity_logs", payload)
    except Exception as e:
        print(f"[DB] Error logging activity: {e}")


def list_activities(
    org_id: Optional[str] = None,
    workflow_id: Optional[str] = None,
    user_id: Optional[str] = None
) -> List[dict]:
    """List activity logs."""
    try:
        params = {"order": "created_at.desc"}
        
        if org_id and org_id.strip():
            params["organization_id"] = f"eq.{org_id}"
        if workflow_id:
            params["workflow_id"] = f"eq.{workflow_id}"
        if user_id:
            params["user_id"] = f"eq.{user_id}"
        
        return sb_select("activity_logs", params)
    except Exception as e:
        print(f"[DB] Error listing activities: {e}")
        return []


# ========== ORGANIZATIONS ==========

def list_organizations(user_id: Optional[str] = None) -> List[dict]:
    """List organizations."""
    try:
        return sb_select("organizations", {"order": "created_at.desc"})
    except Exception as e:
        print(f"[DB] Error listing organizations: {e}")
        return []


def get_organization(org_id: str) -> Optional[dict]:
    """Get an organization by ID."""
    try:
        rows = sb_select("organizations", {"id": f"eq.{org_id}"})
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error getting organization: {e}")
        return None


def insert_organization(data: dict, created_by: Optional[str] = None) -> dict:
    """Create a new organization."""
    try:
        payload = {
            "name": data.get("name"),
            "description": data.get("description", ""),
            "created_by": created_by,
        }
        rows = sb_insert("organizations", payload)
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error inserting organization: {e}")
        raise


def update_organization(org_id: str, data: dict) -> Optional[dict]:
    """Update an organization."""
    try:
        payload = {"updated_at": _now_iso()}
        if "name" in data:
            payload["name"] = data["name"]
        if "description" in data:
            payload["description"] = data["description"]
        
        rows = sb_update("organizations", {"id": org_id}, payload)
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error updating organization: {e}")
        return None


# ========== USERS ==========

def get_user(user_id: str) -> Optional[dict]:
    """Get a user by ID."""
    try:
        rows = sb_select("users", {"id": f"eq.{user_id}"})
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error getting user: {e}")
        return None


def upsert_user(user_id: str, data: dict) -> Optional[dict]:
    """Create or update a user."""
    try:
        existing = get_user(user_id)
        
        if existing:
            payload = {"updated_at": _now_iso()}
            if "name" in data:
                payload["name"] = data["name"]
            if "email" in data:
                payload["email"] = data["email"]
            if "avatar_url" in data:
                payload["avatar_url"] = data["avatar_url"]
            if "phone" in data:
                payload["phone"] = data["phone"]
            
            rows = sb_update("users", {"id": user_id}, payload)
            return rows[0] if rows else existing
        else:
            payload = {
                "id": user_id,
                "email": data.get("email", ""),
                "name": data.get("name", ""),
                "avatar_url": data.get("avatar_url"),
                "phone": data.get("phone"),
            }
            rows = sb_insert("users", payload)
            return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error upserting user: {e}")
        return None


# ========== ORGANIZATION MEMBERS ==========

def get_org_members(org_id: str) -> List[dict]:
    """Get all members of an organization."""
    try:
        rows = sb_select("organization_members", {
            "organization_id": f"eq.{org_id}",
            "order": "joined_at.desc"
        })
        return rows
    except Exception as e:
        print(f"[DB] Error getting org members: {e}")
        return []


def add_org_member(org_id: str, user_id: str, role: str = "member") -> Optional[dict]:
    """Add a member to an organization."""
    try:
        payload = {
            "organization_id": org_id,
            "user_id": user_id,
            "role": role,
        }
        rows = sb_insert("organization_members", payload)
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error adding org member: {e}")
        return None


def remove_org_member(org_id: str, user_id: str) -> bool:
    """Remove a member from an organization."""
    try:
        sb_delete("organization_members", {
            "organization_id": org_id,
            "user_id": user_id
        })
        return True
    except Exception as e:
        print(f"[DB] Error removing org member: {e}")
        return False


def update_member_role(org_id: str, user_id: str, role: str) -> Optional[dict]:
    """Update a member's role in an organization."""
    try:
        rows = sb_update("organization_members", {
            "organization_id": org_id,
            "user_id": user_id
        }, {"role": role})
        return rows[0] if rows else None
    except Exception as e:
        print(f"[DB] Error updating member role: {e}")
        return None

