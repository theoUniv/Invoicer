import json
from pathlib import Path

from pymongo import MongoClient


MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "hackathon_docs"


def load_json_files(directory: Path):
    if not directory.exists():
        return
    for path in directory.glob("*.json"):
        with path.open("r", encoding="utf-8") as f:
            doc = json.load(f)
        yield doc


def main() -> None:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]

    invoices_dir = Path("data/curated/invoices")
    quotes_dir = Path("data/curated/quotes")
    attestations_dir = Path("data/curated/attestations")

    db.curated_records.delete_many({})

    for doc in load_json_files(invoices_dir):
        db.curated_records.insert_one(doc)

    for doc in load_json_files(quotes_dir):
        db.curated_records.insert_one(doc)

    for doc in load_json_files(attestations_dir):
        db.curated_records.insert_one(doc)

    print("Base MongoDB initialisée avec les documents curated.")


if __name__ == "__main__":
    main()

