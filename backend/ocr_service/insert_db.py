from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

connection = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE"),
    port=int(os.getenv("MYSQL_PORT"))
)

cursor = connection.cursor()


def insert_document(json_data):

    query = """
    INSERT INTO documents (document_type_id, original_name, storage_path)
    VALUES (%s, %s, %s)
    """

    values = (
        1,
        json_data["invoice_number"],
        f"gold/invoices/{json_data['invoice_number']}.json"
    )

    cursor.execute(query, values)
    connection.commit()

    return cursor.lastrowid


def insert_version(document_id):

    query = """
    INSERT INTO document_versions (document_id)
    VALUES (%s)
    """

    cursor.execute(query, (document_id,))
    connection.commit()

    return cursor.lastrowid


def insert_fields(version_id, json_data):

    fields = {
        "invoice_number": json_data.get("invoice_number"),
        "issue_date": json_data.get("issue_date"),
        "siret": json_data["supplier"].get("siret"),
        "tva": json_data["supplier"].get("tva"),
        "total_ttc": json_data.get("total_ttc"),
        "total_ht": json_data.get("total_ht"),
        "total_tva": json_data.get("total_tva"),
    }

    query = """
    INSERT INTO document_fields (version_id, field_name, field_value)
    VALUES (%s, %s, %s)
    """

    for key, value in fields.items():
        if value is not None:
            cursor.execute(query, (version_id, key, str(value)))

    connection.commit()


def insert_invoice(json_data):

    doc_id = insert_document(json_data)
    version_id = insert_version(doc_id)
    insert_fields(version_id, json_data)

    return "Insertion réussie"


import json
import argparse
import tempfile
from minio import Minio

def main():
    parser = argparse.ArgumentParser(description='Insert Gold JSON invoice data into MySQL.')
    parser.add_argument('json_name', type=str, help='The name of the JSON file in the gold/invoices bucket.')
    args = parser.parse_args()

    json_name = args.json_name

    # MinIO Setup
    endpoint = os.getenv('MINIO_ENDPOINT', 'localhost:9000').replace('http://', '').replace('https://', '')
    access_key = os.getenv('MINIO_ROOT_USER')
    secret_key = os.getenv('MINIO_ROOT_PASSWORD')
    secure = os.getenv('MINIO_SECURE', 'False').lower() == 'true'
    
    client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)
    gold_bucket = os.getenv('MINIO_GOLD_BUCKET', 'gold')
    input_path = f"invoices/{json_name}"

    try:
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as temp_in:
            print(f"Downloading {json_name} from {gold_bucket}/{input_path}...")
            client.fget_object(gold_bucket, input_path, temp_in.name)
            
            with open(temp_in.name, 'r', encoding='utf-8') as f:
                gold_data = json.load(f)
            
            os.unlink(temp_in.name)

        print(f"Inserting data into MySQL for invoice: {gold_data.get('invoice_number')}")
        result = insert_invoice(gold_data)
        print(result)

    except Exception as e:
        print(f"An error occurred in DB insertion: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    main()