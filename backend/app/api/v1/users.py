from fastapi import APIRouter, Depends, HTTPException
from app.utils.jwt import get_current_user
from app.services.supabase_db import get_user, upsert_user

router = APIRouter()


@router.get("/me")
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Return the current user from the JWT."""
    user_id = current_user["user_id"]
    
    # Try to get existing user data from in-memory store
    user = get_user(user_id)
    
    if user:
        return {
            "success": True,
            "user_id": user_id,
            "email": current_user.get("email"),
            "name": user.get("name"),
            "avatar_url": user.get("avatar_url"),
            "phone": user.get("phone"),
            "created_at": user.get("created_at"),
            "updated_at": user.get("updated_at"),
        }
    
    return {
        "success": True,
        "user_id": user_id,
        "email": current_user.get("email"),
    }


@router.get("/{user_id}")
async def get_user_by_id(user_id: str, current_user = Depends(get_current_user)):
    """Get user by ID."""
    user = get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "success": True,
        "user_id": user_id,
        "name": user.get("name"),
        "avatar_url": user.get("avatar_url"),
    }


@router.put("/me")
async def update_current_user(data: dict, current_user = Depends(get_current_user)):
    """Update current user's profile."""
    user_id = current_user["user_id"]
    
    # Merge with email from JWT
    data["email"] = current_user.get("email")
    
    user = upsert_user(user_id, data)
    
    return {
        "success": True,
        "user_id": user_id,
        "email": user.get("email"),
        "name": user.get("name"),
        "avatar_url": user.get("avatar_url"),
        "phone": user.get("phone"),
        "updated_at": user.get("updated_at"),
    }
