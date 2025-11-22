from flask import Blueprint, jsonify, request
from models import db
from models.player import Player
from services.auth_service import require_auth

bp = Blueprint('players', __name__, url_prefix='/api/players')


@bp.route('/me', methods=['GET'])
@require_auth
def get_current_player():
    """Получить профиль текущего игрока"""
    player = request.current_player
    return jsonify({
        'success': True,
        'player': player.to_dict()
    })


@bp.route('/me', methods=['PUT'])
@require_auth
def update_current_player():
    """Обновить профиль текущего игрока"""
    player = request.current_player
    data = request.get_json()
    
    if 'username' in data:
        player.username = data['username']
    
    if 'avatarUrl' in data:
        player.avatar_url = data['avatarUrl']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'player': player.to_dict()
    })


@bp.route('/<player_id>', methods=['GET'])
def get_player(player_id):
    """Получить профиль игрока по ID"""
    player = Player.query.filter_by(id=player_id).first()
    
    if not player:
        return jsonify({
            'success': False,
            'error': 'Игрок не найден'
        }), 404
    
    return jsonify({
        'success': True,
        'player': player.to_dict()
    })


@bp.route('/steam/<steam_id>', methods=['GET'])
def get_player_by_steam_id(steam_id):
    """Получить профиль игрока по Steam ID"""
    player = Player.query.filter_by(steam_id=steam_id).first()
    
    if not player:
        return jsonify({
            'success': False,
            'error': 'Игрок не найден'
        }), 404
    
    return jsonify({
        'success': True,
        'player': player.to_dict()
    })


@bp.route('', methods=['GET'])
def get_players():
    """Получить список всех игроков"""
    players = Player.query.all()
    
    return jsonify({
        'success': True,
        'players': [p.to_dict() for p in players]
    })
