from flask import Flask
from flask_cors import CORS
from .utils.config import Config
from .utils.oauth import init_oauth, oauth

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app,
         resources={r"/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE"],
             "supports_credentials": True,
         }})

    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_PATH'] = '/'

    init_oauth(app)
    print("Final OAuth clients: %r", list(oauth._clients.keys()))

    from server.routes import routes
    app.register_blueprint(routes)
    return app

