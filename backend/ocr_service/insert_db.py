from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

connection = mysql.connector.connect(
    host="72.60.37.180",
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    database=os.getenv("MYSQL_DATABASE"),
    port=os.getenv("MYSQL_PORT")
)

cursor = connection.cursor()


def insert_invoice(json_data):
    {
        
    }