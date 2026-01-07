class Workflow:
    """Workflow model"""
    
    @staticmethod
    def get_by_id(db, workflow_id: str) -> dict:
        """Get workflow by ID"""
        return db.table("workflows").select("*").eq("id", workflow_id).single().execute().data
    
    @staticmethod
    def list_by_org(db, org_id: str) -> list:
        """List workflows for organization"""
        return db.table("workflows").select("*").eq("organization_id", org_id).execute().data
    
    @staticmethod
    def create(db, workflow_data: dict) -> dict:
        """Create workflow"""
        return db.table("workflows").insert(workflow_data).execute().data
    
    @staticmethod
    def update(db, workflow_id: str, workflow_data: dict) -> dict:
        """Update workflow"""
        return db.table("workflows").update(workflow_data).eq("id", workflow_id).execute().data
