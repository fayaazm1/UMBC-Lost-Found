import os
import importlib.util
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migrations():
    """Run all migration scripts in the migrations directory"""
    migrations_dir = os.path.join(os.path.dirname(__file__), 'migrations')
    
    # Get all Python files in migrations directory
    migration_files = [f for f in os.listdir(migrations_dir) 
                      if f.endswith('.py') and f != '__init__.py']
    
    # Sort migration files to ensure consistent order
    migration_files.sort()
    
    for migration_file in migration_files:
        logger.info(f"Running migration: {migration_file}")
        
        # Get full path to migration file
        file_path = os.path.join(migrations_dir, migration_file)
        
        try:
            # Load migration module
            spec = importlib.util.spec_from_file_location(
                migration_file[:-3], file_path
            )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Run migration
            if hasattr(module, 'run_migration'):
                module.run_migration()
                logger.info(f" Successfully ran migration: {migration_file}")
            else:
                logger.warning(
                    f" No run_migration function found in {migration_file}"
                )
                
        except Exception as e:
            logger.error(f" Error running migration {migration_file}: {str(e)}")
            raise e

if __name__ == "__main__":
    run_migrations()
