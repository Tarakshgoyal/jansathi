"""
Cluster Management API Routes

This module provides endpoints for:
1. Running clustering algorithms on existing issues
2. Mapping clusters to parshads (bootstrap)
3. Geocoding addresses
4. Looking up parshad for a location
5. Viewing cluster statistics
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models.cluster import GeoCluster, IssueClusterAssignment
from app.models.issue import Issue, User, UserRole
from app.schemas.cluster import (
    AutoAssignResponse,
    ClusterInfo,
    ClusteringRunResponse,
    ClusterListResponse,
    ClusterStatisticsResponse,
    FindParshadRequest,
    GeocodeAddressRequest,
    GeocodeResponse,
    MapClusterRequest,
    NearestClusterResponse,
    ParshadLookupResponse,
    ReverseGeocodeResponse,
    RunClusteringRequest,
)
from app.services.auth import get_current_active_user
from app.services.clustering import (
    AutoAssignmentService,
    ClusterManagementService,
    GeocodingService,
    haversine_distance,
)

cluster_router = APIRouter(prefix="/api/clusters", tags=["Cluster Management"])


# ==================== Auth Dependencies ====================

async def get_pwd_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Verify user is a PWD Worker (admin access for cluster management)"""
    if current_user.role != UserRole.PWD_WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PWD Worker privileges required for cluster management"
        )
    return current_user


# ==================== Cluster Management Endpoints ====================

