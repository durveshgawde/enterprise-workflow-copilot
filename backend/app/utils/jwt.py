from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from fastapi.security.http import HTTPAuthorizationCredentials

import jwt

security = HTTPBearer(auto_error=False)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate JWT and extract user info, auto-create user in database if needed"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, options={"verify_signature": False})
        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user_id",
            )

        # Auto-create user in database if they don't exist
        try:
            from app.services.supabase_db import get_user, upsert_user
            existing_user = get_user(user_id)
            if not existing_user and email:
                upsert_user(user_id, {"email": email})
        except Exception as e:
            # Don't fail the request if user creation fails, just log it
            print(f"[JWT] Warning: Could not auto-create user: {e}")

        return {
            "user_id": user_id,
            "email": email,
            "raw_token": token,
        }

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
        )
