from typing import Dict, List, Optional
import time
import uuid

# Simple in-memory store used for development/testing only
workflows: Dict[str, dict] = {}
steps: Dict[str, dict] = {}
comments: Dict[str, dict] = {}
activities: List[dict] = []
organizations: Dict[str, dict] = {}
org_members: Dict[str, List[dict]] = {}  # org_id -> list of members
users: Dict[str, dict] = {}


def _now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


# ============ WORKFLOWS ============

def insert_workflow(data: dict, created_by: Optional[str] = None) -> dict:
    wid = data.get("id") or f"wf-{uuid.uuid4().hex[:8]}"
    wf = {
        "id": wid,
        "title": data.get("title"),
        "description": data.get("description"),
        "organization_id": data.get("organization_id"),
        "created_by": created_by,
        "status": data.get("status", "active"),
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
        "steps": [],
    }
    workflows[wid] = wf
    activities.append({
        "id": f"act-{uuid.uuid4().hex[:8]}",
        "organization_id": wf.get("organization_id"),
        "user_id": created_by,
        "entity_type": "workflow",
        "entity_id": wid,
        "action": "created",
        "details": f"Created workflow '{wf.get('title')}'",
        "created_at": _now_iso(),
    })
    return wf


def get_workflow(wid: str) -> Optional[dict]:
    return workflows.get(wid)


def list_workflows(org_id: Optional[str] = None) -> List[dict]:
    # Treat empty string as no filter (return all workflows)
    if org_id is None or org_id == "" or org_id.strip() == "":
        result = list(workflows.values())
    else:
        result = [w for w in workflows.values() if w.get("organization_id") == org_id]
    # Add step_count to each workflow
    for wf in result:
        wf["step_count"] = len([s for s in steps.values() if s.get("workflow_id") == wf["id"]])
    return sorted(result, key=lambda w: w.get("updated_at", ""), reverse=True)


def update_workflow(wid: str, data: dict, updated_by: Optional[str] = None) -> Optional[dict]:
    wf = workflows.get(wid)
    if not wf:
        return None
    
    if "title" in data:
        wf["title"] = data["title"]
    if "description" in data:
        wf["description"] = data["description"]
    if "status" in data:
        wf["status"] = data["status"]
    wf["updated_at"] = _now_iso()
    
    activities.append({
        "id": f"act-{uuid.uuid4().hex[:8]}",
        "organization_id": wf.get("organization_id"),
        "user_id": updated_by,
        "entity_type": "workflow",
        "entity_id": wid,
        "action": "updated",
        "details": f"Updated workflow '{wf.get('title')}'",
        "created_at": _now_iso(),
    })
    return wf


def delete_workflow(wid: str, deleted_by: Optional[str] = None) -> bool:
    wf = workflows.get(wid)
    if not wf:
        return False
    
    # Delete associated steps
    step_ids_to_delete = [s["id"] for s in steps.values() if s.get("workflow_id") == wid]
    for sid in step_ids_to_delete:
        del steps[sid]
    
    # Delete associated comments
    comment_ids_to_delete = [c["id"] for c in comments.values() if c.get("workflow_id") == wid]
    for cid in comment_ids_to_delete:
        del comments[cid]
    
    activities.append({
        "id": f"act-{uuid.uuid4().hex[:8]}",
        "organization_id": wf.get("organization_id"),
        "user_id": deleted_by,
        "entity_type": "workflow",
        "entity_id": wid,
        "action": "deleted",
        "details": f"Deleted workflow '{wf.get('title')}'",
        "created_at": _now_iso(),
    })
    
    del workflows[wid]
    return True


# ============ STEPS ============

