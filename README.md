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

Un guide détaillé pour le déploiement sur VPS est disponible ici : [Guide de Déploiement sur VPS](file:///Users/theo-dev/Dev/M2_IPSSI/hackathon/Invoicer/vps_deployment_guide.md)

### Base de données (MySQL, MinIO)

Pour instancier toute l'infrastructure sur votre VPS ou localement :

1. **Préparer l'environnement** :
   ```bash
   cp .env.example .env
   # Modifiez .env si nécessaire (credentials MinIO ajoutés)
   ```

2. **Lancer les services** :
   ```bash
   docker compose up -d
   ```

### Initialisation des données (Seeder)

Pour peupler automatiquement MySQL, MinIO et MongoDB avec des données de test (entreprises, factures PDF, records JSON) :

```bash
docker compose --profile seeder run seeder
```

## Accès aux services

- **MinIO Console (Web)** : `http://<IP>:9001` (User: `minioadmin` / Pass: `minioadmin123`)
- **MinIO API (S3)** : Port `9000`

## Vérification

Pour vérifier MySQL :
```bash
docker exec -it invoicer-db mysql -u invoicer_user -p invoicer_db -e "SHOW TABLES;"
```

Pour vérifier MinIO :
Connectez-vous à la console web (`http://IP:9001`) et vérifiez les buckets `raw`, `clean` et `curated`.
