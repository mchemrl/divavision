from flask import Blueprint, request, session, jsonify
from ..utils.decorators import login_required

profile = Blueprint('profile', __name__)

@profile.route('/me', methods=['GET'])
@login_required
def get_my_profile():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unathorized'}), 401

    profile_data = get_user_profile(user_id)
    if not profile_data:
        return jsonify({'error': 'user not found'}), 404

    return jsonify({'profile': profile_data}), 200

@profile.route('/me', methods=['PUT'])
def update_my_profile():
    pass

@profile.route('/<string:username>', methods=['GET'])
def get_user_profile(username):
    pass

@profile.route('/<string:username>/stats', methods=['GET'])
def get_user_stats(username):
    pass

@profile.route('/<string:username>/activity', methods=['GET'])
def get_user_activity(username):
    pass

@profile.route('/<string:username>/lists', methods=['GET'])
def get_user_lists(username):
    pass

@profile.route('/<string:username>/favorites', methods=['GET'])
def get_user_favorites(username):
    pass

@profile.route('/<string:username>/followers', methods=['GET'])
def get_user_followers(username):
    pass

@profile.route('/<string:username>/follow', methods=['POST'])
def follow_user(username):
    pass

@profile.route('/<string:username>/unfollow', methods=['DELETE'])
def unfollow_user(username):
    pass
