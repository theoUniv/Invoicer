import json
import random
from datetime import datetime, timedelta
from pathlib import Path

from faker import Faker
from fpdf import FPDF


fake = Faker("fr_FR")

DATA_DIR = Path("data")
RAW_INVOICES_DIR = DATA_DIR / "raw" / "invoices"



def load_companies(path: str = "data/curated/companies.json"):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def create_invoice_pdf(invoice_data: dict, output_path: Path) -> None:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(0, 10, "FACTURE", ln=True, align="C")
    pdf.ln(5)

    supplier = invoice_data["supplier"]
    pdf.cell(0, 8, f"Fournisseur : {supplier['name']}", ln=True)
    pdf.cell(0, 8, f"SIRET : {supplier['siret']}", ln=True)
    pdf.cell(0, 8, f"TVA : {supplier['tva']}", ln=True)
    pdf.cell(0, 8, f"Adresse : {supplier['address']}", ln=True)
    pdf.ln(5)

    client = invoice_data["client"]
    pdf.cell(0, 8, f"Client : {client['name']}", ln=True)
    pdf.cell(0, 8, f"Adresse : {client['address']}", ln=True)
    pdf.ln(5)

    pdf.cell(0, 8, f"Numéro de facture : {invoice_data['invoice_number']}", ln=True)
    pdf.cell(0, 8, f"Date d'émission : {invoice_data['issue_date']}", ln=True)
    pdf.ln(5)

    pdf.cell(80, 8, "Description", border=1)
    pdf.cell(30, 8, "Qté", border=1, align="R")
    pdf.cell(40, 8, "PU HT", border=1, align="R")
    pdf.cell(40, 8, "Total HT", border=1, ln=True, align="R")

    for item in invoice_data["items"]:
        pdf.cell(80, 8, item["description"], border=1)
        pdf.cell(30, 8, str(item["quantity"]), border=1, align="R")
        pdf.cell(40, 8, f"{item['unit_price_ht']:.2f} EUR", border=1, align="R")
        pdf.cell(40, 8, f"{item['total_ht']:.2f} EUR", border=1, ln=True, align="R")

    pdf.ln(5)
    pdf.cell(0, 8, f"Total HT : {invoice_data['total_ht']:.2f} EUR", ln=True)
    pdf.cell(0, 8, f"TVA ({invoice_data['tva_rate']*100:.0f}%) : {invoice_data['total_tva']:.2f} EUR", ln=True)
    pdf.cell(0, 8, f"Total TTC : {invoice_data['total_ttc']:.2f} EUR", ln=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(output_path))


def generate_one_invoice(companies: list, index: int, incoherent: bool = False) -> dict:
    supplier = random.choice(companies)
    client = {
        "name": fake.name(),
        "address": fake.address().replace("\n", ", "),
    }

    tva_rate = random.choice([0.20, 0.10, 0.055])
    if incoherent:
        tva_rate = random.choice([0.30, 0.40])

    n_items = random.randint(1, 5)
    items = []
    total_ht = 0.0
    for _ in range(n_items):
        quantity = random.randint(1, 10)
        unit_price = round(random.uniform(50, 500), 2)
        total_line = quantity * unit_price
        total_ht += total_line
        items.append(
            {
                "description": fake.sentence(nb_words=4),
                "quantity": quantity,
                "unit_price_ht": unit_price,
                "total_ht": total_line,
            }
        )

    total_tva = round(total_ht * tva_rate, 2)
    total_ttc = round(total_ht + total_tva, 2)
    issue_date = datetime.today() - timedelta(days=random.randint(0, 365))

    invoice_data = {
        "type": "invoice",
        "invoice_number": f"FAC-{issue_date.strftime('%Y%m%d')}-{index:04d}",
        "issue_date": issue_date.strftime("%Y-%m-%d"),
        "supplier": supplier,
        "client": client,
        "items": items,
        "tva_rate": tva_rate,
        "total_ht": total_ht,
        "total_tva": total_tva,
        "total_ttc": total_ttc,
        "labels": {
            "is_tva_incoherent": incoherent,
        },
    }

    return invoice_data


def generate_invoices(n: int = 50, incoherent_ratio: float = 0.2) -> None:
    companies = load_companies()
    RAW_INVOICES_DIR.mkdir(parents=True, exist_ok=True)
    for i in range(1, n + 1):
        incoherent = random.random() < incoherent_ratio
        invoice_data = generate_one_invoice(companies, i, incoherent=incoherent)

        pdf_path = RAW_INVOICES_DIR / f"{invoice_data['invoice_number']}.pdf"
        create_invoice_pdf(invoice_data, pdf_path)

        print(f"Généré {pdf_path}")


if __name__ == "__main__":
    generate_invoices()

