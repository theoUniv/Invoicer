import os
import json
import argparse
import mysql.connector
from minio import Minio
from dotenv import load_dotenv
import tempfile
import re

load_dotenv()

def get_db_connection():
    try:
        return mysql.connector.connect(
            host='72.60.37.180',
            user="invoicer_user",
            password='invoicer_password',
            database=os.getenv('MYSQL_DATABASE', 'invoicer_db'),
            port=int(os.getenv('MYSQL_PORT', 3306))
        )
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def lookup_company(siret):
    if not siret:
        return None
    
    conn = get_db_connection()
    if not conn:
        return None
        
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM companies WHERE siret LIKE %s LIMIT 1"
        cursor.execute(query, (f"{siret}%",))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except Exception as e:
        print(f"Error querying database: {e}")
        return None

def refine_entities(raw_text):
    """
    Advanced parsing of the raw OCR text to extract all structured fields.
    """
    data = {
        "invoice_number": None,
        "issue_date": None,
        "supplier": {"name": None, "siret": None, "tva": None, "address": None},
        "client": {"name": None, "address": None},
        "items": [],
        "total_ht": None,
        "total_tva": None,
        "total_ttc": None
    }

    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    
    for i, line in enumerate(lines):
        if re.search(r"Fournisseur\s*[:]", line, re.IGNORECASE):
            data["supplier"]["name"] = line.split(":", 1)[1].strip()
            if i+1 < len(lines) and "Adresse" in lines[i+1]:
                data["supplier"]["address"] = lines[i+1].split(":", 1)[1].strip()
        
        elif re.search(r"Client\s*[:]", line, re.IGNORECASE):
            data["client"]["name"] = line.split(":", 1)[1].strip()
            if i+1 < len(lines) and "Adresse" in lines[i+1]:
                data["client"]["address"] = lines[i+1].split(":", 1)[1].strip()

    inv_num = re.search(r"Numéro de facture\s*[:=]\s*([A-Z0-9-]+)", raw_text, re.IGNORECASE)
    if inv_num: data["invoice_number"] = inv_num.group(1)

    issue_date = re.search(r"Date d'émission\s*[:=]\s*(\d{4}-\d{2}-\d{2})", raw_text, re.IGNORECASE)
    if issue_date: data["issue_date"] = issue_date.group(1)

    siret = re.search(r"SIRET\s*[:=]\s*(\d{9,14})", raw_text, re.IGNORECASE)
    if siret: data["supplier"]["siret"] = siret.group(1)

    tva_num = re.search(r"TVA\s*[:=]\s*(FR\d{11})", raw_text, re.IGNORECASE)
    if tva_num: data["supplier"]["tva"] = tva_num.group(1)

    # 3. Extract Totals
    ht = re.search(r"Total HT\s*[:;]?\s*(\d+(?:[.,]\d{2})?)", raw_text, re.IGNORECASE)
    if ht: data["total_ht"] = float(ht.group(1).replace(',', '.'))

    tva_val = re.search(r"TVA\s*\(\d+%\)\s*[:=]\s*(\d+(?:[.,]\d{2})?)", raw_text, re.IGNORECASE)
    if tva_val: data["total_tva"] = float(tva_val.group(1).replace(',', '.'))

    ttc = re.search(r"Total TTC\s*[:=]\s*(\d+(?:[.,]\d{2})?)", raw_text, re.IGNORECASE)
    if ttc: data["total_ttc"] = float(ttc.group(1).replace(',', '.'))

    item_section = False
    for line in lines:
        if "Description" in line and "Total" in line:
            item_section = True
            continue
        if "Total HT" in line:
            item_section = False
            break
        
        if item_section:
            match = re.search(r"(.*?)\.?\s+(\d+)\s+(\d+(?:[.,]\d{2})?)\s+EUR\s+(\d+(?:[.,]\d{2})?)\s+EUR", line)
            if match:
                data["items"].append({
                    "description": match.group(1).strip(),
                    "quantity": int(match.group(2)),
                    "unit_price_ht": float(match.group(3).replace(',', '.')),
                    "total_ht": float(match.group(4).replace(',', '.'))
                })

    return data

