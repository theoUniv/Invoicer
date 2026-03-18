import os
import json
import argparse
import tempfile
import re
import yaml
from pathlib import Path
import boto3
from botocore.client import Config
from minio import Minio
import spacy
import mysql.connector
from ocr_pipeline import extract_text_from_pdf

def load_config():
    """Charge la configuration depuis config.yaml avec une résolution de chemin robuste."""
    possible_paths = [
        Path("config/config.yaml"),
        Path("/opt/airflow/config/config.yaml"),
        Path(__file__).parent.parent.parent / "config" / "config.yaml"
    ]
    for path in possible_paths:
        if path.exists():
            with path.open("r", encoding="utf-8") as f:
                return yaml.safe_load(f)
    return {}

def get_s3_client(minio_cfg):
    access_key = os.getenv("MINIO_ROOT_USER", "minioadmin")
    secret_key = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin123")
    endpoint = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
    
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=minio_cfg.get("region", "us-east-1"),
        config=Config(signature_version="s3v4", s3={'addressing_style': 'path'}),
    )

def extract_entities(text, nlp):
    data = {"type": "invoice", "invoice_number": None, "issue_date": None, "supplier": {"name": None, "siret": None, "tva": None, "address": None}, "client": {"name": None, "address": None}, "items": [], "total_ht": None, "total_tva": None, "total_ttc": None, "labels": {"is_tva_incoherent": False}}
    if nlp:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "ORG" and not data["supplier"]["name"]:
                data["supplier"]["name"] = ent.text
    
    inv_num_match = re.search(r"(?:Facture|Invoice|N°|Numéro)\s*[:=]?\s*([A-Z0-9-]+)", text, re.IGNORECASE)
    if inv_num_match: data["invoice_number"] = inv_num_match.group(1)
    
    siret_match = re.search(r"SIRET\s*[:=]?\s*(\d{9,14})", text, re.IGNORECASE)
    if siret_match: data["supplier"]["siret"] = siret_match.group(1)
    
    # Simple totals extraction
    ht_match = re.search(r"Total HT\s*[:]?\s*(\d+(?:[.,]\d{2})?)", text, re.IGNORECASE)
    if ht_match: data["total_ht"] = float(ht_match.group(1).replace(',', '.'))
    
    ttc_match = re.search(r"Total TTC\s*[:=]\s*(\d+(?:[.,]\d{2})?)", text, re.IGNORECASE)
    if ttc_match: data["total_ttc"] = float(ttc_match.group(1).replace(',', '.'))
    
    return data

def main():
    parser = argparse.ArgumentParser(description='Turbo OCR Pipeline Processor')
    parser.add_argument('--file', type=str, required=True, help='Path to the local PDF file')
    args = parser.parse_args()
    
    print(f"--- Starting Turbo Pipeline for {args.file} ---")
    
    # 1. Load Config & Env
    cfg = load_config()
    minio_cfg = cfg.get("minio", {})
    
    # 2. Setup Clients
    s3 = get_s3_client(minio_cfg)
    minio_client = Minio(
        os.getenv("MINIO_ENDPOINT", "http://minio:9000").replace("http://", "").replace("https://", ""),
        access_key=os.getenv("MINIO_ROOT_USER", "minioadmin"),
        secret_key=os.getenv("MINIO_ROOT_PASSWORD", "minioadmin123"),
        secure=os.getenv("MINIO_SECURE", "false").lower() == "true"
    )
    
    db_conn = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "db"),
        user=os.getenv("MYSQL_USER", "invoicer_user"),
        password=os.getenv("MYSQL_PASSWORD", "invoicer_password"),
        database=os.getenv("MYSQL_DATABASE", "invoicer_db"),
        port=int(os.getenv("MYSQL_PORT", "3306"))
    )
    
    try:
        nlp = spacy.load("fr_core_news_sm")
    except:
        nlp = None
        print("Warning: SpaCy model not found, skipping entity extraction")

    # 3. Step 1: Upload Raw
    file_path = Path(args.file)
    raw_bucket = os.getenv("MINIO_RAW_BUCKET", "raw")
    raw_key = f"invoices/{file_path.name}"
    s3.upload_file(str(file_path), raw_bucket, raw_key)
    print(f"Step 1/4: Uploaded to {raw_bucket}/{raw_key}")

    # 4. Step 2: OCR
    print(f"Step 2/4: Running OCR...")
    extracted_text = extract_text_from_pdf(str(file_path))
    
    # 5. Step 3: NLP & Enrichment
    print(f"Step 3/4: Extracting entities...")
    data = extract_entities(extracted_text, nlp)
    data["_raw_ocr_content"] = extracted_text
    
    # Lookup in DB if siret found
    if data["supplier"]["siret"]:
        cursor = db_conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM companies WHERE siret LIKE %s LIMIT 1", (f"{data['supplier']['siret']}%",))
        company = cursor.fetchone()
        if company:
            data["supplier"].update({"name": company["name"], "tva": company["tva_number"], "company_id": company["company_id"]})
        cursor.close()

    # Save to Silver/Gold in MinIO
    json_bytes = json.dumps(data, ensure_ascii=False, indent=4).encode('utf-8')
    json_name = file_path.stem + ".json"
    
    for bucket in [os.getenv("MINIO_SILVER_BUCKET", "silver"), os.getenv("MINIO_GOLD_BUCKET", "gold")]:
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
            f.write(json_bytes)
            f_path = f.name
        minio_client.fput_object(bucket, f"invoices/{json_name}", f_path, content_type='application/json')
        os.unlink(f_path)
    
    # 6. Step 4: Insert DB
    print(f"Step 4/4: Inserting into MySQL...")
    cursor = db_conn.cursor()
    # Insert document
    cursor.execute("INSERT INTO documents (document_type_id, original_name, storage_path, status) VALUES (%s, %s, %s, %s)", 
                  (1, data["invoice_number"] or file_path.name, f"gold/invoices/{json_name}", "processed"))
    doc_id = cursor.lastrowid
    
    # Insert version
    cursor.execute("INSERT INTO document_versions (document_id) VALUES (%s)", (doc_id,))
    ver_id = cursor.lastrowid
    
    # Insert fields
    fields = {"invoice_number": data["invoice_number"], "siret": data["supplier"]["siret"], "total_ttc": data["total_ttc"]}
    for k, v in fields.items():
        if v: cursor.execute("INSERT INTO document_fields (version_id, field_name, field_value) VALUES (%s, %s, %s)", (ver_id, k, str(v)))
    
    db_conn.commit()
    cursor.close()
    
    print(f"--- Turbo Pipeline Completed Successfully in one pass ---")
    db_conn.close()

if __name__ == "__main__":
    main()
