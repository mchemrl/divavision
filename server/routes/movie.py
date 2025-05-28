import requests
from flask import Blueprint, session, jsonify
from ..utils.decorators import login_required

movie = Blueprint('movie', __name__)