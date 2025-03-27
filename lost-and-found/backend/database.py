from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]
print(f"Using DATABASE_URL: {DATABASE_URL}")  # Debug line

# Handle special case for Heroku-style DATABASE_URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    print(f"Converted DATABASE_URL: {DATABASE_URL}")  # Debug line

engine = create_engine(DATABASE_URL)
print(f"Engine created with DATABASE_URL: {DATABASE_URL}")  # Debug line

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
print("Session maker bound to engine")  # Debug line

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        print("Database session started")  # Debug line
        yield db
    finally:
        db.close()
        print("Database session closed")  # Debug line