@cluster_router.post(
    "/run-clustering",
    response_model=ClusteringRunResponse,
    summary="Run clustering algorithm on existing issues",
)
async def run_clustering(
    request: RunClusteringRequest,
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Run a clustering algorithm on all existing issues to create geographic clusters.
    
    **PWD Worker Only**: This is an administrative operation.
    
    After running, clusters will need to be mapped to parshads using the 
    `/map-cluster` endpoint.
    
    Algorithms:
    - **dbscan**: Good for finding dense areas. Use `eps_meters` to control cluster size.
    - **hdbscan**: Better for varying densities. Automatically determines cluster sizes.
    """
    try:
        # Get issue count for reporting
        total_issues = session.exec(select(Issue)).all()
        
        num_clusters = ClusterManagementService.run_clustering_on_issues(
            session=session,
            algorithm=request.algorithm,
            min_cluster_size=request.min_cluster_size,
            eps_meters=request.eps_meters
        )
        
        return ClusteringRunResponse(
            success=True,
            algorithm=request.algorithm,
            num_clusters_created=num_clusters,
            num_noise_points=0,  # TODO: Track this properly
            total_points_processed=len(total_issues),
            message=f"Successfully created {num_clusters} clusters from {len(total_issues)} issues"
        )
        
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Clustering failed: {str(e)}"
        )


@cluster_router.post(
    "/map-cluster",
    response_model=ClusterInfo,
    summary="Map a cluster to a parshad",
)
async def map_cluster_to_parshad(
    request: MapClusterRequest,
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Map a cluster to a parshad for auto-assignment.
    
    **PWD Worker Only**: This is a one-time bootstrap operation.
    
    After mapping:
    - New issues in this cluster's area will be auto-assigned to the parshad
    - The cluster name will be shown as the ward name
    """
    success = ClusterManagementService.map_cluster_to_parshad(
        session=session,
        cluster_id=request.cluster_id,
        parshad_id=request.parshad_id,
        cluster_name=request.cluster_name,
        area_description=request.area_description
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to map cluster. Check cluster and parshad IDs."
        )
    
    # Return updated cluster
    cluster = session.get(GeoCluster, request.cluster_id)
    parshad = session.get(User, request.parshad_id)
    
    return ClusterInfo(
        id=cluster.id,
        cluster_label=cluster.cluster_label,
        cluster_name=cluster.cluster_name,
        area_description=cluster.area_description,
        centroid_latitude=cluster.centroid_latitude,
        centroid_longitude=cluster.centroid_longitude,
        radius_meters=cluster.radius_meters,
        issue_count=cluster.issue_count,
        parshad_id=cluster.parshad_id,
        parshad_name=parshad.name if parshad else None,
        is_active=cluster.is_active,
        is_mapped=cluster.parshad_id is not None
    )


@cluster_router.get(
    "/",
    response_model=ClusterListResponse,
    summary="Get all clusters",
)
async def get_all_clusters(
    active_only: bool = Query(True, description="Show only active clusters"),
    mapped_only: bool = Query(False, description="Show only mapped clusters"),
    session: Session = Depends(get_session),
):
    """
    Get list of all geographic clusters.
    
    **Public**: Anyone can view clusters (for transparency).
    """
    query = select(GeoCluster)
    
    if active_only:
        query = query.where(GeoCluster.is_active == True)
    
    if mapped_only:
        query = query.where(GeoCluster.parshad_id.isnot(None))
    
    clusters = session.exec(query).all()
    
    # Build response with parshad names
    cluster_infos = []
    for cluster in clusters:
        parshad_name = None
        if cluster.parshad_id:
            parshad = session.get(User, cluster.parshad_id)
            parshad_name = parshad.name if parshad else None
        
        cluster_infos.append(ClusterInfo(
            id=cluster.id,
            cluster_label=cluster.cluster_label,
            cluster_name=cluster.cluster_name,
            area_description=cluster.area_description,
            centroid_latitude=cluster.centroid_latitude,
            centroid_longitude=cluster.centroid_longitude,
            radius_meters=cluster.radius_meters,
            issue_count=cluster.issue_count,
            parshad_id=cluster.parshad_id,
            parshad_name=parshad_name,
            is_active=cluster.is_active,
            is_mapped=cluster.parshad_id is not None
        ))
    
    mapped = sum(1 for c in cluster_infos if c.is_mapped)
    
    return ClusterListResponse(
        total_clusters=len(cluster_infos),
        mapped_clusters=mapped,
        unmapped_clusters=len(cluster_infos) - mapped,
        total_issues_in_clusters=sum(c.issue_count for c in cluster_infos),
        clusters=cluster_infos
    )


@cluster_router.get(
    "/{cluster_id}",
    response_model=ClusterInfo,
    summary="Get cluster details",
)
async def get_cluster(
    cluster_id: int,
    session: Session = Depends(get_session),
):
    """Get details of a specific cluster."""
    cluster = session.get(GeoCluster, cluster_id)
    
    if not cluster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found"
        )
    
    parshad_name = None
    if cluster.parshad_id:
        parshad = session.get(User, cluster.parshad_id)
        parshad_name = parshad.name if parshad else None
    
    return ClusterInfo(
        id=cluster.id,
        cluster_label=cluster.cluster_label,
        cluster_name=cluster.cluster_name,
        area_description=cluster.area_description,
        centroid_latitude=cluster.centroid_latitude,
        centroid_longitude=cluster.centroid_longitude,
        radius_meters=cluster.radius_meters,
        issue_count=cluster.issue_count,
        parshad_id=cluster.parshad_id,
        parshad_name=parshad_name,
        is_active=cluster.is_active,
        is_mapped=cluster.parshad_id is not None
    )


# ==================== Geocoding Endpoints ====================

@cluster_router.post(
    "/geocode",
    response_model=GeocodeResponse,
    summary="Convert address to coordinates",
)
async def geocode_address(
    request: GeocodeAddressRequest,
):
    """
    Convert an address to latitude/longitude coordinates.
    
    Uses OpenStreetMap Nominatim for geocoding.
    
    **Tip**: Include city and state for better accuracy.
    """
    result = await GeocodingService.geocode_address(
        address=request.address,
        city=request.city,
        state=request.state,
        country=request.country
    )
    
    if result:
        lat, lon = result
        return GeocodeResponse(
            success=True,
            latitude=lat,
            longitude=lon,
            address_query=request.address,
            message="Address successfully geocoded"
        )
    
    return GeocodeResponse(
        success=False,
        latitude=None,
        longitude=None,
        address_query=request.address,
        message="Could not find coordinates for this address"
    )


@cluster_router.get(
    "/reverse-geocode",
    response_model=ReverseGeocodeResponse,
    summary="Convert coordinates to address",
)
async def reverse_geocode(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
):
    """
    Convert latitude/longitude coordinates to an address.
    
    Uses OpenStreetMap Nominatim for reverse geocoding.
    """
    result = await GeocodingService.reverse_geocode(latitude, longitude)
    
    if result and "display_name" in result:
        return ReverseGeocodeResponse(
            success=True,
            display_name=result.get("display_name"),
            address=result.get("address"),
            message="Coordinates successfully reverse geocoded"
        )
    
    return ReverseGeocodeResponse(
        success=False,
        display_name=None,
        address=None,
        message="Could not find address for these coordinates"
    )


