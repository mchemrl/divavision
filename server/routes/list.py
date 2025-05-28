import requests
from flask import Blueprint, session, jsonify, request
from ..utils.decorators import login_required
from ..services.list_service import create_list

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

    new_list = create_list(user_id, title, description, picture_url)

    return jsonify({'message': 'list created', 'list': new_list}), 201