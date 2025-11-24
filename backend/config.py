import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Базовая конфигурация"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # PostgreSQL
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    
    # SQLAlchemy Engine Options
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,  # Проверяет соединение перед использованием
        'pool_recycle': 300,    # Переиспользует соединения каждые 5 минут
        'pool_size': 5,         # Размер пула (уменьшен для Replit)
        'max_overflow': 5,      # Максимальное количество дополнительных соединений
        'connect_args': {
            'connect_timeout': 10
        }
    }
    
    # MongoDB (SquadJS statistics)
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'SquadJS')
    
    # Authentication
    STEAM_API_KEY = os.getenv('STEAM_API_KEY')
    DISCORD_CLIENT_ID = os.getenv('DISCORD_CLIENT_ID')
    DISCORD_CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET')
    
    # Uploads
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = 'static/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
    
    # Admin Steam IDs (захардкожены)
    ADMIN_STEAM_IDS = [
        '76561199104736343',  # Админ 1
        '76561198046223350',  # Админ 2
        '76561198890001608'   # Владелец проекта
    ]


class DevelopmentConfig(Config):
    """Конфигурация для разработки"""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    """Конфигурация для продакшена"""
    DEBUG = False
    SQLALCHEMY_ECHO = False


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
