# Invoicer

Projet d'extraction et de traitement de factures.

## Structure du projet

- **backend/**: API NodeJS / Express
- **frontend/**: React / Next.js
- **ocr-model/**: Modèle IA pour extraction des factures (PaddleOCR)
- **airflow-dags/**: DAGs Apache Airflow pour le pipeline d'ingestion
- **spark-jobs/**: Jobs Spark pour le batch processing
- **docker/**: Fichiers de configuration Docker et Docker Compose

## Installation

### Base de données (MySQL)

Pour instancier la base de données sur votre VPS ou localement :

1. **Préparer l'environnement** :
   ```bash
   cp .env.example .env
   # Modifiez .env si nécessaire pour changer les mots de passe
   ```

2. **Lancer le conteneur** :
   ```bash
   docker compose up -d db
   ```

La base de données sera automatiquement initialisée avec les tables définies dans `db_scripts/Invoicer_CREATE_TABLE.sql`.

## Vérification

Pour vérifier que les tables ont été créées :
```bash
docker exec -it invoicer-db mysql -u invoicer_user -p invoicer_db -e "SHOW TABLES;"
```
