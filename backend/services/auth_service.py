import jwt
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from models import db, Player, Session


class AuthService:
    """Сервис для аутентификации и работы с JWT"""
    
    @staticmethod
    def generate_tokens(player_id):
        """Генерация access и refresh токенов"""
        access_payload = {
            'player_id': str(player_id),
            'type': 'access',
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        
        refresh_token = secrets.token_urlsafe(64)
        
        access_token = jwt.encode(
            access_payload,
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        return access_token, refresh_token
    
    @staticmethod
    def verify_access_token(token):
        """Проверка access токена"""
        try:
            payload = jwt.decode(
                token,
                current_app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            
            if payload.get('type') != 'access':
                return None
            
            return payload.get('player_id')
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def create_session(player_id, refresh_token, user_agent=None, ip_address=None):
        """Создать сессию в БД"""
        session = Session.create(
            player_id=player_id,
            refresh_token=refresh_token,
            user_agent=user_agent,
            ip_address=ip_address
        )
        db.session.add(session)
        db.session.commit()
        return session
    
    @staticmethod
    def refresh_tokens(refresh_token):
        """Обновить токены по refresh токену"""
        session = Session.query.filter_by(refresh_token=refresh_token).first()
        
        if not session or session.is_expired:
            return None, None
        
        session.last_used = datetime.utcnow()
        db.session.commit()
        
        return AuthService.generate_tokens(session.player_id)
    
    @staticmethod
    def revoke_session(refresh_token):
        """Удалить сессию (logout)"""
        session = Session.query.filter_by(refresh_token=refresh_token).first()
        if session:
            db.session.delete(session)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def revoke_all_sessions(player_id):
        """Удалить все сессии игрока"""
        Session.query.filter_by(player_id=player_id).delete()
        db.session.commit()


def require_auth(f):
    """Decorator для защиты endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'error': 'Требуется аутентификация'}), 401
        
        token = auth_header.split(' ')[1]
        player_id = AuthService.verify_access_token(token)
        
        if not player_id:
            return jsonify({'success': False, 'error': 'Неверный или истёкший токен'}), 401
        
        player = Player.query.filter_by(id=player_id).first()
        if not player:
            return jsonify({'success': False, 'error': 'Игрок не найден'}), 404
        
        request.current_player = player
        return f(*args, **kwargs)
    
    return decorated_function


def optional_auth(f):
    """Decorator для опциональной аутентификации"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            player_id = AuthService.verify_access_token(token)
            
            if player_id:
                player = Player.query.filter_by(id=player_id).first()
                request.current_player = player if player else None
            else:
                request.current_player = None
        else:
            request.current_player = None
        
        return f(*args, **kwargs)
    
    return decorated_function
