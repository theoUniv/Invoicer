from dotenv import load_dotenv
import os
import mysql.connector
import json
import argparse
import tempfile
import sys
from minio import Minio

load_dotenv()

connection = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST", "db"),
    user=os.getenv("MYSQL_USER", "invoicer_user"),
    password=os.getenv("MYSQL_PASSWORD", "invoicer_password"),
    database=os.getenv("MYSQL_DATABASE", "invoicer_db"),
    port=int(os.getenv("MYSQL_PORT", "3306"))
)

cursor = connection.cursor()

def get_or_create_document_type(name):
    if not name:
        name = "facture"
    
    query = "SELECT document_type_id FROM document_types WHERE name = %s"
    cursor.execute(query, (name.lower(),))
    result = cursor.fetchone()

    if result:
        return result[0]

    insert_query = "INSERT INTO document_types (name) VALUES (%s)"
    cursor.execute(insert_query, (name.lower(),))
    connection.commit()
    return cursor.lastrowid

def get_or_create_company(supplier):
    if not supplier or not supplier.get("siret"):
        return None
        
    query = "SELECT company_id FROM companies WHERE siret = %s"
    cursor.execute(query, (supplier["siret"],))
    result = cursor.fetchone()

    if result:
        return result[0]

    insert_query = """
    INSERT INTO companies (name, siret, tva_number)
    VALUES (%s, %s, %s)
    """
    values = (
        supplier.get("name") or "Unknown Company",
        supplier.get("siret"),
        supplier.get("tva"),
    )
    cursor.execute(insert_query, values)
    connection.commit()
    return cursor.lastrowid

def link_document_company(document_id, company_id):
    if not company_id: return
    query = """
    INSERT INTO document_company_links (document_id, company_id)
    VALUES (%s, %s)
    ON DUPLICATE KEY UPDATE document_id=document_id
    """
    cursor.execute(query, (document_id, company_id))
    connection.commit()

def update_document(document_id, json_data, fallback_name):
    query = """
    UPDATE documents 
    SET status = 'processed', 
        original_name = %s
    WHERE document_id = %s
    """
    # Use fallback if invoice_number is None or empty
    invoice_number = json_data.get("invoice_number") or fallback_name
    doc_type = json_data.get("type", "facture")
    doc_type_id = get_or_create_document_type(doc_type)

    cursor.execute(query, (invoice_number, document_id))
    
    # Also update type if needed
    type_query = "UPDATE documents SET document_type_id = %s WHERE document_id = %s"
    cursor.execute(type_query, (doc_type_id, document_id))
    
    connection.commit()

def insert_document(json_data, fallback_name):
    query = """
    INSERT INTO documents (document_type_id, original_name, status)
    VALUES (%s, %s, 'processed')
    """
    # Use fallback if invoice_number is None or empty
    invoice_number = json_data.get("invoice_number") or fallback_name
    doc_type = json_data.get("type", "facture")
    doc_type_id = get_or_create_document_type(doc_type)

    values = (
        doc_type_id,
        invoice_number
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
        "siret": json_data["supplier"].get("siret") if "supplier" in json_data else None,
        "tva": json_data["supplier"].get("tva") if "supplier" in json_data else None,
        "total_ttc": json_data.get("total_ttc"),
        "total_ht": json_data.get("total_ht"),
        "total_tva": json_data.get("total_tva"),
        "client_name": json_data.get("client", {}).get("name"),
        "client_address": json_data.get("client", {}).get("address"),
    }
    ht = fields.get("total_ht")
    tva = fields.get("total_tva")
    ttc = fields.get("total_ttc")
    
    if ht is not None and tva is not None and ttc is not None:
        try:
            diff = abs((float(ht) + float(tva)) - float(ttc))
            is_incoherent = diff > 0.05
            fields["is_total_incoherent"] = str(is_incoherent)
        except (ValueError, TypeError):
            is_incoherent = None
    else:
        is_incoherent = None
    # ----------------------------------------------

    query = "INSERT INTO document_fields (version_id, field_name, field_value, validation_status) VALUES (%s, %s, %s, %s)"
    for key, value in fields.items():
        if value is not None:
            status = 'unchecked'
            if key == "is_total_incoherent":
                status = 'invalid' if value == "True" else 'valid'
            cursor.execute(query, (version_id, key, str(value), status))
    connection.commit()

def insert_items(version_id, items):
    if not items: return
    query = "INSERT INTO document_fields (version_id, field_name, field_value) VALUES (%s, %s, %s)"
    for i, item in enumerate(items):
        prefix = f"item_{i}"
        fields = {
            f"{prefix}_description": item.get("description"),
            f"{prefix}_quantity": item.get("quantity"),
            f"{prefix}_unit_price_ht": item.get("unit_price_ht"),
            f"{prefix}_total_ht": item.get("total_ht"),
        }
        for key, value in fields.items():
            if value is not None:
                cursor.execute(query, (version_id, key, str(value)))
    connection.commit()

def process_invoice_insertion(json_data, fallback_name, document_id=None):
    company_id = get_or_create_company(json_data.get("supplier"))
    
    if document_id:
        update_document(document_id, json_data, fallback_name)
        doc_id = document_id
        print(f"Updated document {doc_id}")
    else:
        doc_id = insert_document(json_data, fallback_name)
        print(f"Inserted new document {doc_id}")

    if company_id:
        link_document_company(doc_id, company_id)

    version_id = insert_version(doc_id)
    insert_fields(version_id, json_data)
    
    if "items" in json_data:
        insert_items(version_id, json_data["items"])

    return f"Insertion réussie pour le document {doc_id}"

def main():
    parser = argparse.ArgumentParser(description='Insert Gold JSON invoice data into MySQL.')
    parser.add_argument('json_name', type=str, help='The name of the JSON file in the gold/invoices bucket.')
    parser.add_argument('--document_id', type=str, help='The ID of the existing document in MySQL.', default=None)
    args = parser.parse_args()

    json_name = args.json_name
    document_id = args.document_id
    
    # Handle Airflow passing "None" as a string if XCom is empty
    if document_id == "None" or document_id == "":
        document_id = None
    elif document_id:
        try:
            document_id = int(document_id)
        except ValueError:
            document_id = None

    # MinIO Setup
    endpoint = (os.getenv('MINIO_ENDPOINT') or 'http://minio:9000').replace('http://', '').replace('https://', '')
    access_key = os.getenv('MINIO_ROOT_USER', 'minioadmin')
    secret_key = os.getenv('MINIO_ROOT_PASSWORD', 'minioadmin123')
    secure = os.getenv('MINIO_SECURE', 'false').lower() == 'true'
    
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

        print(f"Processing data for document_id: {document_id}")
        # Use filename as fallback if invoice_number is None
        fallback_name = json_name.rsplit('.', 1)[0]
        result = process_invoice_insertion(gold_data, fallback_name, document_id)
        print(result)

    except Exception as e:
        print(f"An error occurred in DB insertion: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    main()
