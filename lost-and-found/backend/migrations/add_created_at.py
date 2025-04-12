from sqlalchemy import text
from database import engine, Base
from models.post import Post  # Import the Post model to ensure it's registered

def run_migration():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    with engine.connect() as connection:
        # Check if created_at column exists
        result = connection.execute(text("SELECT * FROM pragma_table_info('posts') WHERE name='created_at'"))
        if not result.fetchone():
            # Add created_at column with current timestamp as default
            connection.execute(text("ALTER TABLE posts ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            connection.commit()
            print("Added created_at column to posts table")
        else:
            print("created_at column already exists in posts table")
