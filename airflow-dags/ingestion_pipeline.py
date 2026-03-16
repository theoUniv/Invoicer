from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

with DAG(
    'ingestion_pipeline',
    start_date=datetime(2023, 1, 1),
    schedule_interval=None,
    catchup=False
) as dag:
    pass
