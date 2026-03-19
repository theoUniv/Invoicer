import os
import json
import argparse
import spacy
import re
from minio import Minio
from dotenv import load_dotenv
from ocr_pipeline import extract_text_from_pdf
import tempfile

load_dotenv()

def extract_entities(text):
    """
    Extracts info from invoice text using SpaCy and Regex, matching requested schema.
    """
    try:
        nlp = spacy.load("fr_core_news_sm")
    except OSError:
        nlp = None

    doc = nlp(text) if nlp else None
    
    data = {
        "type": "invoice",
        "invoice_number": None,
        "issue_date": None,
        "supplier": {
            "company_id": None,
            "name": None,
            "siret": None,
            "tva": None,
            "address": None,
            "city": None,
            "postal_code": None,
            "country": "France"
        },
        "client": {
            "name": None,
            "address": None
        },
        "items": [],
        "tva_rate": None,
        "total_ht": None,
        "total_tva": None,
        "total_ttc": None,
        "labels": {
            "is_tva_incoherent": False
        }
    }

    if doc:
        for ent in doc.ents:
            if ent.label_ == "ORG" and not data["supplier"]["name"]:
                data["supplier"]["name"] = ent.text


    inv_num_match = re.search(r"Numéro de facture\s*[:=]\s*([A-Z0-9-]+)", text, re.IGNORECASE)
    if not inv_num_match:
        inv_num_match = re.search(r"(?:Facture|Invoice|N°)\s*(?:[:=]?)\s*([A-Z0-9-]+)", text, re.IGNORECASE)
    
    if inv_num_match:
        val = inv_num_match.group(1)
        if val.lower() != "fournisseur":
            data["invoice_number"] = val

    dates = re.findall(r"(\d{2}[/.-]\d{2}[/.-]\d{2,4})", text)
    if len(dates) >= 1:
        data["issue_date"] = dates[0]

    siren_match = re.search(r"(?:SIREN|SIRET)\s*(?:[:=]?)\s*(\d{9,14})", text, re.IGNORECASE)
    if siren_match:
        data["supplier"]["siret"] = siren_match.group(1)

    vat_num_match = re.search(r"(?:TVA|VAT)\s*(?:[:=]?)\s*(FR\d{11})", text, re.IGNORECASE)
    if vat_num_match:
        data["supplier"]["tva"] = vat_num_match.group(1)

    ht_match = re.search(r"(?:HT|Hors Taxe)\s*(?:[:=]?)\s*(\d+(?:[.,]\d{2})?)", text, re.IGNORECASE)
    if ht_match:
        data["total_ht"] = float(ht_match.group(1).replace(',', '.'))

    tva_total_match = re.search(r"(?:TVA|Taxe)\s*Total\s*(?:[:=]?)\s*(\d+(?:[.,]\d{2})?)", text, re.IGNORECASE)
    if tva_total_match:
        data["total_tva"] = float(tva_total_match.group(1).replace(',', '.'))

    ttc_match = re.search(r"(?:TTC|TOTAL|NET)\s*(?:[:=]?)\s*(\d+(?:[.,]\d{2})?)", text, re.IGNORECASE)
    if ttc_match:
        data["total_ttc"] = float(ttc_match.group(1).replace(',', '.'))


    lines = text.split('\n')
    for line in lines:
        item_match = re.search(r"(.*)\s+(\d+)\s+(\d+(?:[.,]\d{2})?)\s+(\d+(?:[.,]\d{2})?)", line)
        if item_match and not any(k in line for k in ["TOTAL", "TTC", "HT"]):
            data["items"].append({
                "description": item_match.group(1).strip(),
                "quantity": int(item_match.group(2)),
                "unit_price_ht": float(item_match.group(3).replace(',', '.')),
                "total_ht": float(item_match.group(4).replace(',', '.'))
            })

    if data["total_ht"] and data["total_tva"]:
        data["tva_rate"] = round(data["total_tva"] / data["total_ht"], 2)

    if data["total_ht"] and data["total_tva"] and data["total_ttc"]:
        calculated_ttc = data["total_ht"] + data["total_tva"]
        if abs(calculated_ttc - data["total_ttc"]) > 0.05:
            data["labels"]["is_tva_incoherent"] = True

    return data

def main():
    parser = argparse.ArgumentParser(description='Process an invoice PDF from MinIO using OCR and store structured JSON in Silver.')
    parser.add_argument('pdf_name', type=str, help='The name of the PDF file in the RAW/invoices bucket.')
    args = parser.parse_args()

    pdf_name = args.pdf_name
    if not pdf_name.lower().endswith('.pdf'):
        print(f"Error: {pdf_name} is not a PDF file.")
        return

    endpoint = (os.getenv('MINIO_ENDPOINT') or 'http://minio:9000').replace('http://', '').replace('https://', '')
    access_key = os.getenv('MINIO_ROOT_USER', 'minioadmin')
    secret_key = os.getenv('MINIO_ROOT_PASSWORD', 'minioadmin123')
    secure = os.getenv('MINIO_SECURE', 'false').lower() == 'true'
    
    client = Minio(
        endpoint,
        access_key=access_key,
        secret_key=secret_key,
        secure=secure
    )

    raw_bucket = os.getenv('MINIO_RAW_BUCKET', 'raw')
    silver_bucket = os.getenv('MINIO_SILVER_BUCKET', 'silver')
    
    input_path = f"invoices/{pdf_name}"
    json_name = pdf_name.rsplit('.', 1)[0] + '.json'
    output_path = f"invoices/{json_name}" 

    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
            print(f"Downloading {pdf_name} from {raw_bucket}/{input_path}...")
            client.fget_object(raw_bucket, input_path, temp_pdf.name)
            temp_pdf_path = temp_pdf.name

        print(f"Processing {pdf_name} with OCR...")
        extracted_text = extract_text_from_pdf(temp_pdf_path)
        os.unlink(temp_pdf_path)

        print(f"Extracting structured data...")
        structured_data = extract_entities(extracted_text)
        
        structured_data["_raw_ocr_content"] = extracted_text

        json_data = json.dumps(structured_data, ensure_ascii=False, indent=4).encode('utf-8')

        if not client.bucket_exists(silver_bucket):
            client.make_bucket(silver_bucket)
            print(f"Created bucket: {silver_bucket}")

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as temp_json:
            temp_json.write(json_data)
            temp_json_path = temp_json.name
        
        print(f"Uploading structured result to {silver_bucket}/{output_path}...")
        client.fput_object(silver_bucket, output_path, temp_json_path, content_type='application/json')
        os.unlink(temp_json_path)

        print(f"Successfully processed {pdf_name} and saved to {silver_bucket}/{output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
