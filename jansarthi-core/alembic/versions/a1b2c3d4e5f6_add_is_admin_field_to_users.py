"""add role-based access and issue assignment fields

Revision ID: a1b2c3d4e5f6
Revises: e235db0401df
Create Date: 2024-12-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'e235db0401df'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create UserRole enum type
    user_role_enum = sa.Enum('user', 'pradhan', 'pwd_worker', name='userrole')
    user_role_enum.create(op.get_bind(), checkfirst=True)
    
    # Add role column to users table (replaces is_admin)
    op.add_column('users', sa.Column('role', user_role_enum, nullable=False, server_default='user'))
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    
    # Add location fields for Pradhans
    op.add_column('users', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('longitude', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('village_name', sa.String(length=255), nullable=True))
    
    # Add assignment fields to issues table
    op.add_column('issues', sa.Column('assigned_pradhan_id', sa.Integer(), nullable=True))
    op.add_column('issues', sa.Column('assignment_notes', sa.String(length=1000), nullable=True))
    op.add_column('issues', sa.Column('progress_notes', sa.String(length=2000), nullable=True))
    
    # Create foreign key for assigned_pradhan_id
    op.create_foreign_key(
        'fk_issues_assigned_pradhan_id', 
        'issues', 
        'users', 
        ['assigned_pradhan_id'], 
        ['id']
    )
    op.create_index(op.f('ix_issues_assigned_pradhan_id'), 'issues', ['assigned_pradhan_id'], unique=False)
    
    # Add 'assigned' status to IssueStatus enum
    # Note: For PostgreSQL, you need to add the new value to the existing enum
    op.execute("ALTER TYPE issuestatus ADD VALUE IF NOT EXISTS 'assigned' AFTER 'reported'")


def downgrade() -> None:
    # Remove foreign key and index from issues
    op.drop_constraint('fk_issues_assigned_pradhan_id', 'issues', type_='foreignkey')
    op.drop_index(op.f('ix_issues_assigned_pradhan_id'), table_name='issues')
    
    # Remove columns from issues
    op.drop_column('issues', 'progress_notes')
    op.drop_column('issues', 'assignment_notes')
    op.drop_column('issues', 'assigned_pradhan_id')
    
    # Remove location columns from users
    op.drop_column('users', 'village_name')
    op.drop_column('users', 'longitude')
    op.drop_column('users', 'latitude')
    
    # Remove role column and index
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_column('users', 'role')
    
    # Drop enum type
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)
    
    # Note: Cannot easily remove enum value from PostgreSQL, would need to recreate the enum
