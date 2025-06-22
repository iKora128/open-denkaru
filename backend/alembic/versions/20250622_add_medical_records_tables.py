"""Add medical records and templates tables

Revision ID: 20250622_add_medical_records_tables
Revises: 20250618_add_authentication_tables
Create Date: 2025-06-22 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250622_medical_records'
down_revision = '20250618_auth_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create medical_records table
    op.create_table('medical_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('visit_date', sa.Date(), nullable=False),
        sa.Column('visit_type', sa.String(), nullable=False),
        sa.Column('chief_complaint', sa.String(), nullable=False),
        sa.Column('subjective', sa.String(), nullable=False),
        sa.Column('objective', sa.String(), nullable=False),
        sa.Column('assessment', sa.String(), nullable=False),
        sa.Column('plan', sa.String(), nullable=False),
        sa.Column('blocks_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('editor_version', sa.String(), nullable=False),
        sa.Column('vital_signs', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('diagnosis_codes', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('next_visit_date', sa.Date(), nullable=True),
        sa.Column('follow_up_instructions', sa.String(), nullable=True),
        sa.Column('templates_used', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_suggestions_applied', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('signed_at', sa.DateTime(), nullable=True),
        sa.Column('signed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('private_notes', sa.String(), nullable=True),
        sa.Column('billing_notes', sa.String(), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('attending_physician', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('soap_content', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['patient.id'], ),
        sa.ForeignKeyConstraint(['signed_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create medical_templates table
    op.create_table('medical_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('visit_type', sa.String(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('blocks_template', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for better performance
    op.create_index('ix_medical_records_patient_id', 'medical_records', ['patient_id'])
    op.create_index('ix_medical_records_created_by', 'medical_records', ['created_by'])
    op.create_index('ix_medical_records_visit_date', 'medical_records', ['visit_date'])
    op.create_index('ix_medical_records_status', 'medical_records', ['status'])
    op.create_index('ix_medical_records_department', 'medical_records', ['department'])
    
    op.create_index('ix_medical_templates_department', 'medical_templates', ['department'])
    op.create_index('ix_medical_templates_visit_type', 'medical_templates', ['visit_type'])
    op.create_index('ix_medical_templates_is_public', 'medical_templates', ['is_public'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_medical_templates_is_public', table_name='medical_templates')
    op.drop_index('ix_medical_templates_visit_type', table_name='medical_templates')
    op.drop_index('ix_medical_templates_department', table_name='medical_templates')
    
    op.drop_index('ix_medical_records_department', table_name='medical_records')
    op.drop_index('ix_medical_records_status', table_name='medical_records')
    op.drop_index('ix_medical_records_visit_date', table_name='medical_records')
    op.drop_index('ix_medical_records_created_by', table_name='medical_records')
    op.drop_index('ix_medical_records_patient_id', table_name='medical_records')
    
    # Drop tables
    op.drop_table('medical_templates')
    op.drop_table('medical_records')