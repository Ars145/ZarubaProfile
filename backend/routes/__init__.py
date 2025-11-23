from flask import Blueprint

# Создаем Blueprint для API
api = Blueprint('api', __name__, url_prefix='/api')

# Импортируем маршруты
from . import auth, clans, players, stats, uploads

__all__ = ['api']