# ==================== Parshad Lookup Endpoints ====================

@cluster_router.get(
    "/find-parshad",
    response_model=ParshadLookupResponse,
    summary="Find parshad for a location",
)
async def find_parshad_for_location(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    session: Session = Depends(get_session),
):
    """
    Find the parshad/pradhan responsible for a given location.
    
    This uses the cluster mapping to determine which parshad is responsible
    for the area containing the given coordinates.
    
    **Use Case**: Before reporting an issue, show user who their local representative is.
    """
    cluster = AutoAssignmentService.find_nearest_cluster(
        latitude, longitude, session
    )
    
    if not cluster:
        return ParshadLookupResponse(
            found=False,
            message="No cluster found for this location. Area may not be mapped yet."
        )
    
    parshad = session.get(User, cluster.parshad_id) if cluster.parshad_id else None
    
    if not parshad:
        return ParshadLookupResponse(
            found=False,
            cluster_name=cluster.cluster_name,
            message="Cluster found but no parshad assigned yet."
        )
    
    distance = haversine_distance(
        latitude, longitude,
        cluster.centroid_latitude, cluster.centroid_longitude,
        unit="meters"
    )
    
    return ParshadLookupResponse(
        found=True,
        parshad_id=parshad.id,
        parshad_name=parshad.name,
        parshad_mobile=parshad.mobile_number,
        parshad_village=parshad.village_name,
        cluster_name=cluster.cluster_name,
        distance_from_cluster_center=distance,
        message=f"Found parshad: {parshad.name}"
    )


@cluster_router.post(
    "/auto-assign/{issue_id}",
    response_model=AutoAssignResponse,
    summary="Auto-assign issue to parshad based on location",
)
async def auto_assign_issue(
    issue_id: int,
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Automatically assign an issue to a parshad based on its location.
    
    **PWD Worker Only**: Manual trigger for auto-assignment.
    
    This finds the nearest mapped cluster and assigns the issue to that cluster's parshad.
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    
    if issue.assigned_parshad_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Issue is already assigned to a parshad"
        )
    
    # Find nearest cluster
    cluster = AutoAssignmentService.find_nearest_cluster(
        issue.latitude, issue.longitude, session
    )
    
    if not cluster or not cluster.parshad_id:
        return AutoAssignResponse(
            success=False,
            issue_id=issue_id,
            message="No suitable cluster found for auto-assignment"
        )
    
    # Perform assignment
    parshad_id = AutoAssignmentService.auto_assign_issue(issue, session)
    
    if not parshad_id:
        return AutoAssignResponse(
            success=False,
            issue_id=issue_id,
            message="Auto-assignment failed"
        )
    
    parshad = session.get(User, parshad_id)
    distance = haversine_distance(
        issue.latitude, issue.longitude,
        cluster.centroid_latitude, cluster.centroid_longitude,
        unit="meters"
    )
    
    return AutoAssignResponse(
        success=True,
        issue_id=issue_id,
        assigned_parshad_id=parshad_id,
        assigned_parshad_name=parshad.name if parshad else None,
        cluster_name=cluster.cluster_name,
        distance_meters=distance,
        message=f"Issue assigned to {parshad.name if parshad else 'parshad'}"
    )


@cluster_router.get(
    "/statistics",
    response_model=ClusterStatisticsResponse,
    summary="Get cluster statistics",
)
async def get_cluster_statistics(
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Get comprehensive statistics about clusters.
    
    **PWD Worker Only**: Administrative view.
    """
    stats = ClusterManagementService.get_cluster_statistics(session)
    
    return ClusterStatisticsResponse(
        total_clusters=stats["total_clusters"],
        mapped_clusters=stats["mapped_clusters"],
        unmapped_clusters=stats["unmapped_clusters"],
        total_issues_in_clusters=stats["total_issues_in_clusters"],
        clusters=stats["clusters"]
    )
