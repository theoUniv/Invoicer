import os
import yaml
from pathlib import Path

import boto3
from botocore.client import Config


CONFIG_PATH = Path("config/config.yaml")


def load_config():
    with CONFIG_PATH.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def get_s3_client(minio_cfg):
    # On privilégie les variables d'environnement (passées par Docker/Airflow)
    access_key = os.getenv("MINIO_ROOT_USER", minio_cfg.get("access_key"))
    secret_key = os.getenv("MINIO_ROOT_PASSWORD", minio_cfg.get("secret_key"))
    endpoint = os.getenv("MINIO_ENDPOINT", minio_cfg.get("endpoint"))
    
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=minio_cfg.get("region", "us-east-1"),
        config=Config(
            signature_version="s3v4",
            s3={'addressing_style': 'path'}
        ),
    )


def upload_directory_to_bucket(s3, bucket: str, local_dir: Path, prefix: str = ""):
    if not local_dir.exists():
        print(f"Répertoire local inexistant, ignoré : {local_dir}")
        return

    # S'assurer que le bucket existe
    try:
        s3.head_bucket(Bucket=bucket)
    except:
        print(f"Création du bucket : {bucket}")
        s3.create_bucket(Bucket=bucket)

    for root, _, files in os.walk(local_dir):
        for file in files:
            full_path = Path(root) / file
            relative_path = full_path.relative_to(local_dir)
            key = f"{prefix}/{relative_path}".lstrip("/")

            s3.upload_file(str(full_path), bucket, key)
            print(f"Upload -> bucket={bucket}, key={key}")


import argparse

def main():
    parser = argparse.ArgumentParser(description='Upload invoices to MinIO.')
    parser.add_argument('--file', type=str, help='Specific file to upload (optional).')
    parser.add_argument('--bucket', type=str, choices=['raw', 'clean'], default='raw', help='Target bucket (default: raw).')
    args = parser.parse_args()

    cfg = load_config()
    minio_cfg = cfg["minio"]
    paths = cfg["paths"]

    s3 = get_s3_client(minio_cfg)

    bucket_name = minio_cfg["buckets"][args.bucket]

    if args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"File not found: {file_path}")
            return
        
        try:
            s3.head_bucket(Bucket=bucket_name)
        except:
            print(f"Création du bucket : {bucket_name}")
            s3.create_bucket(Bucket=bucket_name)

        key = f"invoices/{file_path.name}"
        s3.upload_file(str(file_path), bucket_name, key)
        print(f"Uploaded {file_path} to {bucket_name}/{key}")
    else:
        print("Synchronizing directories defined in config...")
        upload_directory_to_bucket(
            s3,
            bucket=minio_cfg["buckets"]["raw"],
            local_dir=Path(paths["raw_invoices"]),
            prefix="invoices",
        )

if __name__ == "__main__":
    main()

