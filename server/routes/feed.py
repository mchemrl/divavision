from flask import Blueprint, session, jsonify, request
from ..utils.decorators import login_required
from ..services.feed_service import fetch_feed

feed = Blueprint('feed', __name__)

@feed.route('/', methods=['GET'])
@login_required
def get_feed():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'unauthorized'}), 401

    feed_events = fetch_feed(user_id)
    return jsonify(feed_events)