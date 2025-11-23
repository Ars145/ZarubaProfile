import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import config
from models import db


def create_app(config_name=None):
    """Application factory"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Инициализация расширений
    db.init_app(app)
    CORS(app, 
         resources={r"/api/*": {
             "origins": "*",
             "allow_headers": ["Content-Type"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "supports_credentials": True
         }})
    
    # Инициализация MongoDB
    from services.mongo_service import init_mongo
    init_mongo(app)
    
    # Регистрация blueprints
    from routes import api
    from routes import auth
    from routes import uploads
    from routes import players
    
    app.register_blueprint(api)
    app.register_blueprint(auth.bp)
    app.register_blueprint(uploads.bp)
    app.register_blueprint(players.bp)
    
    # Создание таблиц БД (PostgreSQL)
    with app.app_context():
        db.create_all()
    
    # Базовый маршрут
    @app.route('/')
    def index():
        return jsonify({
            'name': 'ZARUBA API',
            'version': '1.0.0',
            'status': 'running'
        })
    
    # Health check
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'}), 200
    
    return app


# Создаем app на верхнем уровне для gunicorn
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
