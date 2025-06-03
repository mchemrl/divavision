from flask import Blueprint, request, session, g, jsonify, url_for
from werkzeug.security import check_password_hash
from ..services.auth_service import fetch_user_by_id, fetch_user_by_identifier, create_user, create_user_if_not_exists, create_basic_lists
from ..utils.oauth import oauth
from ..utils.email_verification import generate_verification_code, send_verification_email, store_verification_code, verification_codes


auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'username, email and password are required'}), 400

    if fetch_user_by_identifier(email) or fetch_user_by_identifier(username):
        return jsonify({'error': 'username or email already exists'}), 400

    code = generate_verification_code()
    store_verification_code(email, {
        'code': code,
        'username': username,
        'password': password,
    })
    send_verification_email(email,code)

    return jsonify({'message': 'verification code sent'}), 200

@auth.route('/verify', methods=['POST'])
def verify_email_code():
    data = request.json
    code = data.get('code')
    email = data.get('email')

    stored = verification_codes.get(email)
    if not stored:
        return jsonify({'error': 'no verification pending for this email'}), 400
    if stored['code'] != code:
        return jsonify({'error': 'invalid verification code'}), 400

    user_id = create_user(stored['username'], email, stored['password'])
    create_basic_lists(user_id)
    verification_codes.pop(email, None)
    return jsonify({'message': 'email verified, user registered', 'user_id': user_id}), 201


@auth.route('/login', methods=['POST'])
def login():
    if g.get('user') is not None:
        return jsonify({'error': 'user logged in'}), 400

    data = request.json
    identifier = data.get('username') or data.get('email')
    password = data.get('password')
    print('blabla')

    if not identifier:
        return jsonify({'error': 'username or email is required'}), 400
    if not password:
        return jsonify({'error': 'password is required'}), 400

    user = fetch_user_by_identifier(identifier)
    if user is None or not check_password_hash(user[2], password):
        return jsonify({'error': 'incorrect credentials'}), 400

    session.clear()
    session['user_id'] = user[0]
    session.permanent = False
    print(session.get('user_id'))
    print(session.get('user_id'))
    print(session.get('user_id'))

    return jsonify({'message': 'login successful', 'user_id': user[0], 'username': user[1]}), 200


@auth.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    print(user_id)
    if user_id is None:
        g.user = None
    else:
        g.user = fetch_user_by_id(user_id)

@auth.route('/logout', methods=['POST'])
def logout():
    session.clear()
    print('logout')
    return jsonify({'message': 'logged out successfully'}), 200

@auth.route('/login/google')
def login_with_google():
    redirect_uri = url_for('routes.auth.authorize_google', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@auth.route('/login/google/callback')
def authorize_google():
    token = oauth.google.authorize_access_token()
    user_info = oauth.google.get('https://openidconnect.googleapis.com/v1/userinfo').json()

    email = user_info['email']
    username = user_info.get('name', email.split('@')[0])
    profile_pic_url = user_info.get('picture')

    user_id = create_user_if_not_exists(username, email, profile_pic_url)
    create_basic_lists(user_id)

    session.clear()
    session['user_id'] = user_id

    return redirect(f"{FRONTEND_URL}/discover?user_id={user_id}&username={username}")
