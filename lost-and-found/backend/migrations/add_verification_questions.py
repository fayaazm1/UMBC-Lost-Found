"""
Migration script to add verification_questions column to posts table
"""
import asyncio
import asyncpg
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use the provided database URL
DATABASE_URL = "postgresql://lost_and_found_db_user:IxZwc01Ig3vav9hfZPYXQ4nX32J6udO8@dpg-cvirco2dbo4c73ceei30-a.virginia-postgres.render.com/lost_and_found_db"

async def run_migration():
    logger.info("Starting migration to add verification_questions column to posts table")
    
    try:
        # Connect to the database
        conn = await asyncpg.connect(DATABASE_URL)
        
        # Check if the column already exists
        column_exists = await conn.fetchval(
            """
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = 'posts' AND column_name = 'verification_questions'
            );
            """
        )
        
        if column_exists:
            logger.info("Column verification_questions already exists in posts table")
        else:
            # Add the verification_questions column
            await conn.execute(
                """
                ALTER TABLE posts 
                ADD COLUMN verification_questions JSONB DEFAULT NULL;
                """
            )
            logger.info("Successfully added verification_questions column to posts table")
        
        await conn.close()
        logger.info("Migration completed successfully")
        
    except Exception as e:
        logger.error(f"Error during migration: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(run_migration())
