from typing import Optional
from datetime import datetime

class User:
    """User model from Supabase"""
    
    @staticmethod
    def get_by_id(db, user_id: str) -> dict:
        """Get user by ID"""
        return db.table("users").select("*").eq("id", user_id).single().execute().data
    
    @staticmethod
    def get_by_email(db, email: str) -> Optional[dict]:
        """Get user by email"""
        result = db.table("users").select("*").eq("email", email).execute()
        return result.data if result.data else None
    
    @staticmethod
    def create(db, user_data: dict) -> dict:
        """Create new user"""
        return db.table("users").insert(user_data).execute().data
    
    @staticmethod
    def update(db, user_id: str, user_data: dict) -> dict:
        """Update user"""
        return db.table("users").update(user_data).eq("id", user_id).execute().data
