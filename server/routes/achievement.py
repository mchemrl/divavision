from flask import Blueprint, jsonify, request
from ..services.achievement_service import fetch_achievements

achievement = Blueprint('achievement', __name__)

@achievement.route('/', methods=['GET'])
def get_achievements():
    achievements = fetch_achievements()
    return jsonify(achievements), 200

