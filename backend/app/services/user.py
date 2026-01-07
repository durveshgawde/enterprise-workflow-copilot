from app.models.user import User as UserModel

def get_user(db, user_id: str):
    return UserModel.get_by_id(db, user_id)

def get_user_by_email(db, email: str):
    return UserModel.get_by_email(db, email)

def create_user(db, user_data: dict):
    return UserModel.create(db, user_data)
