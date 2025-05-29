from flask import Blueprint, session, jsonify, request
from ..utils.decorators import login_required

movie = Blueprint('movie', __name__)


@movie.route('/<int:movie_id>', methods=['GET'])
def get_single_movie(movie_id):
    pass

@movie.route('/', methods=['GET'])
def get_movies():
    pass

