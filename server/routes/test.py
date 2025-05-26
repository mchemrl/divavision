from flask import Blueprint, jsonify
from server.db import get_connection

test = Blueprint('test', __name__)

@test.route('/', methods=['GET'])
def get_genres():
    with get_connection() as conn:
        if conn is None:
            return jsonify({'error': 'Database connection failed'}), 500
        with conn.cursor() as cur:
            cur.execute("select genre_id, name from genres")
            rows = cur.fetchall()
            genres = [{'genre_id': row[0], 'name': row[1]} for row in rows]
            return jsonify(genres), 200

@test.route('/testemail')
def test_email():
    from ..utils.email_verification import send_verification_email
    send_verification_email("mcchemro@gmail.com", "123456")
    return "Test email sent"
