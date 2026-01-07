from datetime import datetime

class ActivityLog:
    """Activity log model"""
    
    @staticmethod
    def log(db, org_id: str, user_id: str, activity_type: str, description: str) -> dict:
        """Log activity"""
        activity_data = {
            "organization_id": org_id,
            "user_id": user_id,
            "activity_type": activity_type,
            "description": description,
            "timestamp": datetime.utcnow().isoformat()
        }
        return db.table("activity_logs").insert(activity_data).execute().data
    
    @staticmethod
    def list_by_org(db, org_id: str, limit: int = 100) -> list:
        """List activities for organization"""
        return db.table("activity_logs").select("*").eq("organization_id", org_id).order("timestamp", desc=True).limit(limit).execute().data
