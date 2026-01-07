from app.utils.aws import upload_file_to_s3, delete_file_from_s3

def save_file(file_name: str, file_content: bytes):
    return upload_file_to_s3(file_name, file_content)

def delete_file(file_name: str):
    return delete_file_from_s3(file_name)
