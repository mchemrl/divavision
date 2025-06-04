from .data_loader import load_movie_data, load_matrix
from .utils import cosine_similarity

def recommend_by_movie(movie_id, top_n=10):
    tfidf_matrix, movie_data = load_matrix()

    movie_index = next((i for i, m in enumerate(movie_data) if m['movie_id'] == movie_id), None)
    if movie_index is None:
        return list()
    return get_similar_movies(movie_data, tfidf_matrix, movie_index, top_n)

def get_similar_movies(movie_data, matrix, movie_index, top_n=10):
    cosine_sim = cosine_similarity(matrix[movie_index], matrix).flatten()
    cosine_sim[movie_index] = -1
    similar_indices = cosine_sim.argsort()[-top_n:][::-1]
    recommended = [movie_data[i] for i in similar_indices]
    return recommended

def recommend_by_genres(prefs, top_n=10):
    movies = load_movie_data()
    filtered = [m for m in movies if set(m['genres']).intersection(set(prefs))]
    sorted_movies = sorted(filtered, key=lambda m: m['avg_user_rating'], reverse=True)
    return sorted_movies[:top_n]

