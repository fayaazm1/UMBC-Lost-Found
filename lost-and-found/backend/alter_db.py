from sqlalchemy import create_engine, text
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def alter_database():
    # Get database URL from environment variable
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")

    # Create engine
    engine = create_engine(database_url)
    
    try:
        # Add is_admin column if it doesn't exist
        with engine.connect() as connection:
            # Check if column exists
            check_column = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='is_admin';
            """)
            result = connection.execute(check_column)
            column_exists = result.fetchone() is not None

            if not column_exists:
                logger.info("Adding is_admin column to users table...")
                add_column = text("""
                    ALTER TABLE users 
                    ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
                """)
                connection.execute(add_column)
                connection.commit()
                logger.info("Added is_admin column successfully")
            else:
                logger.info("is_admin column already exists")

    except Exception as e:
        logger.error(f"Error altering database: {str(e)}")
        raise

if __name__ == "__main__":
    alter_database()
