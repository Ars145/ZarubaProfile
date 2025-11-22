from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from . import api
from ..models import db, Clan, ClanMember, Player


@api.route('/clans', methods=['GET'])
def get_clans():
    """Получить список всех кланов"""
    try:
        clans = Clan.query.order_by(Clan.created_at.desc()).all()
        return jsonify({
            'success': True,
            'clans': [clan.to_dict() for clan in clans]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>', methods=['GET'])
def get_clan(clan_id):
    """Получить информацию о конкретном клане"""
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        return jsonify({
            'success': True,
            'clan': clan.to_dict(include_members=True)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans', methods=['POST'])
def create_clan():
    """Создать новый клан"""
    try:
        data = request.get_json(silent=True)
        
        # Проверка валидности JSON
        if not data or not isinstance(data, dict):
            return jsonify({
                'success': False,
                'error': 'Невалидный JSON или отсутствует тело запроса'
            }), 400
        
        # Валидация обязательных полей
        if not data.get('name') or not data.get('tag'):
            return jsonify({
                'success': False,
                'error': 'Название и тег клана обязательны'
            }), 400
        
        # Проверка допустимых значений theme
        theme = data.get('theme', 'orange')
        if theme not in ['orange', 'blue', 'yellow']:
            return jsonify({
                'success': False,
                'error': 'Недопустимое значение theme. Разрешены: orange, blue, yellow'
            }), 400
        
        # Создание клана
        clan = Clan(
            name=data['name'],
            tag=data['tag'],
            description=data.get('description'),
            theme=theme,
            banner_url=data.get('bannerUrl'),
            logo_url=data.get('logoUrl'),
            requirements=data.get('requirements', {})
        )
        
        db.session.add(clan)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'clan': clan.to_dict()
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Клан с таким тегом уже существует'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>', methods=['PUT'])
def update_clan(clan_id):
    """Обновить информацию о клане"""
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        data = request.get_json(silent=True)
        
        # Проверка валидности JSON
        if not data or not isinstance(data, dict):
            return jsonify({
                'success': False,
                'error': 'Невалидный JSON или отсутствует тело запроса'
            }), 400
        
        # Обновляем только переданные поля
        if 'name' in data:
            clan.name = data['name']
        if 'tag' in data:
            clan.tag = data['tag']
        if 'description' in data:
            clan.description = data['description']
        if 'theme' in data:
            if data['theme'] not in ['orange', 'blue', 'yellow']:
                return jsonify({
                    'success': False,
                    'error': 'Недопустимое значение theme'
                }), 400
            clan.theme = data['theme']
        if 'bannerUrl' in data:
            clan.banner_url = data['bannerUrl']
        if 'logoUrl' in data:
            clan.logo_url = data['logoUrl']
        if 'requirements' in data:
            clan.requirements = data['requirements']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'clan': clan.to_dict()
        }), 200
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Клан с таким тегом уже существует'
        }), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>', methods=['DELETE'])
def delete_clan(clan_id):
    """Удалить клан"""
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        db.session.delete(clan)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Клан успешно удален'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@api.route('/clans/<clan_id>/members', methods=['GET'])
def get_clan_members(clan_id):
    """Получить список участников клана"""
    try:
        clan = Clan.query.get(clan_id)
        if not clan:
            return jsonify({
                'success': False,
                'error': 'Клан не найден'
            }), 404
        
        members = ClanMember.query.filter_by(clan_id=clan_id).all()
        
        return jsonify({
            'success': True,
            'members': [member.to_dict() for member in members]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
