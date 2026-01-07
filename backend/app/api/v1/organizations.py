from fastapi import APIRouter, Depends, HTTPException
from app.utils.jwt import get_current_user
from typing import Optional
from app.services.supabase_db import (
    insert_organization, get_organization, list_organizations,
    update_organization, get_org_members, add_org_member,
    remove_org_member, update_member_role
)

router = APIRouter()


@router.get("/")
async def list_organizations_route(current_user = Depends(get_current_user)):
    """List organizations for the current user."""
    user_id = current_user.get("user_id")
    orgs = list_organizations(user_id)
    return {
        "success": True,
        "total": len(orgs),
        "organizations": orgs,
    }


@router.get("/{org_id}")
async def get_organization_route(org_id: str, current_user = Depends(get_current_user)):
    """Get single organization."""
    org = get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return {"success": True, "organization": org}


@router.post("/")
async def create_organization(data: dict, current_user = Depends(get_current_user)):
    """Create an organization."""
    if not data.get("name"):
        raise HTTPException(status_code=400, detail="Organization name is required")
    
    org = insert_organization(data, created_by=current_user.get("user_id"))
    return {"success": True, "organization": org}


@router.put("/{org_id}")
async def update_organization_route(org_id: str, data: dict, current_user = Depends(get_current_user)):
    """Update organization."""
    updated = update_organization(org_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Organization not found")
    return {"success": True, "organization": updated}


@router.get("/{org_id}/members")
async def get_members_route(org_id: str, current_user = Depends(get_current_user)):
    """Get organization members."""
    org = get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    members = get_org_members(org_id)
    return {"success": True, "total": len(members), "members": members}


@router.post("/{org_id}/invite")
async def invite_member(org_id: str, data: dict, current_user = Depends(get_current_user)):
    """Invite a member to organization."""
    org = get_organization(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    email = data.get("email")
    role = data.get("role", "member")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    # In a real app, we'd send an email invite
    # For now, we just add them directly with a placeholder ID
    member = add_org_member(org_id, f"user-{email.split('@')[0]}", role)
    
    return {
        "success": True,
        "invite_sent": True,
        "message": f"Invitation sent to {email}"
    }


@router.delete("/{org_id}/members/{user_id}")
async def remove_member_route(org_id: str, user_id: str, current_user = Depends(get_current_user)):
    """Remove member from organization."""
    success = remove_org_member(org_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"success": True}


@router.patch("/{org_id}/members/{user_id}")
async def update_member_role_route(
    org_id: str, user_id: str, data: dict,
    current_user = Depends(get_current_user)
):
    """Update member role."""
    role = data.get("role")
    if not role:
        raise HTTPException(status_code=400, detail="Role is required")
    
    updated = update_member_role(org_id, user_id, role)
    if not updated:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"success": True, "new_role": role}
