from typing import List
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from gensim.models import KeyedVectors

from app.models import Ride

fasttext_vectors = KeyedVectors.load("fastvec.bin")

def calculate_music_similarity(passengers: List[Ride], drivers: List[Ride]):
    """
    Calculate music similarity between users and drivers based on preferred genres.

    Args:
        passengers (List[Ride]): List of ride for passengers.
        drivers (List[Ride]): List of drivers.

    Returns:
        np.ndarray: Matrix of cosine similarities between users and drivers.
    """
    def get_playlist_embedding(preferred_genres):
        vectors = [fasttext_vectors[genre['name']] for genre in preferred_genres if genre['name'] in fasttext_vectors]
        return np.mean(vectors, axis=0) if vectors else np.zeros(fasttext_vectors.vector_size)
    

    if not passengers or not drivers:
        return np.zeros((len(passengers), len(drivers)))
    
    user_embeddings = [get_playlist_embedding(passenger["user"]["preferredGenres"]) for passenger in passengers]
    driver_embeddings = [get_playlist_embedding(driver["user"]["preferredGenres"]) for driver in drivers]

    user_embeddings = np.array(user_embeddings)
    driver_embeddings = np.array(driver_embeddings)

    if user_embeddings.size == 0 or driver_embeddings.size == 0:
        return np.zeros((len(passengers), len(drivers)))
    
  
    print("User embeddings shape:", user_embeddings.shape)
    print("Driver embeddings shape:", driver_embeddings.shape)
  

    return cosine_similarity(user_embeddings, driver_embeddings)

