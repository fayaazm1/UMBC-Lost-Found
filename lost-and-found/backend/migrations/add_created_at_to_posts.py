from sqlalchemy import text
from database import engine

def run_migration():
    try:
        # Add created_at column to posts table
        with engine.connect() as connection:
            connection.execute(text("""
                ALTER TABLE posts 
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE 
                DEFAULT CURRENT_TIMESTAMP
            """))
            connection.commit()
            print("✅ Successfully added created_at column to posts table")
    except Exception as e:
        print(f"❌ Error adding created_at column to posts table: {str(e)}")
        raise e

if __name__ == "__main__":
    run_migration()
