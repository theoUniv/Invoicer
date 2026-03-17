import boto3
import os

s3 = boto3.client(
    "s3",
    endpoint_url="http://72.60.37.180:9000",
    aws_access_key_id="minioadmin",
    aws_secret_access_key="minioadmin123"
)

BUCKET_NAME = "raw"


def upload_file(file_path):

    file_name = os.path.basename(file_path)

    s3.upload_file(file_path, BUCKET_NAME, f"invoices/{file_name}")

    return file_name


if __name__ == "__main__":

    file_path = "facture-test-2.pdf"

    result = upload_file(file_path)

    print(f"{result} uploaded to raw bucket")