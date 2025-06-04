import numpy as np

from .data_loader import load_matrix, load_user_data
from .fallback import popular_fallback
from .content_based import recommend_by_genres
from .utils import cosine_similarity

def recommend_for_user(user_id):
    user_data = load_user_data(user_id)

    rated_movies = user_data["high_rated_movies"]
    prefs = user_data["top_genres"]

    if rated_movies:
        tfidf_matrix, movie_data = load_matrix()
        return recommend_based_on_rated(tfidf_matrix, movie_data, rated_movies)
    elif prefs:
        return recommend_by_genres(prefs)
    else:
        return popular_fallback("review_count")


def recommend_based_on_rated(tfidf_matrix, movie_data, rated_movies, top_n=10):
    movie_id_to_index = {movie['movie_id']: idx for idx, movie in enumerate(movie_data)}
    rated_indices = [movie_id_to_index[movie_id] for movie_id in rated_movies if movie_id in movie_id_to_index]

    if not rated_indices:
        return list()

    rated_vectors = tfidf_matrix[rated_indices]
    similarity_matrix = cosine_similarity(rated_vectors, tfidf_matrix)
    similarity_scores = similarity_matrix.sum(axis=0)

    for idx in rated_indices:
        similarity_scores[idx] = -1

    recommended = []
    sorted_indices = np.argsort(similarity_scores)[::-1]

    for idx in sorted_indices:
        movie = movie_data[idx]
        if movie['movie_id'] not in rated_movies:
            recommended.append(movie)
        if len(recommended) >= top_n:
            break

    return recommended