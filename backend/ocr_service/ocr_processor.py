import os
import json
import argparse
from minio import Minio
from dotenv import load_dotenv
from ocr_pipeline import extract_text_from_pdf
import tempfile

# Load environment variables
load_dotenv()

def main():
    parser = argparse.ArgumentParser(description='Process an invoice PDF from MinIO using OCR.')
    parser.add_argument('pdf_name', type=str, help='The name of the PDF file in the RAW/invoices bucket.')
    args = parser.parse_args()

    pdf_name = args.pdf_name
    if not pdf_name.lower().endswith('.pdf'):
        print(f"Error: {pdf_name} is not a PDF file.")
        return

    # MinIO configuration
    endpoint = os.getenv('MINIO_ENDPOINT').replace('http://', '').replace('https://', '')
    access_key = os.getenv('MINIO_ROOT_USER')
    secret_key = os.getenv('MINIO_ROOT_PASSWORD')
    
    secure = os.getenv('MINIO_SECURE').lower() == 'true'
    
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

        result = {
            "filename": pdf_name,
            "content": extracted_text
        }
        json_data = json.dumps(result, ensure_ascii=False, indent=4).encode('utf-8')

        print(f"Uploading result to {silver_bucket}/{output_path}...")
        
        if not client.bucket_exists(silver_bucket):
            client.make_bucket(silver_bucket)
            print(f"Created bucket: {silver_bucket}")

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as temp_json:
            temp_json.write(json_data)
            temp_json_path = temp_json.name
        
        client.fput_object(silver_bucket, output_path, temp_json_path, content_type='application/json')
        os.unlink(temp_json_path)

        print(f"Successfully processed {pdf_name} and saved to {silver_bucket}/{output_path}")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
