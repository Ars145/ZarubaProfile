from flask import Blueprint

# Создаем Blueprint для API
api = Blueprint('api', __name__, url_prefix='/api')

# Импортируем маршруты
from . import clans, stats

__all__ = ['api']
