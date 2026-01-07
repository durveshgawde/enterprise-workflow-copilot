import boto3
from app.config import settings

_s3_client = None

def get_s3_client():
    """Get AWS S3 client"""
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
    return _s3_client

def upload_file_to_s3(file_name: str, file_content: bytes) -> dict:
    """Upload file to AWS S3"""
    try:
        s3 = get_s3_client()
        s3.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=file_name,
            Body=file_content
        )
        return {
            "success": True,
            "url": f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{file_name}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def delete_file_from_s3(file_name: str) -> dict:
    """Delete file from AWS S3"""
    try:
        s3 = get_s3_client()
        s3.delete_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=file_name
        )
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
