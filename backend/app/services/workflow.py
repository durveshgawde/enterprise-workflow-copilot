from app.models.workflow import Workflow as WorkflowModel

def get_workflow(db, workflow_id: str):
    return WorkflowModel.get_by_id(db, workflow_id)

def list_workflows(db, org_id: str):
    return WorkflowModel.list_by_org(db, org_id)

def create_workflow(db, workflow_data: dict):
    return WorkflowModel.create(db, workflow_data)

def update_workflow(db, workflow_id: str, workflow_data: dict):
    return WorkflowModel.update(db, workflow_id, workflow_data)
