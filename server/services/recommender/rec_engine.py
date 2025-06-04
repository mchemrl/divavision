from .content_based import recommend_by_movie
from .hybrid import recommend_for_user
from .fallback import popular_fallback

def content_based(movie_id):
    return recommend_by_movie(movie_id)

def hybrid(user_id):
    return recommend_for_user(user_id)

def fallback(sort_by="avg_user_rating"):
    return popular_fallback(sort_by)
