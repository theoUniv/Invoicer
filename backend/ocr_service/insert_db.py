from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

connection = mysql.connector.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE"),
    port=int(os.getenv("MYSQL_PORT"))
)

cursor = connection.cursor()

def get_or_create_company(supplier):

    query = "SELECT company_id FROM companies WHERE siret = %s"
    cursor.execute(query, (supplier["siret"],))
    result = cursor.fetchone()

    if result:
        return result[0]

    insert_query = """
    INSERT INTO companies (name, siret, tva_number)
    VALUES (%s, %s, %s)
    """

    values = (
        supplier.get("name"),
        supplier.get("siret"),
        supplier.get("tva"),
    )

    cursor.execute(insert_query, values)
    connection.commit()

    return cursor.lastrowid

def link_document_company(document_id, company_id):

    query = """
    INSERT INTO document_company_links (document_id, company_id)
    VALUES (%s, %s)
    """

    cursor.execute(query, (document_id, company_id))
    connection.commit()

def insert_document(json_data):

    query = """
    INSERT INTO documents (document_type_id, original_name, storage_path)
    VALUES (%s, %s, %s)
    """

    values = (
        1,
        json_data["invoice_number"],
        f"gold/invoices/{json_data['invoice_number']}.json"
    )

    cursor.execute(query, values)
    connection.commit()

    return cursor.lastrowid

def insert_version(document_id):

    query = """
    INSERT INTO document_versions (document_id)
    VALUES (%s)
    """

    cursor.execute(query, (document_id,))
    connection.commit()

    return cursor.lastrowid

def insert_fields(version_id, json_data):

    fields = {
        "invoice_number": json_data.get("invoice_number"),
        "issue_date": json_data.get("issue_date"),
        "siret": json_data["supplier"].get("siret"),
        "tva": json_data["supplier"].get("tva"),
        "total_ttc": json_data.get("total_ttc"),
        "total_ht": json_data.get("total_ht"),
        "total_tva": json_data.get("total_tva"),
        "client_name": json_data["client"].get("name"),
        "client_address": json_data["client"].get("address"),
    }

    query = """
    INSERT INTO document_fields (version_id, field_name, field_value)
    VALUES (%s, %s, %s)
    """

    for key, value in fields.items():
        if value is not None:
            cursor.execute(query, (version_id, key, str(value)))

    connection.commit()

def insert_items(version_id, items):

    query = """
    INSERT INTO document_fields (version_id, field_name, field_value)
    VALUES (%s, %s, %s)
    """

    for i, item in enumerate(items):

        prefix = f"item_{i}"

        fields = {
            f"{prefix}_description": item.get("description"),
            f"{prefix}_quantity": item.get("quantity"),
            f"{prefix}_unit_price_ht": item.get("unit_price_ht"),
            f"{prefix}_total_ht": item.get("total_ht"),
        }

        for key, value in fields.items():
            if value is not None:
                cursor.execute(query, (version_id, key, str(value)))

    connection.commit()

def insert_invoice(json_data):

    company_id = get_or_create_company(json_data["supplier"])

    doc_id = insert_document(json_data)

    link_document_company(doc_id, company_id)

    version_id = insert_version(doc_id)

    insert_fields(version_id, json_data)

    insert_items(version_id, json_data.get("items", []))

    return "Insertion réussie"