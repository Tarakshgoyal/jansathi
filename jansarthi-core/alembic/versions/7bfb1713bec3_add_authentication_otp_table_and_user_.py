"""add_authentication_otp_table_and_user_fields

Revision ID: 7bfb1713bec3
Revises: 3ca25aeb007d
Create Date: 2025-11-11 22:38:43.658379

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '7bfb1713bec3'
down_revision: Union[str, Sequence[str], None] = '3ca25aeb007d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new fields to users table
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    
    # Create OTP table
    op.create_table(
        'otps',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('mobile_number', sqlmodel.sql.sqltypes.AutoString(length=15), nullable=False),
        sa.Column('otp_code', sqlmodel.sql.sqltypes.AutoString(length=6), nullable=False),
        sa.Column('is_used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('attempt_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_otps_mobile_number'), 'otps', ['mobile_number'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop OTP table
    op.drop_index(op.f('ix_otps_mobile_number'), table_name='otps')
    op.drop_table('otps')
    
    # Remove new fields from users table
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'is_active')
