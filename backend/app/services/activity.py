from app.models.activity_log import ActivityLog

def log_activity(db, org_id: str, user_id: str, activity_type: str, description: str):
    return ActivityLog.log(db, org_id, user_id, activity_type, description)

def get_activity_logs(db, org_id: str, limit: int = 100):
    return ActivityLog.list_by_org(db, org_id, limit)
