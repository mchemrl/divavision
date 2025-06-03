from flask import Blueprint, session, jsonify, request
from ..utils.decorators import login_required
from ..services.profile_service import (fetch_user_by_id, change_user, fetch_user_lists_by_filter,
                                        follow_user, unfollow_user, fetch_stats,
                                        fetch_following, fetch_followers, fetch_user_badges)
from ..services.list_service import fetch_list_by_id, get_def_list_id

profile = Blueprint('profile', __name__)

@profile.route('/me', methods=['GET'])
@login_required
def get_my_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401
    profile_data = fetch_user_by_id(user_id)
    if profile_data is None:
        return jsonify({'error': 'user not found'}), 404

    return jsonify(profile_data), 200

@profile.route('/me', methods=['PUT'])
@login_required
def update_my_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401
    data = request.json
    if not data:
        return jsonify({'error': 'no data provided'}), 404
    updated_profile = change_user(user_id, data)
    if not updated_profile:
        return jsonify({'error': 'update failed'}), 404
    return jsonify({'message': 'profile updated successfully', 'profile': updated_profile}), 200


@profile.route('/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    profile_data = fetch_user_by_id(user_id)
    if profile_data is None:
        return jsonify({'error': 'user not found'}), 404

    return jsonify(profile_data), 200

@profile.route('/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    stats = fetch_stats(user_id)
    if stats is None:
        return jsonify({"error": "user not found"}), 404
    return jsonify(stats), 200


@profile.route('/<int:user_id>/lists', methods=['GET'])
def get_user_lists(user_id):
    search = request.args.get("search")
    user_lists = fetch_user_lists_by_filter(user_id, is_default=False, search_title=search)
    return jsonify({'lists': user_lists}), 200

@profile.route('/<int:user_id>/favorites', methods=['GET'])
def get_user_favorites(user_id):
    user_favs = fetch_user_lists_by_filter(user_id, is_default=True, title="Favourites")
    return jsonify({'favorites': user_favs}), 200


@profile.route('/<int:user_id>/watched', methods=['GET'])
def get_user_watched(user_id):
    user_watched = fetch_list_by_id(get_def_list_id(user_id, "Watched"))
    return jsonify({'watched': user_watched}), 200

@profile.route('/<int:user_id>/badges', methods=['GET'])
def get_user_badges(user_id):
    user_badges = fetch_list_by_id(get_def_list_id(user_id, "Favourites"))
    return jsonify({'badges': user_badges}), 200

@profile.route('/<int:user_id>/followers', methods=['GET'])
def get_user_followers(user_id):
    followers = fetch_followers(user_id)
    return jsonify(followers), 200

@profile.route('/<int:user_id>/following', methods=['GET'])
def get_user_following(user_id):
    following = fetch_following(user_id)
    return jsonify(following), 200

@profile.route('/<int:followed_id>/follow', methods=['POST'])
@login_required
def follow(followed_id):
    follower_id = session.get('user_id')
    try:
        follow_user(follower_id, followed_id)
        return jsonify({'message': 'followed'}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@profile.route('/<int:followed_id>/unfollow', methods=['DELETE'])
@login_required
def unfollow(followed_id):
    follower_id = session.get('user_id')
    unfollow_user(follower_id, followed_id)
    return jsonify({'message': 'unfollowed'}), 200
