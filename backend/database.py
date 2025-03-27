from pymongo import MongoClient
import mysql.connector

# ---------------------------
# ✅ MongoDB Configuration
# ---------------------------
MONGO_URI = "mongodb://localhost:27017"
mongo_client = MongoClient(MONGO_URI)

# ✅ MongoDB Database Name
mongo_db = mongo_client["lost_found"]

# ✅ MongoDB Collections
users_collection = mongo_db["users"]
messages_collection = mongo_db["messages"]
conversations_collection = mongo_db["conversations"]

# ---------------------------
# ✅ MySQL Configuration
# ---------------------------
MYSQL_CONFIG = {
    "host": "127.0.0.1",
    "user": "lavanya",           # ✅ Your MySQL username
    "password": "Lavanya@123",   # ✅ Your MySQL password
    "database": "lost_found",    # ✅ Make sure this DB exists
    "port": 3306
}

def get_mysql_connection():
    return mysql.connector.connect(**MYSQL_CONFIG)

print("✅ Database connections initialized successfully.")