def main():
    parser = argparse.ArgumentParser(description='Process a silver JSON invoice, enrich with DB, and save to GOLD.')
    parser.add_argument('json_name', type=str, help='The name of the JSON file in the silver/invoices bucket.')
    args = parser.parse_args()

    json_name = args.json_name

    endpoint = os.getenv('MINIO_ENDPOINT', 'localhost:9000').replace('http://', '').replace('https://', '')
    access_key = os.getenv('MINIO_ROOT_USER')
    secret_key = os.getenv('MINIO_ROOT_PASSWORD')
    secure = os.getenv('MINIO_SECURE', 'False').lower() == 'true'
    
    client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)

    silver_bucket = os.getenv('MINIO_SILVER_BUCKET', 'silver')
    gold_bucket = os.getenv('MINIO_GOLD_BUCKET', 'gold')
    
    input_path = f"invoices/{json_name}"
    output_path = f"invoices/{json_name}" 

    try:
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as temp_in:
            print(f"Downloading {json_name} from {silver_bucket}/{input_path}...")
            client.fget_object(silver_bucket, input_path, temp_in.name)
            
            with open(temp_in.name, 'r', encoding='utf-8') as f:
                silver_data = json.load(f)
            
            os.unlink(temp_in.name)

        print(f"Refining and enriching {json_name} for Gold...")
        
        raw_text = silver_data.get("_raw_ocr_content", "")
        if not raw_text:
            print("Warning: No raw OCR content found in Silver JSON.")
            refined_data = silver_data.copy()
        else:
            refined_data = refine_entities(raw_text)

        siret = refined_data["supplier"].get("siret")
        if siret:
            company_db_info = lookup_company(siret)
            if company_db_info:
                print(f"Enriching with DB info for: {company_db_info['name']}")
                refined_data["supplier"]["company_id"] = company_db_info["company_id"]
                refined_data["supplier"]["name"] = company_db_info["name"]
                refined_data["supplier"]["tva"] = company_db_info["tva_number"]
            else:
                print(f"SIRET {siret} not found in companies table.")

        gold_data = {
            "type": "invoice",
            "invoice_number": refined_data["invoice_number"],
            "issue_date": refined_data["issue_date"],
            "supplier": refined_data["supplier"],
            "client": refined_data["client"],
            "items": refined_data["items"],
            "tva_rate": None,
            "total_ht": refined_data["total_ht"],
            "total_tva": refined_data["total_tva"],
            "total_ttc": refined_data["total_ttc"],
            "labels": {
                "is_tva_incoherent": False
            },
            "_source_ocr": json_name
        }

        if gold_data["total_ht"] and gold_data["total_tva"] and gold_data["total_ttc"]:
            if abs((gold_data["total_ht"] + gold_data["total_tva"]) - gold_data["total_ttc"]) > 0.05:
                gold_data["labels"]["is_tva_incoherent"] = True
            gold_data["tva_rate"] = round(gold_data["total_tva"] / gold_data["total_ht"], 2)

        gold_json = json.dumps(gold_data, ensure_ascii=False, indent=4).encode('utf-8')

        if not client.bucket_exists(gold_bucket):
            client.make_bucket(gold_bucket)
            print(f"Created bucket: {gold_bucket}")

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as temp_out:
            temp_out.write(gold_json)
            temp_out_path = temp_out.name
        
        print(f"Uploading curated result to {gold_bucket}/{output_path}...")
        client.fput_object(gold_bucket, output_path, temp_out_path, content_type='application/json')
        os.unlink(temp_out_path)

        print(f"Successfully processed {json_name} and saved to {gold_bucket}/{output_path}")

    except Exception as e:
        print(f"An error occurred in Gold processing: {e}")

if __name__ == "__main__":
    main()
