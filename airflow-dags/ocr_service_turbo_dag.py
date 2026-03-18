from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import os

default_args = {
    'owner': 'invoicer',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=1),
}

def extract_filename(**context):
    full_path = context['dag_run'].conf.get('file_path')
    if not full_path:
        raise ValueError("No file_path provided in dag_run.conf")
    return full_path

with DAG(
    'ocr_service_turbo_pipeline',
    default_args=default_args,
    description='Unified high-performance OCR pipeline',
    schedule_interval=None,
    catchup=False,
    tags=['turbo', 'ocr'],
) as dag:

    # Task 1: Prepare
    prepare = PythonOperator(
        task_id='prepare',
        python_callable=extract_filename,
    )

    # Task 2: Unified Process
    # This single task does Raw Upload -> OCR -> NLP -> DB
    process_all = BashOperator(
        task_id='process_all',
        bash_command='python3 /opt/airflow/backend/ocr_service/pipeline_processor.py --file "{{ ti.xcom_pull(task_ids="prepare") }}"',
        cwd='/opt/airflow',
        env={
            "PYTHONPATH": "/opt/airflow/backend/ocr_service",
            "MINIO_ENDPOINT": os.getenv("MINIO_ENDPOINT", "http://minio:9000"),
            "MINIO_ROOT_USER": os.getenv("MINIO_ROOT_USER", "minioadmin"),
            "MINIO_ROOT_PASSWORD": os.getenv("MINIO_ROOT_PASSWORD", "minioadmin123"),
            "MYSQL_HOST": os.getenv("MYSQL_HOST", "db"),
            "MYSQL_USER": os.getenv("MYSQL_USER", "invoicer_user"),
            "MYSQL_PASSWORD": os.getenv("MYSQL_PASSWORD", "invoicer_password"),
            "MYSQL_DATABASE": os.getenv("MYSQL_DATABASE", "invoicer_db"),
            "MYSQL_PORT": os.getenv("MYSQL_PORT", "3306")
        }
    )

    prepare >> process_all
