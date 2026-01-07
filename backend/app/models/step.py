class Step:
    """Workflow step model"""
    
    @staticmethod
    def get_by_id(db, step_id: str) -> dict:
        """Get step by ID"""
        return db.table("workflow_steps").select("*").eq("id", step_id).single().execute().data
    
    @staticmethod
    def list_by_workflow(db, workflow_id: str) -> list:
        """List steps in workflow"""
        return db.table("workflow_steps").select("*").eq("workflow_id", workflow_id).order("order").execute().data
    
    @staticmethod
    def create(db, step_data: dict) -> dict:
        """Create step"""
        return db.table("workflow_steps").insert(step_data).execute().data
    
    @staticmethod
    def update_status(db, step_id: str, status: str) -> dict:
        """Update step status"""
        return db.table("workflow_steps").update({"status": status}).eq("id", step_id).execute().data
