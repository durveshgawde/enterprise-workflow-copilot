class Organization:
    """Organization model"""
    
    @staticmethod
    def get_by_id(db, org_id: str) -> dict:
        """Get organization by ID"""
        return db.table("organizations").select("*").eq("id", org_id).single().execute().data
    
    @staticmethod
    def list_by_user(db, user_id: str) -> list:
        """List organizations for a user"""
        return db.table("organizations").select("*").eq("owner_id", user_id).execute().data
    
    @staticmethod
    def create(db, org_data: dict) -> dict:
        """Create organization"""
        return db.table("organizations").insert(org_data).execute().data
    
    @staticmethod
    def add_member(db, org_id: str, user_id: str, role: str = "member") -> dict:
        """Add member to organization"""
        member_data = {
            "organization_id": org_id,
            "user_id": user_id,
            "role": role
        }
        return db.table("organization_members").insert(member_data).execute().data
