class Comment:
    """Comment model"""
    
    @staticmethod
    def create(db, comment_data: dict) -> dict:
        """Create comment"""
        return db.table("step_comments").insert(comment_data).execute().data
    
    @staticmethod
    def list_by_step(db, step_id: str) -> list:
        """List comments on step"""
        return db.table("step_comments").select("*").eq("step_id", step_id).order("created_at", desc=True).execute().data

