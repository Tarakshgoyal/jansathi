"""Schemas for Geospatial Clustering API"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ==================== Request Schemas ====================

class RunClusteringRequest(BaseModel):
    """Request to run clustering algorithm"""
    
    algorithm: str = Field(
        default="dbscan",
        description="Clustering algorithm: 'dbscan' or 'hdbscan'"
    )
    min_cluster_size: int = Field(
        default=5,
        ge=2,
        description="Minimum points to form a cluster"
    )
    eps_meters: float = Field(
        default=500,
        ge=100,
        le=5000,
        description="Max distance between points in cluster (meters) - for DBSCAN"
    )


class MapClusterRequest(BaseModel):
    """Request to map a cluster to a parshad"""
    
    cluster_id: int = Field(..., description="ID of the cluster to map")
    parshad_id: int = Field(..., description="ID of the parshad to assign")
    cluster_name: Optional[str] = Field(
        None,
        max_length=255,
        description="Human-readable name (e.g., 'Ward 12 – Rajpur Road')"
    )
    area_description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Description of the area"
    )


class GeocodeAddressRequest(BaseModel):
    """Request to geocode an address"""
    
    address: str = Field(..., min_length=3, description="Street address or location")
    city: Optional[str] = Field(None, description="City name")
    state: Optional[str] = Field(None, description="State name")
    country: str = Field(default="India", description="Country name")


class FindParshadRequest(BaseModel):
    """Request to find parshad for a location"""
    
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)


# ==================== Response Schemas ====================

class ClusterInfo(BaseModel):
    """Information about a single cluster"""
    
    id: int
    cluster_label: int
    cluster_name: Optional[str] = None
    area_description: Optional[str] = None
    centroid_latitude: float
    centroid_longitude: float
    radius_meters: Optional[float] = None
    issue_count: int
    parshad_id: Optional[int] = None
    parshad_name: Optional[str] = None
    is_active: bool
    is_mapped: bool = Field(description="Whether cluster is mapped to a parshad")
    
    model_config = {"from_attributes": True}


class ClusterListResponse(BaseModel):
    """Response for cluster list"""
    
    total_clusters: int
    mapped_clusters: int
    unmapped_clusters: int
    total_issues_in_clusters: int
    clusters: list[ClusterInfo]


class ClusteringRunResponse(BaseModel):
    """Response after running clustering"""
    
    success: bool
    algorithm: str
    num_clusters_created: int
    num_noise_points: int
    total_points_processed: int
    message: str


class GeocodeResponse(BaseModel):
    """Response for geocoding"""
    
    success: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address_query: str
    message: str


class ReverseGeocodeResponse(BaseModel):
    """Response for reverse geocoding"""
    
    success: bool
    display_name: Optional[str] = None
    address: Optional[dict] = None
    message: str


class NearestClusterResponse(BaseModel):
    """Response when finding nearest cluster"""
    
    found: bool
    cluster: Optional[ClusterInfo] = None
    distance_meters: Optional[float] = None
    message: str


class ParshadLookupResponse(BaseModel):
    """Response when looking up parshad for a location"""
    
    found: bool
    parshad_id: Optional[int] = None
    parshad_name: Optional[str] = None
    parshad_mobile: Optional[str] = None
    parshad_village: Optional[str] = None
    cluster_name: Optional[str] = None
    distance_from_cluster_center: Optional[float] = None
    message: str


class AutoAssignResponse(BaseModel):
    """Response for auto-assignment"""
    
    success: bool
    issue_id: int
    assigned_parshad_id: Optional[int] = None
    assigned_parshad_name: Optional[str] = None
    cluster_name: Optional[str] = None
    distance_meters: Optional[float] = None
    message: str


class ClusterStatisticsResponse(BaseModel):
    """Response for cluster statistics"""
    
    total_clusters: int
    mapped_clusters: int
    unmapped_clusters: int
    total_issues_in_clusters: int
    clusters: list[dict]
