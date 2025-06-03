from flask import Blueprint, jsonify, request, session
from ..services.review_service import create_review, change_review, delete_review, fetch_reviews
from ..utils.decorators import login_required

review = Blueprint('review', __name__)

@review.route('/', methods=['POST'])
def add_review():
    data = request.get_json()
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')
    rating = data.get('rating')
    review_text = data.get('review_text', '')

    if not movie_id:
        return jsonify({'error': 'movie_id is required'}), 400
    if rating is None:
        return jsonify({'error': 'rating is required'}), 400
    if not (0 <= rating <= 5):
        return jsonify({'error': 'rating must be between 0 and 5'}), 400

    create_review(user_id, movie_id, rating, review_text)
    return jsonify({'message': 'review created'}), 201

@review.route('/', methods=['DELETE'])
def remove_review():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401

    review_id = request.args.get('review_id', type=int)

    if not review_id:
        return jsonify({'error': 'review_id is required'}), 400

    delete_review(review_id, user_id)
    return jsonify({'message': 'review deleted'}), 200

@review.route('/', methods=['PUT'])
def update_review():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401

    data = request.json
    review_id = data.get('review_id')
    rating = data.get('rating')
    review_text = data.get('review_text')

    if not review_id:
        return jsonify({'error': 'review_id is required'}), 400
    if rating is not None and (rating < 0 or rating > 5):
        return jsonify({'error': 'rating must be between 0 and 5'}), 400

    change_review(review_id, user_id, rating, review_text)
    return jsonify({'message': 'review updated'}), 200

@review.route('/', methods=['GET'])
def get_reviews():
    user_id = request.args.get('user_id', type=int)
    movie_id = request.args.get('movie_id', type=int)
    keyword = request.args.get('keyword', type=str)
    rating_min = request.args.get('rating_min', type=int)
    rating_max = request.args.get('rating_max', type=int)
    sort_by = request.args.get('sort_by', default='created_at', type=str)
    limit = request.args.get('limit', default=10, type=int)

    reviews = fetch_reviews(user_id, movie_id, keyword, rating_min, rating_max, sort_by, limit)
    return jsonify(reviews), 200