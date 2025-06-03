from flask import Blueprint, jsonify, request, session
from ..services.movie_service import fetch_movie_by_id, fetch_movies

movie = Blueprint('movie', __name__)

@movie.route('/<int:movie_id>', methods=['GET'])
def get_single_movie(movie_id):
    movie = fetch_movie_by_id(movie_id)
    if not movie:
        return jsonify({'error': 'movie not found'}), 404
    return jsonify(movie), 200

@movie.route('/', methods=['GET'])
def get_movies():
    print(session.get('user_id'))
    sort_by = request.args.get('sort_by')
    order = request.args.get('order', 'asc')
    language = request.args.get('language')
    search = request.args.get('search')

    movies = fetch_movies(sort_by=sort_by, order=order, language=language, search=search)
    return jsonify(movies), 200

