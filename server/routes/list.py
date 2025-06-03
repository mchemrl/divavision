from flask import Blueprint, session, jsonify, request
from ..utils.decorators import login_required
from ..services.list_service import create_list, delete_list, change_list, fetch_list_by_id, fetch_lists, add_movie, delete_movie

list = Blueprint('list', __name__)

@list.route('/', methods=['POST'])
@login_required
def add_list():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    picture_url = data.get('picture_url')

    if not title:
        return jsonify({'error': 'title is required'}), 400

    create_list(user_id, title, description, picture_url)

    return jsonify({'message': 'list created'}), 201

@list.route('/<int:list_id>', methods=['DELETE'])
@login_required
def remove_list(list_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401

    delete_list(list_id, user_id)

    return jsonify({'message': 'list deleted'}), 200

@list.route('/<int:list_id>', methods=['PUT'])
@login_required
def update_list(list_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    picture_url = data.get('picture_url')

    if not title:
        return jsonify({'error': 'title is required'}), 400

    change_list(list_id, user_id, title, description, picture_url)

    return jsonify({'message': 'list updated'}), 200

@list.route('/', methods=['GET'])
def get_lists():
    user_id = request.args.get('user_id')
    search = request.args.get('search')
    sort_by = request.args.get('sort_by', 'created_at')
    order = request.args.get('order', 'desc')

    lists = fetch_lists(user_id, search, sort_by, order)

    return jsonify(lists), 200

@list.route('/<int:list_id>', methods=['GET'])
def get_single_list(list_id):
    list_data = fetch_list_by_id(list_id)
    if not list_data:
        return jsonify({'error': 'list not found'}), 404

    return jsonify({'list': list_data}), 200

@list.route('/<int:list_id>/movies', methods=['POST'])
@login_required
def add_movie_to_list(list_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401

    data = request.get_json()
    movie_id = data.get('movie_id')

    if not movie_id:
        return jsonify({'error': 'movie_id is required'}), 400

    add_movie(list_id, movie_id)
    return jsonify({'message': 'movie added to list'}), 201

#def add_

@list.route('/<int:list_id>/movies/<int:movie_id>', methods=['DELETE'])
@login_required
def remove_movie_from_list(list_id, movie_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401

    delete_movie(list_id, movie_id)
    return jsonify({'message': 'movie removed from list'}), 200