def insert_step(workflow_id: str, data: dict, created_by: Optional[str] = None) -> dict:
    sid = data.get("id") or f"step-{uuid.uuid4().hex[:8]}"
    existing_steps = [s for s in steps.values() if s.get("workflow_id") == workflow_id]
    step = {
        "id": sid,
        "workflow_id": workflow_id,
        "title": data.get("title"),
        "description": data.get("description"),
        "step_order": data.get("order") if data.get("order") is not None else len(existing_steps),
        "status": data.get("status", "pending"),
        "assigned_to": data.get("assigned_to"),
        "role": data.get("role"),
        "context_url": data.get("context_url"),
        "context_text": data.get("context_text"),
        "completed_at": None,
        "completed_by": None,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    steps[sid] = step
    
    # Attach step to workflow
    wf = workflows.get(workflow_id)
    if wf is not None:
        wf_steps = wf.get("steps") or []
        wf_steps.append(step)
        wf["steps"] = wf_steps

    activities.append({
        "id": f"act-{uuid.uuid4().hex[:8]}",
        "organization_id": wf.get("organization_id") if wf else None,
        "user_id": created_by,
        "workflow_id": workflow_id,
        "entity_type": "step",
        "entity_id": sid,
        "action": "created",
        "details": f"Added step '{step.get('title')}'",
        "created_at": _now_iso(),
    })

    return step


def get_step(step_id: str) -> Optional[dict]:
    return steps.get(step_id)


def list_steps(workflow_id: Optional[str] = None) -> List[dict]:
    result = [s for s in steps.values() if workflow_id is None or s.get("workflow_id") == workflow_id]
    return sorted(result, key=lambda s: s.get("step_order", 0))


def update_step(step_id: str, data: dict, updated_by: Optional[str] = None) -> Optional[dict]:
    s = steps.get(step_id)
    if not s:
        return None
    
    if "title" in data:
        s["title"] = data["title"]
    if "description" in data:
        s["description"] = data["description"]
    if "status" in data:
        s["status"] = data["status"]
    if "assigned_to" in data:
        s["assigned_to"] = data["assigned_to"]
    if "order" in data:
        s["step_order"] = data["order"]
    s["updated_at"] = _now_iso()
    
    wf = workflows.get(s.get("workflow_id", ""))
    activities.append({
        "id": f"act-{uuid.uuid4().hex[:8]}",
        "organization_id": wf.get("organization_id") if wf else None,
        "user_id": updated_by,
        "workflow_id": s.get("workflow_id"),
        "entity_type": "step",
        "entity_id": step_id,
        "action": "updated",
        "details": f"Updated step '{s.get('title')}'",
        "created_at": _now_iso(),
    })
    return s


def update_step_status(step_id: str, status: str, completed_by: Optional[str] = None) -> Optional[dict]:
    s = steps.get(step_id)
    if not s:
        return None
    s["status"] = status
    if status == "completed":
        s["completed_at"] = _now_iso()
        s["completed_by"] = completed_by
    s["updated_at"] = _now_iso()

    wf = workflows.get(s.get("workflow_id", ""))
    activities.append({
        "id": f"act-{uuid.uuid4().hex[:8]}",
        "organization_id": wf.get("organization_id") if wf else None,
        "user_id": completed_by,
        "workflow_id": s.get("workflow_id"),
        "entity_type": "step",
        "entity_id": step_id,
        "action": "completed" if status == "completed" else "updated",
        "details": f"Step '{s.get('title')}' marked as {status}",
        "created_at": _now_iso(),
    })

    return s


def delete_step(step_id: str, deleted_by: Optional[str] = None) -> bool:
    s = steps.get(step_id)
    if not s:
        return False
    
    wf = workflows.get(s.get("workflow_id", ""))
    activities.append({
        "id": f"act-{uuid.uuid4().hex[:8]}",
        "organization_id": wf.get("organization_id") if wf else None,
        "user_id": deleted_by,
        "workflow_id": s.get("workflow_id"),
        "entity_type": "step",
        "entity_id": step_id,
        "action": "deleted",
        "details": f"Deleted step '{s.get('title')}'",
        "created_at": _now_iso(),
    })
    
    # Remove from workflow's steps list
    if wf and "steps" in wf:
        wf["steps"] = [step for step in wf["steps"] if step["id"] != step_id]
    
    del steps[step_id]
    return True


# ============ COMMENTS ============

def insert_comment(data: dict, created_by: Optional[str] = None) -> dict:
    cid = f"cmt-{uuid.uuid4().hex[:8]}"
    comment = {
        "id": cid,
        "workflow_id": data.get("workflow_id"),
        "step_id": data.get("step_id"),
        "created_by": created_by,
        "created_by_name": data.get("created_by_name", "User"),
        "content": data.get("content"),
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    comments[cid] = comment

    wf = workflows.get(data.get("workflow_id", ""))
    activities.append({
        "id": f"act-{uuid.uuid4().hex[:8]}",
        "organization_id": wf.get("organization_id") if wf else None,
        "user_id": created_by,
        "workflow_id": data.get("workflow_id"),
        "entity_type": "comment",
        "entity_id": cid,
        "action": "created",
        "details": "Added a comment",
        "created_at": _now_iso(),
    })

    return comment


def get_comment(comment_id: str) -> Optional[dict]:
    return comments.get(comment_id)


def list_comments(workflow_id: Optional[str] = None, step_id: Optional[str] = None) -> List[dict]:
    result = []
    for c in comments.values():
        if workflow_id and c.get("workflow_id") != workflow_id:
            continue
        if step_id and c.get("step_id") != step_id:
            continue
        result.append(c)
    return sorted(result, key=lambda c: c.get("created_at", ""), reverse=True)


def update_comment(comment_id: str, data: dict, updated_by: Optional[str] = None) -> Optional[dict]:
    c = comments.get(comment_id)
    if not c:
        return None
    
    if "content" in data:
        c["content"] = data["content"]
    c["updated_at"] = _now_iso()
    
    return c


def delete_comment(comment_id: str, deleted_by: Optional[str] = None) -> bool:
    c = comments.get(comment_id)
    if not c:
        return False
    
    del comments[comment_id]
    return True


# ============ ORGANIZATIONS ============

def insert_organization(data: dict, created_by: Optional[str] = None) -> dict:
    oid = f"org-{uuid.uuid4().hex[:8]}"
    org = {
        "id": oid,
        "name": data.get("name"),
        "description": data.get("description"),
        "owner_id": created_by,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    }
    organizations[oid] = org
    
    # Add creator as admin member
    if created_by:
        org_members[oid] = [{
            "user_id": created_by,
            "role": "admin",
            "joined_at": _now_iso(),
        }]
    
    return org


def get_organization(org_id: str) -> Optional[dict]:
    org = organizations.get(org_id)
    if org:
        org["member_count"] = len(org_members.get(org_id, []))
        org["workflow_count"] = len([w for w in workflows.values() if w.get("organization_id") == org_id])
    return org


def list_organizations(user_id: Optional[str] = None) -> List[dict]:
    result = []
    for org in organizations.values():
        # If user_id provided, check if user is a member
        if user_id:
            members = org_members.get(org["id"], [])
            is_member = any(m["user_id"] == user_id for m in members)
            if not is_member:
                continue
        org_copy = dict(org)
        org_copy["member_count"] = len(org_members.get(org["id"], []))
        org_copy["workflow_count"] = len([w for w in workflows.values() if w.get("organization_id") == org["id"]])
        result.append(org_copy)
    return result


def update_organization(org_id: str, data: dict) -> Optional[dict]:
    org = organizations.get(org_id)
    if not org:
        return None
    
    if "name" in data:
        org["name"] = data["name"]
    if "description" in data:
        org["description"] = data["description"]
    org["updated_at"] = _now_iso()
    
    return org


def get_org_members(org_id: str) -> List[dict]:
    members = org_members.get(org_id, [])
    # Enrich with user info
    enriched = []
    for m in members:
        user = users.get(m["user_id"], {})
        enriched.append({
            "user_id": m["user_id"],
            "name": user.get("name", "User"),
            "email": user.get("email", ""),
            "role": m["role"],
            "joined_at": m["joined_at"],
        })
    return enriched


def add_org_member(org_id: str, user_id: str, role: str = "member") -> dict:
    if org_id not in org_members:
        org_members[org_id] = []
    
    member = {
        "user_id": user_id,
        "role": role,
        "joined_at": _now_iso(),
    }
    org_members[org_id].append(member)
    return member


def remove_org_member(org_id: str, user_id: str) -> bool:
    if org_id not in org_members:
        return False
    
    original_len = len(org_members[org_id])
    org_members[org_id] = [m for m in org_members[org_id] if m["user_id"] != user_id]
    return len(org_members[org_id]) < original_len


def update_member_role(org_id: str, user_id: str, role: str) -> Optional[dict]:
    if org_id not in org_members:
        return None
    
    for m in org_members[org_id]:
        if m["user_id"] == user_id:
            m["role"] = role
            return m
    return None


# ============ USERS ============

def get_user(user_id: str) -> Optional[dict]:
    return users.get(user_id)


def upsert_user(user_id: str, data: dict) -> dict:
    if user_id in users:
        user = users[user_id]
        if "name" in data:
            user["name"] = data["name"]
        if "email" in data:
            user["email"] = data["email"]
        if "avatar_url" in data:
            user["avatar_url"] = data["avatar_url"]
        if "phone" in data:
            user["phone"] = data["phone"]
        user["updated_at"] = _now_iso()
    else:
        user = {
            "user_id": user_id,
            "email": data.get("email"),
            "name": data.get("name"),
            "avatar_url": data.get("avatar_url"),
            "phone": data.get("phone"),
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        users[user_id] = user
    return user


# ============ ACTIVITY LOGS ============

def list_activities(org_id: Optional[str] = None, workflow_id: Optional[str] = None, user_id: Optional[str] = None) -> List[dict]:
    result = []
    for a in activities:
        if org_id and a.get("organization_id") != org_id:
            continue
        if workflow_id and a.get("workflow_id") != workflow_id and a.get("entity_id") != workflow_id:
            continue
        if user_id and a.get("user_id") != user_id:
            continue
        result.append(a)
    return sorted(result, key=lambda a: a.get("created_at", ""), reverse=True)


# ============ SEED DATA FOR DEVELOPMENT ============

def seed_default_org():
    """Create a default organization for development."""
    if "default-org" not in organizations:
        organizations["default-org"] = {
            "id": "default-org",
            "name": "Default Organization",
            "description": "Default organization for development",
            "owner_id": None,
            "created_at": _now_iso(),
            "updated_at": _now_iso(),
        }
        org_members["default-org"] = []


# Initialize default org
seed_default_org()
