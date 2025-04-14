from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise ValueError("Missing MONGODB_URL environment variable")

try:
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client.get_default_database()
    if db is None:
        db = client["lostfound"]
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    raise

# Collections
messages = db.messages
users = db.users
posts = db.posts
notifications = db.notifications
comments = db.comments
