from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use environment variable for database URL
DATABASE_URL = os.getenv("DATABASE_URL")

# For local development, use SQLite if no DATABASE_URL is provided
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./sql_app.db"
    connect_args = {"check_same_thread": False}  # SQLite-specific
else:
    # Handle special case for Postgres URLs from Render
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    connect_args = {}  # No special args needed for PostgreSQL

# Create SQLAlchemy engine with connection pooling for PostgreSQL
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_size=5,
        max_overflow=10
    )
else:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Import models here to ensure they're registered with SQLAlchemy
from models.user import User
from models.post import Post
from models.message import Message
from models.notification import Notification

# Create all tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
