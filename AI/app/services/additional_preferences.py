import numpy as np
from typing import List

def calculate_smoking_similarity(passengers: List[dict], drivers: List[dict]) -> np.ndarray:
    """
    Compute a similarity matrix for smoking preferences between passengers and drivers.
    For each passenger-driver pair, returns 1.0 if they have the same 'isSmoking' value, else 0.0.
    
    Args:
        passengers (List[dict]): List of passenger dictionaries.
        drivers (List[dict]): List of driver dictionaries.
        
    Returns:
        np.ndarray: A matrix of shape (n_passengers, n_drivers) with similarity scores.
    """
    n_passengers = len(passengers)
    n_drivers = len(drivers)
    similarity_matrix = np.zeros((n_passengers, n_drivers))
    
    for i, passenger in enumerate(passengers):
        # Get the passenger's smoking preference; default to False if not set.
        p_smoking = passenger["user"]["smoking"]  or False
        for j, driver in enumerate(drivers):
            # Get the driver's smoking preference; default to False if not set.
            d_smoking = driver["user"]["smoking"] or False
            similarity_matrix[i][j] = 1.0 if p_smoking == d_smoking else 0.0
            
    return similarity_matrix


def calculate_talkative_similarity(passengers: List[dict], drivers: List[dict]) -> np.ndarray:
    """
    Compute a similarity matrix for talkativeness between passengers and drivers.
    For each passenger-driver pair, returns 1.0 if they have the same 'isTalkative' value, else 0.0.
    
    Args:
        passengers (List[dict]): List of passenger dictionaries.
        drivers (List[dict]): List of driver dictionaries.
        
    Returns:
        np.ndarray: A matrix of shape (n_passengers, n_drivers) with similarity scores.
    """
    n_passengers = len(passengers)
    n_drivers = len(drivers)
    similarity_matrix = np.zeros((n_passengers, n_drivers))
    
    for i, passenger in enumerate(passengers):
        p_talkative = passenger["user"]["talkative"]
        for j, driver in enumerate(drivers):
            d_talkative = driver["user"]["talkative"]
            similarity_matrix[i][j] = 1.0 if p_talkative == d_talkative else 0.0
            
    return similarity_matrix