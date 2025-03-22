from pymongo import MongoClient
import mysql.connector
import os

# MongoDB Connection (Messaging Database)
MONGO_URI = "mongodb://localhost:27017"
mongo_client = MongoClient(MONGO_URI)
mongo_db = mongo_client["lost_found_db"]
messages_collection = mongo_db["messages"]

# MySQL Connection (Notifications Database)
MYSQL_CONFIG = {
    "host": "127.0.0.1",
    "user": "lavanya",  # Use your MySQL username
    "password": "Lavanya@123",  # Use your correct MySQL password
    "database": "lost_found",  # Ensure this database exists
    "port": 3306
}

def get_mysql_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

print("✅ Database connections initialized successfully.")
