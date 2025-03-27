"""add_notifications_relationship

Revision ID: 312241c9d294
Revises: c12122ec6393
Create Date: 2025-03-27 02:58:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '312241c9d294'
down_revision = 'c12122ec6393'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # No schema changes needed - just updating the relationship in the models
    pass

def downgrade() -> None:
    # No schema changes to revert
    pass
