from flask import Blueprint, request, session, g, jsonify, url_for
from psycopg2 import IntegrityError
from werkzeug.security import check_password_hash
from ..services.auth_service import fetch_user_by_id, fetch_user_by_identifier, create_user
from server.app.oauth import oauth
from ..services.auth_service import create_user_if_not_exists
from ..utils.email_verification import generate_verification_code, send_verification_email, store_verification_code

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'username, email and password are required'}), 400

    try:
        user_id = create_user(username, email, password)
        code = generate_verification_code()
        store_verification_code(email, code)
        send_verification_email(email, code)
    except IntegrityError:
        return jsonify({'error': 'username or email already exists'}), 400

    return jsonify({'message': 'user created successfully', 'user_id': user_id}), 201

@auth.route('/login', methods=['POST'])
def login():
    if g.get('user') is not None:
        return jsonify({'error': 'user logged in'}), 400

    data = request.json
    identifier = data.get('username') or data.get('email')
    password = data.get('password')

    if not identifier:
        return jsonify({'error': 'username or email is required'}), 400
    if not password:
        return jsonify({'error': 'password is required'}), 400

    user = fetch_user_by_identifier(identifier)
    if user is None or not check_password_hash(user[3], password):
        return jsonify({'error': 'incorrect credentials'}), 400

    session.clear()
    session['user_id'] = user[0]
    return jsonify({'message': 'login successful', 'user_id': user[0], 'username': user[1]}), 200


@auth.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
    else:
        g.user = fetch_user_by_id(user_id)


@auth.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'logged out successfully'}), 200

@auth.route('/login/google')
def login_with_google():
    print("Redirecting to Google OAuth...")
    redirect_uri = url_for('routes.auth.authorize_google', _external=True)
    print("Redirect URI:", redirect_uri)
    return oauth.google.authorize_redirect(redirect_uri)

@auth.route('/login/google/callback')
def authorize_google():
    token = oauth.google.authorize_access_token()
    user_info = oauth.google.get('https://openidconnect.googleapis.com/v1/userinfo').json()

    email = user_info['email']
    username = user_info.get('name', email.split('@')[0])
    profile_pic_url = user_info.get('picture')

    user_id = create_user_if_not_exists(username, email, profile_pic_url)

    session.clear()
    session['user_id'] = user_id
    return jsonify({'message': 'google login successful', 'user_id': user_id, 'username': username})