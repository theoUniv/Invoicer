# Invoicer - Plateforme de Traitement de Documents

Invoicer est une solution complète de traitement de factures et de devis, permettant l'ingestion automatisée, l'extraction de données via OCR/NLP et la validation manuelle via une interface web réactive.

## Architecture du Projet

Le projet repose sur une architecture modulaire orchestrée par Docker :

- **Frontend** : Application Next.js (port 3000) offrant un tableau de bord de suivi et un éditeur de versions avec validation en temps réel.
- **Backend API** : Serveur Node.js/Express (port 3001) avec Prisma ORM pour la gestion de la base de données MySQL.
- **Pipeline de Données** : Apache Airflow gérant le cycle de vie des documents (Raw -> Silver -> Gold).
- **Service OCR/NLP** : Suite d'outils Python utilisant Tesseract et SpaCy pour l'extraction structurée.
- **Stockage** : Instance MinIO (S3-compatible) pour la persistence des fichiers PDF et des résultats JSON.

## Fonctionnalités Clés

### 1. Ingestion Automatisée
- Surveillance des nouveaux fichiers dans le bucket MinIO `raw`.
- Pipeline Airflow déclenché automatiquement pour le traitement OCR.
- Détection dynamique du type de document (Facture vs Devis).

### 2. Extraction & Enrichissement
- Extraction des entités : Numéro de facture/devis, SIRET, montants (HT/TVA/TTC), dates.
- Enrichissement via base de données pour l'identification des fournisseurs et clients.
- Calcul automatique des taux de TVA et vérification de cohérence mathématique.

### 3. Interface de Validation (UI/UX)
- **Validation Temps Réel** : Surlignage en rouge des champs incohérents (HT + TVA != TTC) ou SIRET invalide (format 14 chiffres).
- **Vérification SIRET** : Requête API en direct pour vérifier si l'entreprise existe dans le référentiel.
- **Gestion des Versions** : Historisation complète des modifications avec badges d'erreur visuels (TVA/SIRET).
- **Export** : Prévisualisation et téléchargement des documents originaux.

## Installation et Déploiement

### Prérequis
- Docker et Docker Compose
- Accès Internet pour la récupération des images et dépendances

### Lancement via Docker Compose
Pour déployer l'ensemble de la pile sur un serveur (VPS) :

```bash
git clone https://github.com/theoUniv/Invoicer.git
cd Invoicer
# Editez le fichier .env avec vos configurations IP/Ports
docker compose up -d --build
```

### Accès aux Services
- **Frontend** : `http://votre-ip:3000`
- **Backend API** : `http://votre-ip:3001`
- **MinIO Console** : `http://votre-ip:9001` (User: `minioadmin` / Pass: `minioadmin123`)
- **Airflow UI** : `http://votre-ip:8080`

## Structure du Repository

```text
.
├── backend/            # API Express & Scripts OCR/NLP
├── frontend/           # Application Next.js
├── data/               # Données locales (raw/silver/gold)
├── airflow-dags/       # Définition des pipelines ETL
├── docker-compose.yml  # Orchestration des services
└── .env.example        # Modèle de configuration environnementale
```
