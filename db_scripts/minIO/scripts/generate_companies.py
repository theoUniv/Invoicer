from faker import Faker
import random
import json
from pathlib import Path


fake = Faker("fr_FR")


def random_siret() -> str:
    """Génère un SIRET de 14 chiffres (sans contrôle de validité pour le hackathon)."""
    return "".join(str(random.randint(0, 9)) for _ in range(14))


def generate_companies(n: int = 20, output_path: str = "data/curated/companies.json") -> None:
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    companies = []
    for i in range(n):
        company = {
            "company_id": i + 1,
            "name": fake.company(),
            "siret": random_siret(),
            "tva": f"FR{random.randint(10, 99)}{random.randint(100000000, 999999999)}",
            "address": fake.address().replace("\n", ", "),
            "city": fake.city(),
            "postal_code": fake.postcode(),
            "country": "France",
        }
        companies.append(company)

    with path.open("w", encoding="utf-8") as f:
        json.dump(companies, f, ensure_ascii=False, indent=2)

    print(f"Généré {n} entreprises dans {path}")


if __name__ == "__main__":
    generate_companies()

