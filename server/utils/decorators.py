import functools

from flask import jsonify, g

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return jsonify({'error': 'not logged in'}), 400
        return view(**kwargs)

    return wrapped_view