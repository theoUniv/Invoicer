import os
from minio import Minio
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    endpoint = os.getenv('MINIO_ENDPOINT').replace('http://', '').replace('https://', '')
    access_key = os.getenv('MINIO_ROOT_USER')
    secret_key = os.getenv('MINIO_ROOT_PASSWORD')
    secure = os.getenv('MINIO_SECURE').lower() == 'true'

    print(f"Connecting to {endpoint} (secure={secure})...")
    client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)

    try:
        buckets = client.list_buckets()
        print("Successfully connected to MinIO!")
        print("Available buckets:")
        for bucket in buckets:
            print(f"- {bucket.name}")
            
        if client.bucket_exists("raw"):
            print("\nObjects in 'raw/invoices/':")
            objects = client.list_objects("raw", prefix="invoices/", recursive=True)
            for obj in objects:
                print(f"- {obj.object_name}")
        else:
            print("\nBucket 'raw' does not exist.")
            
    except Exception as e:
        print(f"Error connecting to MinIO: {e}")

if __name__ == "__main__":
    test_connection()
