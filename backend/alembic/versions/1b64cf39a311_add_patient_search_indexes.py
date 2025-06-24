"""add_patient_search_indexes

Revision ID: 1b64cf39a311
Revises: 20250622_medical_records
Create Date: 2025-06-24 02:40:10.205806

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1b64cf39a311'
down_revision: Union[str, Sequence[str], None] = '20250622_medical_records'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add indexes for patient search performance."""
    # Individual B-tree indexes for exact matches and sorting
    op.create_index('idx_patients_family_name', 'patients', ['family_name'])
    op.create_index('idx_patients_given_name', 'patients', ['given_name'])
    op.create_index('idx_patients_family_name_kana', 'patients', ['family_name_kana'])
    op.create_index('idx_patients_given_name_kana', 'patients', ['given_name_kana'])
    op.create_index('idx_patients_patient_number', 'patients', ['patient_number'])
    op.create_index('idx_patients_phone_number', 'patients', ['phone_number'])
    op.create_index('idx_patients_email', 'patients', ['email'])
    op.create_index('idx_patients_gender', 'patients', ['gender'])
    
    # Composite index for common search patterns
    op.create_index('idx_patients_name_composite', 'patients', ['family_name', 'given_name'])
    op.create_index('idx_patients_kana_composite', 'patients', ['family_name_kana', 'given_name_kana'])
    
    # Text search index using PostgreSQL GIN for full-text search
    op.execute("""
        CREATE INDEX idx_patients_fulltext_search ON patients 
        USING gin(to_tsvector('simple', 
            COALESCE(family_name, '') || ' ' || 
            COALESCE(given_name, '') || ' ' || 
            COALESCE(family_name_kana, '') || ' ' || 
            COALESCE(given_name_kana, '') || ' ' || 
            COALESCE(patient_number, '') || ' ' || 
            COALESCE(phone_number, '') || ' ' || 
            COALESCE(email, '')
        ))
    """)
    
    # Index for active status and birth_date for age calculations
    op.create_index('idx_patients_active_birth_date', 'patients', ['is_active', 'birth_date'])


def downgrade() -> None:
    """Remove patient search indexes."""
    op.drop_index('idx_patients_active_birth_date')
    op.drop_index('idx_patients_fulltext_search')
    op.drop_index('idx_patients_kana_composite')
    op.drop_index('idx_patients_name_composite')
    op.drop_index('idx_patients_email')
    op.drop_index('idx_patients_phone_number')
    op.drop_index('idx_patients_patient_number')
    op.drop_index('idx_patients_given_name_kana')
    op.drop_index('idx_patients_family_name_kana')
    op.drop_index('idx_patients_given_name')
    op.drop_index('idx_patients_family_name')
    op.drop_index('idx_patients_gender')
