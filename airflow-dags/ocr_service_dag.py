import os
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'invoicer',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

def extract_filename(**context):
    """Extracts the base filename from the full path passed in conf."""
    full_path = context['dag_run'].conf.get('file_path')
    if not full_path:
        raise ValueError("No 'file_path' provided in DAG configuration.")
    
    filename = os.path.basename(full_path)
    document_id = context['dag_run'].conf.get('document_id')
    
    # Push to xcom for next tasks
    context['ti'].xcom_push(key='filename', value=filename)
    context['ti'].xcom_push(key='json_name', value=filename.rsplit('.', 1)[0] + '.json')
    context['ti'].xcom_push(key='document_id', value=document_id)

with DAG(
    'ocr_service_pipeline',
    default_args=default_args,
    description='Pipeline for OCR processing: External Trigger -> Raw -> Silver -> Gold',
    schedule_interval=None, # External trigger only
    catchup=False,
    tags=['ocr', 'backend_triggered'],
) as dag:

    # Task 1: Preparation (Extract filename from input path)
    prepare_meta = PythonOperator(
        task_id='prepare_metadata',
        python_callable=extract_filename,
    )

    # Task 2: Upload Raw PDF to MinIO (Local -> Raw)
    upload_raw = BashOperator(
        task_id='upload_raw',
        bash_command='python3 /opt/airflow/backend/ocr_service/upload_to_minio.py --file "{{ dag_run.conf["file_path"] }}" --bucket raw',
        cwd='/opt/airflow',
        env={
            "PYTHONPATH": "/opt/airflow/backend/ocr_service",
            "MINIO_ROOT_USER": os.getenv("MINIO_ROOT_USER", "minioadmin"),
            "MINIO_ROOT_PASSWORD": os.getenv("MINIO_ROOT_PASSWORD", "minioadmin123"),
            "MINIO_ENDPOINT": os.getenv("MINIO_ENDPOINT", "http://minio:9000")
        }
    )

    # Task 3: OCR Processing (Raw -> Silver)
    ocr_process = BashOperator(
        task_id='ocr_process',
        bash_command='python3 /opt/airflow/backend/ocr_service/ocr_processor.py "{{ ti.xcom_pull(task_ids="prepare_metadata", key="filename") }}"',
        cwd='/opt/airflow',
        env={
            "PYTHONPATH": "/opt/airflow/backend/ocr_service",
            "MINIO_ROOT_USER": os.getenv("MINIO_ROOT_USER", "minioadmin"),
            "MINIO_ROOT_PASSWORD": os.getenv("MINIO_ROOT_PASSWORD", "minioadmin123"),
            "MINIO_ENDPOINT": os.getenv("MINIO_ENDPOINT", "http://minio:9000")
        }
    )

    # Task 4: NLP Enrichment (Silver -> Gold)
    nlp_enrichment = BashOperator(
        task_id='nlp_enrichment',
        bash_command='python3 /opt/airflow/backend/ocr_service/nlp_processor.py "{{ ti.xcom_pull(task_ids="prepare_metadata", key="json_name") }}"',
        cwd='/opt/airflow',
        env={
            "PYTHONPATH": "/opt/airflow/backend/ocr_service",
            "MINIO_ROOT_USER": os.getenv("MINIO_ROOT_USER", "minioadmin"),
            "MINIO_ROOT_PASSWORD": os.getenv("MINIO_ROOT_PASSWORD", "minioadmin123"),
            "MINIO_ENDPOINT": os.getenv("MINIO_ENDPOINT", "http://minio:9000")
        }
    )

    # Task 5: Database Insertion (Gold -> MySQL)
    insert_db = BashOperator(
        task_id='insert_db',
        bash_command='python3 /opt/airflow/backend/ocr_service/insert_db.py "{{ ti.xcom_pull(task_ids="prepare_metadata", key="json_name") }}" --document_id "{{ ti.xcom_pull(task_ids="prepare_metadata", key="document_id") }}"',
        cwd='/opt/airflow',
        env={
            "PYTHONPATH": "/opt/airflow/backend/ocr_service",
            "MYSQL_HOST": os.getenv("MYSQL_HOST", "db"),
            "MYSQL_USER": os.getenv("MYSQL_USER", "invoicer_user"),
            "MYSQL_PASSWORD": os.getenv("MYSQL_PASSWORD", "invoicer_password"),
            "MYSQL_DATABASE": os.getenv("MYSQL_DATABASE", "invoicer_db"),
            "MYSQL_PORT": os.getenv("MYSQL_PORT", "3306"),
            "MINIO_ENDPOINT": os.getenv("MINIO_ENDPOINT", "http://minio:9000"),
            "MINIO_ROOT_USER": os.getenv("MINIO_ROOT_USER", "minioadmin"),
            "MINIO_ROOT_PASSWORD": os.getenv("MINIO_ROOT_PASSWORD", "minioadmin123")
        }
    )

    prepare_meta >> upload_raw >> ocr_process >> nlp_enrichment >> insert_db
