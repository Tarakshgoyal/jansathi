"""Add geospatial clustering tables

Revision ID: 2024121601_clustering
Revises: 559594138120
Create Date: 2024-12-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2024121601_clustering'
down_revision: Union[str, None] = '559594138120'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create geo_clusters table
    op.create_table(
        'geo_clusters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cluster_label', sa.Integer(), nullable=False),
        sa.Column('centroid_latitude', sa.Float(), nullable=False),
        sa.Column('centroid_longitude', sa.Float(), nullable=False),
        sa.Column('cluster_name', sa.String(length=255), nullable=True),
        sa.Column('area_description', sa.String(length=1000), nullable=True),
        sa.Column('parshad_id', sa.Integer(), nullable=True),
        sa.Column('issue_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('radius_meters', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_updated', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['parshad_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_geo_clusters_cluster_label'), 'geo_clusters', ['cluster_label'], unique=False)
    op.create_index(op.f('ix_geo_clusters_parshad_id'), 'geo_clusters', ['parshad_id'], unique=False)

    # Create clustering_runs table
    op.create_table(
        'clustering_runs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('algorithm', sa.String(length=50), nullable=False),
        sa.Column('min_samples', sa.Integer(), nullable=True),
        sa.Column('eps', sa.Float(), nullable=True),
        sa.Column('min_cluster_size', sa.Integer(), nullable=True),
        sa.Column('num_clusters', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('num_noise_points', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('total_points', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='completed'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create issue_cluster_assignments table
    op.create_table(
        'issue_cluster_assignments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('issue_id', sa.Integer(), nullable=False),
        sa.Column('cluster_id', sa.Integer(), nullable=False),
        sa.Column('distance_from_centroid', sa.Float(), nullable=True),
        sa.Column('assignment_method', sa.String(length=50), nullable=False, server_default='nearest_centroid'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['cluster_id'], ['geo_clusters.id'], ),
        sa.ForeignKeyConstraint(['issue_id'], ['issues.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_issue_cluster_assignments_cluster_id'), 'issue_cluster_assignments', ['cluster_id'], unique=False)
    op.create_index(op.f('ix_issue_cluster_assignments_issue_id'), 'issue_cluster_assignments', ['issue_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_issue_cluster_assignments_issue_id'), table_name='issue_cluster_assignments')
    op.drop_index(op.f('ix_issue_cluster_assignments_cluster_id'), table_name='issue_cluster_assignments')
    op.drop_table('issue_cluster_assignments')
    op.drop_table('clustering_runs')
    op.drop_index(op.f('ix_geo_clusters_parshad_id'), table_name='geo_clusters')
    op.drop_index(op.f('ix_geo_clusters_cluster_label'), table_name='geo_clusters')
    op.drop_table('geo_clusters')
