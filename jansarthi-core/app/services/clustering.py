"""
Geospatial Clustering Service

This service handles:
1. Geocoding addresses to coordinates (using OpenStreetMap/Nominatim)
2. Clustering issues geographically using HDBSCAN/DBSCAN
3. Mapping clusters to parshads
4. Auto-assigning issues to nearest cluster/parshad
"""

import math
from datetime import datetime, timezone
from typing import Optional, Tuple

import httpx
import numpy as np
from sqlmodel import Session, select

from app.models.cluster import ClusteringRun, GeoCluster, IssueClusterAssignment
from app.models.issue import Issue, IssueStatus, User, UserRole


# ==================== Constants ====================

EARTH_RADIUS_KM = 6371.0
EARTH_RADIUS_M = 6371000.0


# ==================== Geocoding Service ====================

class GeocodingService:
    """
    Service for converting addresses to coordinates using OpenStreetMap Nominatim.
    """
    
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
    
    @classmethod
    async def geocode_address(
        cls,
        address: str,
        city: Optional[str] = None,
        state: Optional[str] = None,
        country: str = "India"
    ) -> Optional[Tuple[float, float]]:
        """
        Convert an address to latitude/longitude coordinates.
        
        Args:
            address: Street address or location name
            city: City name (optional but recommended)
            state: State name (optional)
            country: Country name (default: India)
            
        Returns:
            Tuple of (latitude, longitude) or None if not found
        """
        # Build the query
        query_parts = [address]
        if city:
            query_parts.append(city)
        if state:
            query_parts.append(state)
        query_parts.append(country)
        
        query = ", ".join(query_parts)
        
        params = {
            "q": query,
            "format": "json",
            "limit": 1,
            "addressdetails": 1,
        }
        
        headers = {
            "User-Agent": "Jansarthi-API/1.0 (https://jansarthi.in)"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    cls.NOMINATIM_URL,
                    params=params,
                    headers=headers,
                    timeout=10.0
                )
                response.raise_for_status()
                
                data = response.json()
                if data and len(data) > 0:
                    result = data[0]
                    return (float(result["lat"]), float(result["lon"]))
                    
        except Exception as e:
            print(f"Geocoding error: {e}")
            
        return None
    
    @classmethod
    async def reverse_geocode(
        cls,
        latitude: float,
        longitude: float
    ) -> Optional[dict]:
        """
        Convert coordinates to an address.
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            Address details dictionary or None
        """
        url = "https://nominatim.openstreetmap.org/reverse"
        
        params = {
            "lat": latitude,
            "lon": longitude,
            "format": "json",
            "addressdetails": 1,
        }
        
        headers = {
            "User-Agent": "Jansarthi-API/1.0 (https://jansarthi.in)"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=10.0
                )
                response.raise_for_status()
                return response.json()
                
        except Exception as e:
            print(f"Reverse geocoding error: {e}")
            
        return None


# ==================== Distance Calculations ====================

def haversine_distance(
    lat1: float, lon1: float,
    lat2: float, lon2: float,
    unit: str = "meters"
) -> float:
    """
    Calculate the great-circle distance between two points on Earth.
    
    Args:
        lat1, lon1: First point coordinates
        lat2, lon2: Second point coordinates
        unit: "meters" or "km"
        
    Returns:
        Distance in the specified unit
    """
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(delta_lat / 2) ** 2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    if unit == "km":
        return EARTH_RADIUS_KM * c
    return EARTH_RADIUS_M * c


# ==================== Clustering Service ====================

