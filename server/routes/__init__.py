from flask import Blueprint
from .auth import auth
from .profile import profile
from .test import test

routes = Blueprint('routes', __name__, url_prefix='/')

routes.register_blueprint(auth, url_prefix='/auth')
routes.register_blueprint(profile, url_prefix='/profile')
routes.register_blueprint(test, url_prefix='/test')

