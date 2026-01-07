from app.models.organization import Organization as OrgModel

def get_organization(db, org_id: str):
    return OrgModel.get_by_id(db, org_id)

def list_organizations(db, user_id: str):
    return OrgModel.list_by_user(db, user_id)

def create_organization(db, org_data: dict):
    return OrgModel.create(db, org_data)
