from flask import Blueprint, session, jsonify, request
from ..utils.decorators import login_required
from ..services.recommender import rec_engine

rec = Blueprint('recommendations', __name__)

@rec.route('/', methods=['GET'])
def recommend():
    user_id = session.get('user_id')
    movie_id = request.args.get("movie_id", type=int)

    if user_id:
        return rec_engine.hybrid(user_id)
    elif movie_id:
        return rec_engine.content_based(movie_id)
    else:
        return rec_engine.fallback()

