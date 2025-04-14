from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# Initialize MongoDB client
client = AsyncIOMotorClient(MONGODB_URL)
db = client.lost_found

# Collections
messages = db.messages
users = db.users
posts = db.posts
notifications = db.notifications
comments = db.comments
