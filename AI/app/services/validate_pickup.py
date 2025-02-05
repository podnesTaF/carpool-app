import requests
from os import getenv

# Your API key: ensure it is set in your environment.
API_KEY = getenv("GMAPS_API_KEY")

def find_nearest_valid_pickup_point_google_http(lat, lon, api_key=API_KEY, timeout=10):
    """
    Snaps a single point to the nearest road using the Google Roads API via HTTP.
    
    The API expects the parameter "points" as a pipe-separated list of "lat,lon" pairs.
    For a single point, we format it as "lat,lon". This function then returns the location
    from the last snapped point in the response.
    
    :param lat: Latitude of the candidate pickup point.
    :param lon: Longitude of the candidate pickup point.
    :param api_key: Your Google API key.
    :param timeout: Request timeout in seconds.
    :return: A tuple (latitude, longitude) of the snapped point, or None if not found.
    """
    url = "https://roads.googleapis.com/v1/nearestRoads"
    # Format the point as "lat,lon"
    points_str = f"{lat},{lon}"
    params = {
        "points": points_str,
        "key": api_key
    }
    try:
        response = requests.get(url, params=params, timeout=timeout)
        response.raise_for_status()
        data = response.json()
        snapped_points = data.get("snappedPoints", [])
        if snapped_points:
            # Return the location of the last snapped point.
            last_location = snapped_points[-1]["location"]
            print(f"Debug: Snapped location for ({lat}, {lon}): {last_location}")
            return (last_location["latitude"], last_location["longitude"])
        else:
            print(f"Debug: No snapped points returned for ({lat}, {lon}).")
            return None
    except Exception as e:
        print(f"Error calling Google Roads API: {e}")
        return None