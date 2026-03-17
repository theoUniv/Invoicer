from dotenv import load_dotenv
import os
import boto3

load_dotenv()

endpoint = f"http://72.60.37.180:{os.getenv('MINIO_PORT')}"

s3 = boto3.client(
    "s3",
    endpoint_url=endpoint,
    aws_access_key_id=os.getenv("MINIO_ROOT_USER"),
    aws_secret_access_key=os.getenv("MINIO_ROOT_PASSWORD")
)

BUCKET_NAME = "raw"


def upload_file(file_path):

    file_name = os.path.basename(file_path)

    s3.upload_file(file_path, BUCKET_NAME, f"invoices/{file_name}")

    return file_name
