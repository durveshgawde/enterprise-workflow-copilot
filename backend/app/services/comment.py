from app.models.comment import Comment as CommentModel

def create_comment(db, comment_data: dict):
    return CommentModel.create(db, comment_data)

def list_comments(db, step_id: str):
    return CommentModel.list_by_step(db, step_id)
