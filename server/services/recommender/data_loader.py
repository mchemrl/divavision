import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from ..movie_service import fetch_movies
from .utils import user_top_genres, user_high_rated_movies

def load_movie_data():
    return fetch_movies()

def load_matrix():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    tfidf_path = os.path.join(data_dir, "tfidf_matrix.pkl")
    movie_data_path = os.path.join(data_dir, "movie_data.pkl")

    try:
        with open(tfidf_path, "rb") as f:
            tfidf_matrix = pickle.load(f)
        with open(movie_data_path, "rb") as f:
            movie_data = pickle.load(f)
        return tfidf_matrix, movie_data
    except FileNotFoundError:
        movies = load_movie_data()
        corpus = list()
        for movie in movies:
            text = " ".join([
                movie['title'] or "",
                (movie['description'] or "") * 2,
                movie['tagline'] or "",
                " ".join(movie['genres']) or ""])
            corpus.append(text.lower())

        vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        tfidf_matrix = vectorizer.fit_transform(corpus)

        with open(tfidf_path, "wb") as f:
            pickle.dump(tfidf_matrix, f)
        with open(movie_data_path, "wb") as f:
            pickle.dump(movies, f)

        return tfidf_matrix, movies

def load_user_data(user_id):
    high_rated = user_high_rated_movies(user_id)
    top_genres = user_top_genres(user_id)
    return {
        "high_rated_movies": high_rated,
        "top_genres": top_genres
    }
