from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

# Fix for MongoDB Atlas connection
client = AsyncIOMotorClient(
    MONGODB_URL,
    tls=True,
    tlsAllowInvalidCertificates=True  # Set to False in production if you use valid certs
)

db = client.lostfound  # Match this with your actual database name

# Collections
messages = db.messages
users = db.users
posts = db.posts
notifications = db.notifications
comments = db.comments