class ClusteringService:
    """
    Service for geospatial clustering of issues.
    Uses HDBSCAN for automatic cluster detection.
    """
    
    @classmethod
    def run_hdbscan_clustering(
        cls,
        coordinates: np.ndarray,
        min_cluster_size: int = 5,
        min_samples: int = 3
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Run HDBSCAN clustering on coordinates.
        
        Args:
            coordinates: NumPy array of shape (n, 2) with [lat, lon]
            min_cluster_size: Minimum number of points to form a cluster
            min_samples: Minimum samples in a neighborhood
            
        Returns:
            Tuple of (labels, probabilities)
        """
        try:
            import hdbscan
        except ImportError:
            raise ImportError("hdbscan not installed. Run: pip install hdbscan")
        
        # Convert lat/lon to radians for proper distance calculation
        coords_rad = np.radians(coordinates)
        
        # Use haversine metric for geographic distances
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=min_cluster_size,
            min_samples=min_samples,
            metric='haversine',
            cluster_selection_epsilon=0.0,  # Let HDBSCAN decide
        )
        
        labels = clusterer.fit_predict(coords_rad)
        probabilities = clusterer.probabilities_
        
        return labels, probabilities
    
    @classmethod
    def run_dbscan_clustering(
        cls,
        coordinates: np.ndarray,
        eps_meters: float = 500,  # 500 meters default
        min_samples: int = 3
    ) -> np.ndarray:
        """
        Run DBSCAN clustering on coordinates.
        
        Args:
            coordinates: NumPy array of shape (n, 2) with [lat, lon]
            eps_meters: Maximum distance between points in same cluster (meters)
            min_samples: Minimum samples to form a cluster
            
        Returns:
            Cluster labels array
        """
        try:
            from sklearn.cluster import DBSCAN
            from sklearn.metrics.pairwise import haversine_distances
        except ImportError:
            raise ImportError("scikit-learn not installed. Run: pip install scikit-learn")
        
        # Convert meters to radians for haversine
        eps_radians = eps_meters / EARTH_RADIUS_M
        
        # Convert coordinates to radians
        coords_rad = np.radians(coordinates)
        
        clusterer = DBSCAN(
            eps=eps_radians,
            min_samples=min_samples,
            metric='haversine'
        )
        
        labels = clusterer.fit_predict(coords_rad)
        return labels
    
    @classmethod
    def calculate_cluster_centroids(
        cls,
        coordinates: np.ndarray,
        labels: np.ndarray
    ) -> dict[int, Tuple[float, float]]:
        """
        Calculate centroid for each cluster.
        
        Args:
            coordinates: NumPy array of [lat, lon] pairs
            labels: Cluster labels (-1 for noise)
            
        Returns:
            Dict mapping cluster_id to (centroid_lat, centroid_lon)
        """
        centroids = {}
        unique_labels = set(labels)
        
        for label in unique_labels:
            if label == -1:  # Skip noise points
                continue
                
            mask = labels == label
            cluster_coords = coordinates[mask]
            
            centroid_lat = np.mean(cluster_coords[:, 0])
            centroid_lon = np.mean(cluster_coords[:, 1])
            
            centroids[label] = (centroid_lat, centroid_lon)
            
        return centroids
    
    @classmethod
    def calculate_cluster_radius(
        cls,
        coordinates: np.ndarray,
        labels: np.ndarray,
        centroids: dict[int, Tuple[float, float]]
    ) -> dict[int, float]:
        """
        Calculate approximate radius for each cluster.
        
        Returns:
            Dict mapping cluster_id to radius in meters
        """
        radii = {}
        
        for label, (cent_lat, cent_lon) in centroids.items():
            mask = labels == label
            cluster_coords = coordinates[mask]
            
            max_distance = 0
            for coord in cluster_coords:
                dist = haversine_distance(
                    cent_lat, cent_lon,
                    coord[0], coord[1],
                    unit="meters"
                )
                max_distance = max(max_distance, dist)
            
            radii[label] = max_distance
            
        return radii


# ==================== Auto-Assignment Service ====================

class AutoAssignmentService:
    """
    Service for automatically assigning issues to parshads based on clusters.
    """
    
    @classmethod
    def find_nearest_cluster(
        cls,
        latitude: float,
        longitude: float,
        session: Session,
        max_distance_meters: float = 5000  # 5km default max
    ) -> Optional[GeoCluster]:
        """
        Find the nearest active cluster to given coordinates.
        
        Args:
            latitude: Issue latitude
            longitude: Issue longitude
            session: Database session
            max_distance_meters: Maximum distance to consider
            
        Returns:
            Nearest GeoCluster or None if none within max_distance
        """
        # Get all active clusters
        clusters = session.exec(
            select(GeoCluster).where(
                GeoCluster.is_active == True,
                GeoCluster.parshad_id.isnot(None)  # Only clusters with assigned parshad
            )
        ).all()
        
        if not clusters:
            return None
        
        nearest_cluster = None
        min_distance = float('inf')
        
        for cluster in clusters:
            distance = haversine_distance(
                latitude, longitude,
                cluster.centroid_latitude, cluster.centroid_longitude,
                unit="meters"
            )
            
            if distance < min_distance and distance <= max_distance_meters:
                min_distance = distance
                nearest_cluster = cluster
        
        return nearest_cluster
    
    @classmethod
    def auto_assign_issue(
        cls,
        issue: Issue,
        session: Session,
        max_distance_meters: float = 5000
    ) -> Optional[int]:
        """
        Automatically assign an issue to a parshad based on location.
        
        Args:
            issue: The issue to assign
            session: Database session
            max_distance_meters: Maximum distance to consider
            
        Returns:
            Assigned parshad_id or None if no suitable cluster found
        """
        # Find nearest cluster
        cluster = cls.find_nearest_cluster(
            issue.latitude,
            issue.longitude,
            session,
            max_distance_meters
        )
        
        if not cluster or not cluster.parshad_id:
            return None
        
        # Calculate distance for tracking
        distance = haversine_distance(
            issue.latitude, issue.longitude,
            cluster.centroid_latitude, cluster.centroid_longitude,
            unit="meters"
        )
        
        # Create assignment record
        assignment = IssueClusterAssignment(
            issue_id=issue.id,
            cluster_id=cluster.id,
            distance_from_centroid=distance,
            assignment_method="nearest_centroid"
        )
        session.add(assignment)
        
        # Update issue
        issue.assigned_parshad_id = cluster.parshad_id
        issue.status = IssueStatus.ASSIGNED
        issue.ward_name = cluster.cluster_name
        
        # Update cluster statistics
        cluster.issue_count += 1
        
        session.add(issue)
        session.add(cluster)
        session.commit()
        
        return cluster.parshad_id
    
    @classmethod
    def get_parshad_for_location(
        cls,
        latitude: float,
        longitude: float,
        session: Session
    ) -> Optional[User]:
        """
        Get the parshad responsible for a given location.
        
        Returns:
            User object of the parshad or None
        """
        cluster = cls.find_nearest_cluster(latitude, longitude, session)
        
        if not cluster or not cluster.parshad_id:
            return None
        
        parshad = session.get(User, cluster.parshad_id)
        return parshad


# ==================== Cluster Management Service ====================

class ClusterManagementService:
    """
    Service for managing clusters - creation, updates, and parshad mapping.
    """
    
    @classmethod
    def run_clustering_on_issues(
        cls,
        session: Session,
        algorithm: str = "dbscan",
        min_cluster_size: int = 5,
        eps_meters: float = 500
    ) -> int:
        """
        Run clustering on all existing issues to create/update clusters.
        
        Returns:
            Number of clusters created
        """
        # Get all issues with coordinates
        issues = session.exec(select(Issue)).all()
        
        if len(issues) < min_cluster_size:
            print(f"Not enough issues ({len(issues)}) for clustering")
            return 0
        
        # Extract coordinates
        coordinates = np.array([
            [issue.latitude, issue.longitude]
            for issue in issues
        ])
        
        # Run clustering
        if algorithm.lower() == "hdbscan":
            labels, _ = ClusteringService.run_hdbscan_clustering(
                coordinates,
                min_cluster_size=min_cluster_size
            )
        else:  # dbscan
            labels = ClusteringService.run_dbscan_clustering(
                coordinates,
                eps_meters=eps_meters,
                min_samples=min_cluster_size
            )
        
        # Calculate centroids and radii
        centroids = ClusteringService.calculate_cluster_centroids(coordinates, labels)
        radii = ClusteringService.calculate_cluster_radius(coordinates, labels, centroids)
        
        # Count points per cluster
        unique, counts = np.unique(labels[labels >= 0], return_counts=True)
        cluster_counts = dict(zip(unique, counts))
        
        # Deactivate old clusters
        old_clusters = session.exec(select(GeoCluster)).all()
        for cluster in old_clusters:
            cluster.is_active = False
            session.add(cluster)
        
        # Create new clusters
        num_clusters = 0
        for label, (cent_lat, cent_lon) in centroids.items():
            cluster = GeoCluster(
                cluster_label=label,
                centroid_latitude=cent_lat,
                centroid_longitude=cent_lon,
                cluster_name=f"Cluster {label + 1}",
                issue_count=int(cluster_counts.get(label, 0)),
                radius_meters=radii.get(label),
                is_active=True
            )
            session.add(cluster)
            num_clusters += 1
        
        # Log the run
        run = ClusteringRun(
            algorithm=algorithm,
            min_samples=min_cluster_size,
            eps=eps_meters if algorithm == "dbscan" else None,
            min_cluster_size=min_cluster_size if algorithm == "hdbscan" else None,
            num_clusters=num_clusters,
            num_noise_points=int(np.sum(labels == -1)),
            total_points=len(issues),
            status="completed"
        )
        session.add(run)
        
        session.commit()
        
        return num_clusters
    
    @classmethod
    def map_cluster_to_parshad(
        cls,
        session: Session,
        cluster_id: int,
        parshad_id: int,
        cluster_name: Optional[str] = None,
        area_description: Optional[str] = None
    ) -> bool:
        """
        Map a cluster to a parshad (one-time bootstrap operation).
        
        Returns:
            True if successful, False otherwise
        """
        cluster = session.get(GeoCluster, cluster_id)
        if not cluster:
            return False
        
        # Verify parshad exists and has correct role
        parshad = session.get(User, parshad_id)
        if not parshad or parshad.role != UserRole.PARSHAD:
            return False
        
        cluster.parshad_id = parshad_id
        if cluster_name:
            cluster.cluster_name = cluster_name
        if area_description:
            cluster.area_description = area_description
        
        session.add(cluster)
        session.commit()
        
        return True
    
    @classmethod
    def get_cluster_statistics(
        cls,
        session: Session
    ) -> dict:
        """
        Get statistics about current clusters.
        """
        clusters = session.exec(
            select(GeoCluster).where(GeoCluster.is_active == True)
        ).all()
        
        total_issues = sum(c.issue_count for c in clusters)
        mapped_clusters = sum(1 for c in clusters if c.parshad_id is not None)
        
        return {
            "total_clusters": len(clusters),
            "mapped_clusters": mapped_clusters,
            "unmapped_clusters": len(clusters) - mapped_clusters,
            "total_issues_in_clusters": total_issues,
            "clusters": [
                {
                    "id": c.id,
                    "label": c.cluster_label,
                    "name": c.cluster_name,
                    "centroid": [c.centroid_latitude, c.centroid_longitude],
                    "radius_meters": c.radius_meters,
                    "issue_count": c.issue_count,
                    "parshad_id": c.parshad_id,
                    "is_mapped": c.parshad_id is not None
                }
                for c in clusters
            ]
        }
