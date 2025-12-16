"""Geospatial Clustering Models for Ward/Parshad Mapping"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel


class GeoCluster(SQLModel, table=True):
    """
    Represents a geographic cluster (pseudo-ward) identified through clustering.
    Each cluster is mapped to a parshad/pradhan who is responsible for that area.
    """

    __tablename__ = "geo_clusters"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Cluster identification
    cluster_label: int = Field(index=True, description="Cluster ID from clustering algorithm")
    
    # Centroid of the cluster
    centroid_latitude: float = Field(ge=-90, le=90)
    centroid_longitude: float = Field(ge=-180, le=180)
    
    # Human-readable name (e.g., "Ward 12 – Rajpur Road")
    cluster_name: Optional[str] = Field(default=None, max_length=255)
    area_description: Optional[str] = Field(default=None, max_length=1000)
    
    # Assigned Parshad/Pradhan
    parshad_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)
    
    # Cluster statistics
    issue_count: int = Field(default=0, description="Number of issues in this cluster")
    radius_meters: Optional[float] = Field(default=None, description="Approximate radius of cluster")
    
    # Metadata
    is_active: bool = Field(default=True)
    last_updated: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
    )
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )


class ClusteringRun(SQLModel, table=True):
    """
    Tracks clustering algorithm runs for audit and re-clustering purposes.
    """

    __tablename__ = "clustering_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Algorithm used
    algorithm: str = Field(max_length=50, description="DBSCAN, HDBSCAN, KMeans")
    
    # Parameters used
    min_samples: Optional[int] = Field(default=None)
    eps: Optional[float] = Field(default=None, description="DBSCAN epsilon parameter")
    min_cluster_size: Optional[int] = Field(default=None, description="HDBSCAN min cluster size")
    
    # Results
    num_clusters: int = Field(default=0)
    num_noise_points: int = Field(default=0)
    total_points: int = Field(default=0)
    
    # Status
    status: str = Field(default="completed", max_length=50)
    
    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )


class IssueClusterAssignment(SQLModel, table=True):
    """
    Links issues to their assigned clusters for tracking and analysis.
    """

    __tablename__ = "issue_cluster_assignments"

    id: Optional[int] = Field(default=None, primary_key=True)
    
    issue_id: int = Field(foreign_key="issues.id", index=True)
    cluster_id: int = Field(foreign_key="geo_clusters.id", index=True)
    
    # Distance from cluster centroid (for confidence)
    distance_from_centroid: Optional[float] = Field(default=None, description="Distance in meters")
    
    # Assignment method
    assignment_method: str = Field(
        default="nearest_centroid",
        max_length=50,
        description="nearest_centroid, within_cluster, manual"
    )
    
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
