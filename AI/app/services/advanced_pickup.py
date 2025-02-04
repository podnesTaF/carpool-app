import numpy as np
from collections import defaultdict
from geopy.distance import geodesic
from sklearn.cluster import DBSCAN

from app.services.pickup_utils import adjust_pickup_point
from app.services.validate_pickup import find_nearest_valid_pickup_point_google_http

def find_pickup_points(passenger_locations, max_distance=200):
    """
    Identifies pickup points for passengers who are near each other.
    :param passenger_locations: List of (latitude, longitude) tuples.
    :param max_distance: Maximum distance in meters to consider passengers as "near" each other.
    :return: Tuple (pickup_points, labels), where pickup_points is a list of centroids for clusters,
             and labels is a numpy array of cluster labels for each passenger.
    """
    if len(passenger_locations) < 2:
        return passenger_locations, np.array([-1] * len(passenger_locations)) 

    # Convert max_distance to kilometers for haversine
    max_distance_km = max_distance / 1000.0

    coords = np.array(passenger_locations)
    # Note: when using haversine, convert coordinates to radians
    clustering = DBSCAN(eps=max_distance_km / 6371, min_samples=2, metric='haversine').fit(np.radians(coords))
    labels = clustering.labels_
    unique_labels = set(labels)

    pickup_points = []
    for label in unique_labels:
        if label == -1:
            continue  # ignore noise
        # Compute the centroid of the cluster
        cluster_points = coords[labels == label]
        centroid = np.mean(cluster_points, axis=0)
        pickup_points.append(tuple(centroid))
    return pickup_points, labels

def assign_clustered_and_centralized_pickups(passengers, clustering_max_distance=200, driver_zone=2000):
    """
    Clusters passengers based on proximity and assigns a common pickup point for each cluster.
    Before finalizing a pickup point, the centroid is validated using the Google Roads API (via HTTP).
    If the candidate pickup is snapped to a valid road (within the search radius), that snapped point is used.
    Otherwise, the raw centroid is used as a fallback.
    
    :param passengers: List of (lat, lon) tuples for passengers.
    :param clustering_max_distance: Maximum distance (in meters) for clustering.
    :param driver_zone: Maximum allowed distance (in meters) between a passenger and the assigned pickup.
    :return: Tuple (assignments, final_pickup_points)
             - assignments: Dict mapping each original passenger coordinate -> assigned pickup coordinate.
             - final_pickup_points: List of unique pickup coordinates.
    """
    if len(passengers) == 1:
        p = tuple(passengers[0])
        snapped = find_nearest_valid_pickup_point_google_http(p[0], p[1])
        if snapped:
            assignments = {p: snapped}
            return assignments, [snapped]
        else:
            assignments = {p: p}
            return assignments, [p]
    
    _, labels = find_pickup_points(passengers, max_distance=clustering_max_distance)
    clusters = defaultdict(list)
    for p, label in zip(passengers, labels):
        clusters[label].append(p)
    
    assignments = {}
    final_pickup_points = []
    
    for label, cluster_passengers in clusters.items():
        if label == -1:
            # For noise points, snap each passenger individually.
            for p in cluster_passengers:
                snapped = find_nearest_valid_pickup_point_google_http(p[0], p[1])
                if snapped:
                    assignments[p] = snapped
                    if snapped not in final_pickup_points:
                        final_pickup_points.append(snapped)
                else:
                    assignments[p] = p
                    if p not in final_pickup_points:
                        final_pickup_points.append(p)
        else:
            # For a valid cluster, compute the centroid.
            centroid = tuple(np.mean(np.array(cluster_passengers), axis=0))
            # Snap the centroid using the Google Roads API.
            valid_centroid = find_nearest_valid_pickup_point_google_http(centroid[0], centroid[1])
            if valid_centroid:
                final_pickup = valid_centroid
            else:
                print(f"⚠ No valid road found near centroid {centroid}; using raw centroid.")
                final_pickup = centroid
            
            # For each passenger in the cluster, adjust if necessary.
            for p in cluster_passengers:
                if geodesic(p, final_pickup).meters > driver_zone:
                    adjusted = adjust_pickup_point(final_pickup, p, distance_meters=driver_zone)
                    assignments[p] = adjusted
                else:
                    assignments[p] = final_pickup
            if final_pickup not in final_pickup_points:
                final_pickup_points.append(final_pickup)
    
    return assignments, final_pickup_points