from flask import Blueprint
from .auth import auth
from .profile import profile
from .list import list
from .movie import movie
from .review import review
from .achievement import achievement
from .feed import feed
from .rec import rec

routes = Blueprint('routes', __name__, url_prefix='/')

routes.register_blueprint(auth, url_prefix='/auth')
routes.register_blueprint(profile, url_prefix='/profile')
routes.register_blueprint(list, url_prefix='/list')
routes.register_blueprint(movie, url_prefix='/movie')
routes.register_blueprint(review, url_prefix='/review')
routes.register_blueprint(achievement, url_prefix='/achievement')
routes.register_blueprint(feed, url_prefix='/feed')
routes.register_blueprint(rec, url_prefix='/rec')